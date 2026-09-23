#!/usr/bin/env python3
"""Static UI + same-origin SOAP gateway to PayamGostar CRM."""

from __future__ import annotations

import http.client
import ipaddress
import json
import os
import re
import socket
import ssl
import time
from collections import deque
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Lock
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent

MAX_BODY = 256 * 1024
MAX_RESPONSE = 2 * 1024 * 1024
RATE_MAX = 120
RATE_WINDOW_S = 60.0

ALLOWED_PATHS = frozenset(
    {
        "/Services/IAuthentication.svc",
        "/Services/API/IForm.svc",
        "/Services/API/IPerson.svc",
        "/Services/API/IOrganization.svc",
        "/Services/API/IIdentity.svc",
        "/Services/API/IAppointment.svc",
        "/Services/API/ITask.svc",
        "/Services/API/ITicket.svc",
        "/Services/API/IContract.svc",
        "/Services/API/IOpportunity.svc",
        "/Services/API/IInvoice.svc",
        "/Services/API/IPayment.svc",
        "/Services/API/IPhoneLog.svc",
        "/Services/API/IBusinessNote.svc",
        "/Services/API/IProduct.svc",
        "/Services/API/IInventory.svc",
        "/Services/API/IUser.svc",
        "/Services/API/IMoneyAccount.svc",
        "/Services/API/ICrmObjectType.svc",
    }
)

STATIC_FILES = {
    "/": "index.html",
    "/index.html": "index.html",
    "/app.js": "app.js",
    "/styles.css": "styles.css",
    "/favicon-32.png": "favicon-32.png",
    "/favicon-192.png": "favicon-192.png",
    "/apple-touch-icon.png": "apple-touch-icon.png",
}

MIME = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".png": "image/png",
}

BLOCKED_HOST_SUFFIXES = (
    ".local",
    ".internal",
    ".intranet",
    ".corp",
    ".home",
    ".lan",
    ".localhost",
    ".localdomain",
)

HOST_RE = re.compile(
    r"^(?=.{1,253}$)(?!-)[A-Za-z0-9-]{1,63}(?<!-)"
    r"(?:\.(?!-)[A-Za-z0-9-]{1,63}(?<!-))+$"
)
SOAP_ACTION_RE = re.compile(
    r'^"?http://tempuri\.org/[A-Za-z][A-Za-z0-9]*/[A-Za-z][A-Za-z0-9]*"?$'
)
SOAP_ENVELOPE_RE = re.compile(
    rb"^\s*(<\?xml\b[^>]*\?>\s*)?<([A-Za-z0-9]+:)?Envelope\b",
    re.IGNORECASE,
)
REQUEST_XML_TYPES = frozenset({"text/xml", "application/xml", "application/soap+xml"})
RESPONSE_XML_TYPES = frozenset(
    {"text/xml", "application/xml", "application/soap+xml", "text/plain"}
)

CSP = (
    "default-src 'self'; "
    "script-src 'self'; "
    "style-src 'self' https://fonts.googleapis.com; "
    "font-src https://fonts.gstatic.com; "
    "img-src 'self'; "
    "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; "
    "frame-ancestors 'none'; "
    "base-uri 'self'; "
    "form-action 'self'"
)


def load_dotenv() -> dict[str, str]:
    path = ROOT / ".env"
    data: dict[str, str] = {}
    if not path.exists():
        return data
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        data[key.strip()] = value.strip().strip('"').strip("'")
    return data


DOTENV = load_dotenv()


def env(name: str, *aliases: str, default: str = "") -> str:
    for key in (name, *aliases):
        if key in os.environ and os.environ[key] != "":
            return os.environ[key]
        if key in DOTENV and DOTENV[key] != "":
            return DOTENV[key]
    return default


HOST = env("HOST", default="0.0.0.0")
PORT = int(env("PORT", default="8080"))
SOAP_TIMEOUT = int(env("SOAP_TIMEOUT", default="45"))


class RateLimiter:
    def __init__(self, max_hits: int, window_s: float) -> None:
        self.max_hits = max_hits
        self.window_s = window_s
        self._lock = Lock()
        self._hits: dict[str, deque[float]] = {}

    def allow(self, ip: str) -> bool:
        now = time.monotonic()
        with self._lock:
            q = self._hits.get(ip)
            if q is None:
                q = deque()
                self._hits[ip] = q
            while q and now - q[0] > self.window_s:
                q.popleft()
            if len(q) >= self.max_hits:
                return False
            q.append(now)
            if len(self._hits) > 8000:
                stale = [
                    key
                    for key, hits in self._hits.items()
                    if not hits or now - hits[-1] > self.window_s
                ]
                for key in stale[:2000]:
                    self._hits.pop(key, None)
            return True


LIMITER = RateLimiter(RATE_MAX, RATE_WINDOW_S)


def normalize_url(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return url
    if url.startswith("//"):
        return "https:" + url
    if "://" not in url:
        return "https://" + url
    return url.rstrip("/")


def is_public_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    if ip.is_global:
        return True
    return False


def validate_hostname(host: str) -> str:
    if not host:
        raise ValueError("Invalid CRM host")
    try:
        host = host.encode("idna").decode("ascii")
    except UnicodeError as e:
        raise ValueError("Invalid CRM host") from e
    host = host.lower().rstrip(".")
    if host in {"localhost", "localhost.localdomain"}:
        raise ValueError("Invalid CRM host")
    if any(host.endswith(suf) for suf in BLOCKED_HOST_SUFFIXES):
        raise ValueError("Invalid CRM host")
    try:
        ipaddress.ip_address(host.strip("[]"))
    except ValueError:
        pass
    else:
        raise ValueError("CRM host must be a domain name")
    if not HOST_RE.match(host):
        raise ValueError("Invalid CRM host")
    return host


def resolve_public_ip(host: str) -> str:
    try:
        infos = socket.getaddrinfo(host, 443, proto=socket.IPPROTO_TCP)
    except socket.gaierror as e:
        raise ValueError("CRM host could not be resolved") from e
    ips: list[ipaddress.IPv4Address | ipaddress.IPv6Address] = []
    for _, _, _, _, sockaddr in infos:
        ips.append(ipaddress.ip_address(sockaddr[0]))
    if not ips:
        raise ValueError("CRM host could not be resolved")
    for ip in ips:
        if not is_public_ip(ip):
            raise ValueError("CRM host must resolve to a public address")
    for ip in ips:
        if ip.version == 4:
            return str(ip)
    return str(ips[0])


def resolve_target(base: str, path: str) -> str:
    parsed = urlparse(normalize_url(base))
    if parsed.scheme != "https":
        raise ValueError("Only https CRM URLs are allowed")
    if parsed.username or parsed.password:
        raise ValueError("Invalid CRM URL")
    if parsed.port not in (None, 443):
        raise ValueError("Only https port 443 is allowed")
    if not parsed.hostname:
        raise ValueError("Invalid CRM host")
    host = validate_hostname(parsed.hostname)
    soap_path = (path or "").strip()
    if soap_path not in ALLOWED_PATHS:
        raise ValueError("SOAP path is not allowed")
    return f"https://{host}{soap_path}"


def request_content_type(value: str) -> str | None:
    mime = (value or "").split(";", 1)[0].strip().lower()
    if mime not in REQUEST_XML_TYPES:
        return None
    return "text/xml; charset=utf-8" if mime == "text/xml" else value.split(";")[0].strip()


def sanitize_response_type(value: str) -> str:
    mime = (value or "").split(";", 1)[0].strip().lower()
    if mime in RESPONSE_XML_TYPES:
        return value or "text/xml; charset=utf-8"
    return "text/xml; charset=utf-8"


def is_soap_envelope(body: bytes) -> bool:
    return bool(SOAP_ENVELOPE_RE.match(body[:2048]))


def soap_action_ok(value: str) -> bool:
    return bool(value and SOAP_ACTION_RE.match(value.strip()))


def forward_soap(target: str, body: bytes, content_type: str, soap_action: str) -> tuple[int, str, bytes]:
    parsed = urlparse(target)
    host = parsed.hostname
    if not host:
        raise ValueError("Invalid CRM host")
    ip = resolve_public_ip(host)
    # On-prem PayamGostar often uses a self-signed cert; still pin SNI to the hostname.
    ctx = ssl._create_unverified_context()
    sock = socket.create_connection((ip, 443), timeout=SOAP_TIMEOUT)
    try:
        ssock = ctx.wrap_socket(sock, server_hostname=host)
    except Exception:
        sock.close()
        raise
    conn = http.client.HTTPSConnection(host, timeout=SOAP_TIMEOUT, context=ctx)
    conn.sock = ssock
    headers = {
        "Host": host,
        "Content-Type": content_type,
        "Accept": "text/xml, application/soap+xml, application/xml, */*",
        "Connection": "close",
        "SOAPAction": soap_action,
    }
    try:
        conn.request("POST", parsed.path, body=body, headers=headers)
        resp = conn.getresponse()
        chunks: list[bytes] = []
        total = 0
        while True:
            chunk = resp.read(65536)
            if not chunk:
                break
            total += len(chunk)
            if total > MAX_RESPONSE:
                raise ValueError("Response too large")
            chunks.append(chunk)
        return resp.status, sanitize_response_type(resp.headers.get("Content-Type", "")), b"".join(chunks)
    finally:
        conn.close()


class Handler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Security-Policy", CSP)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("X-Frame-Options", "DENY")
        self.send_header("Referrer-Policy", "no-referrer")
        self.send_header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
        super().end_headers()

    def client_ip(self) -> str:
        remote = self.client_address[0]
        try:
            ip = ipaddress.ip_address(remote)
        except ValueError:
            return remote
        if ip.is_loopback or ip.is_private:
            forwarded = (self.headers.get("X-Forwarded-For") or "").split(",")[0].strip()
            if forwarded:
                return forwarded
        return remote

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._json(200, {"ok": True})
            return
        if parsed.path == "/api/config":
            self._json(200, {})
            return
        name = STATIC_FILES.get(parsed.path)
        if not name:
            self.send_error(404, "Not found")
            return
        path = (ROOT / name).resolve()
        if not path.is_file() or not path.is_relative_to(ROOT):
            self.send_error(404, "Not found")
            return
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", MIME.get(path.suffix, "application/octet-stream"))
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/soap":
            self.send_error(404, "Not found")
            return
        if not LIMITER.allow(self.client_ip()):
            self._json_error(429, "Too many requests")
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._json_error(400, "Invalid Content-Length")
            return
        if length <= 0 or length > MAX_BODY:
            self._json_error(413, "Request too large")
            return
        body = self.rfile.read(length)
        if len(body) != length or not is_soap_envelope(body):
            self._json_error(400, "Body must be a SOAP envelope")
            return

        content_type = request_content_type(self.headers.get("Content-Type", ""))
        if not content_type:
            self._json_error(400, "Content-Type must be XML")
            return
        soap_action = (self.headers.get("SOAPAction") or "").strip()
        if not soap_action_ok(soap_action):
            self._json_error(400, "Invalid SOAPAction")
            return

        qs = parse_qs(parsed.query)
        try:
            target = resolve_target(
                base=(qs.get("base") or [""])[0],
                path=(qs.get("path") or [""])[0],
            )
        except ValueError as e:
            self._json_error(400, str(e))
            return

        try:
            status, ctype, data = forward_soap(target, body, content_type, soap_action)
        except ValueError as e:
            self._json_error(502, str(e) if str(e) in {"Response too large", "CRM host must resolve to a public address", "CRM host could not be resolved"} else "SOAP gateway error")
            return
        except Exception as e:  # noqa: BLE001
            print(f"SOAP gateway error: {type(e).__name__}", flush=True)
            self._json_error(502, "SOAP gateway error")
            return

        self.send_response(status)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _json(self, code: int, obj: dict):
        payload = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def _json_error(self, code: int, message: str):
        self._json(code, {"error": message})

    def log_message(self, fmt, *args):
        print(f"[{self.log_date_time_string()}] {fmt % args}", flush=True)


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Serving {ROOT} on http://{HOST}:{PORT}/", flush=True)
    print("GET /  |  GET /api/config  |  POST /api/soap?base=&path=  |  GET /health", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.", flush=True)


if __name__ == "__main__":
    main()
