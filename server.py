#!/usr/bin/env python3
"""Fund BI — static UI + same-origin SOAP gateway to PayamGostar CRM."""

from __future__ import annotations

import json
import os
import ssl
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urljoin, urlparse

ROOT = Path(__file__).resolve().parent
SSL_CTX = ssl._create_unverified_context()


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


def normalize_url(url: str) -> str:
    url = (url or "").strip()
    if not url:
        return url
    if url.startswith("//"):
        return "https:" + url
    if "://" not in url:
        return "https://" + url
    return url.rstrip("/")


def resolve_target(base: str, path: str = "", full_url: str = "") -> str:
    """Build SOAP target from client-provided base+path or full url (https only)."""
    if full_url:
        target = normalize_url(full_url)
    else:
        base = normalize_url(base)
        if not base:
            raise ValueError("Missing CRM base URL")
        path = (path or "/").strip()
        if not path.startswith("/"):
            path = "/" + path
        target = urljoin(base + "/", path.lstrip("/"))

    parsed = urlparse(target)
    if parsed.scheme != "https" or not parsed.hostname:
        raise ValueError("Only https CRM URLs are allowed")
    return target


HOST = env("HOST", default="0.0.0.0")
PORT = int(env("PORT", default="8080"))
SOAP_TIMEOUT = int(env("SOAP_TIMEOUT", default="45"))


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/health":
            self._json(200, {"ok": True})
            return
        if parsed.path == "/api/config":
            # No secrets or CRM address — enter them in the UI
            self._json(200, {})
            return
        super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path not in ("/api/soap", "/proxy"):
            self.send_error(404, "Not found")
            return

        qs = parse_qs(parsed.query)
        length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(length) if length else b""

        try:
            target = resolve_target(
                base=(qs.get("base") or [""])[0],
                path=(qs.get("path") or [""])[0],
                full_url=(qs.get("url") or [""])[0],
            )
        except ValueError as e:
            self._json_error(400, str(e))
            return

        headers = {
            "Content-Type": self.headers.get("Content-Type", "text/xml; charset=utf-8"),
            "Accept": "text/xml, application/soap+xml, */*",
        }
        if self.headers.get("SOAPAction"):
            headers["SOAPAction"] = self.headers["SOAPAction"]

        try:
            req = urllib.request.Request(target, data=body, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=SOAP_TIMEOUT, context=SSL_CTX) as resp:
                data = resp.read()
                self.send_response(resp.status)
                ctype = resp.headers.get("Content-Type", "text/xml; charset=utf-8")
                self.send_header("Content-Type", ctype)
                self.send_header("Content-Length", str(len(data)))
                self.end_headers()
                self.wfile.write(data)
        except urllib.error.HTTPError as e:
            data = e.read()
            self.send_response(e.code)
            self.send_header(
                "Content-Type",
                e.headers.get("Content-Type", "text/plain; charset=utf-8"),
            )
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
        except Exception as e:  # noqa: BLE001
            msg = f"SOAP gateway error ({target}): {e}".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(msg)))
            self.end_headers()
            self.wfile.write(msg)

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
