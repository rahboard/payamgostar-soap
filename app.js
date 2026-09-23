(() => {
  const STORAGE_KEY = "payamgostar-form-viewer";
  const DEFAULT_QUERY = 'CreateDatePersian > "1405/01/01"';
  const SOAP_TIMEOUT_MS = 35000;
  const TYPES_TIMEOUT_MS = 15000;
  const MAX_PAGE_BUTTONS = 5;

  const FIELD_LABELS = {
    CrmId: "شناسه",
    Id: "شناسه",
    Subject: "عنوان",
    Description: "توضیحات",
    FirstName: "نام",
    LastName: "نام خانوادگی",
    NickName: "نام نمایشی",
    Name: "نام",
    Number: "شماره",
    Code: "کد",
    UserName: "نام کاربری",
    Username: "نام کاربری",
    Email: "ایمیل",
    Phone: "تلفن",
    PhoneNumber: "شماره تلفن",
    CrmObjectTypeCode: "کد نوع",
    CrmObjectTypeName: "نام نوع",
    CrmObjectType: "نوع موجودیت",
    UserKey: "کلید کاربر",
    RefId: "RefId",
    Stage: "مرحله",
    StageId: "شناسه مرحله",
    IdentityId: "شناسه هویت",
    IdentityNickName: "هویت",
    CreatDate: "تاریخ ایجاد",
    CreateDate: "تاریخ ایجاد",
    CreateDatePersian: "تاریخ ایجاد (شمسی)",
    ModifyDate: "تاریخ ویرایش",
    ModifyDatePersian: "تاریخ ویرایش (شمسی)",
    ProductName: "نام محصول",
    ProductCode: "کد محصول",
    InventoryId: "شناسه انبار",
    InventoryName: "نام انبار",
    StockRemain: "موجودی",
    Amount: "مبلغ",
    Total: "جمع",
    IsActive: "فعال",
    HolderName: "مسئول",
    StateName: "وضعیت",
  };

  const ENTITIES = [
    {
      id: "form",
      fa: "فرم",
      kind: "search",
      path: "/Services/API/IForm.svc",
      iface: "IForm",
      typeIndex: "Form",
      searchMethod: "SearchForm",
      searchUser: "userName",
      findMethod: "FindFormById",
      findUser: "username",
      findIdParam: "formId",
      itemTag: "FormInfo",
      findPlaceholder: "GUID فرم",
    },
    {
      id: "person",
      fa: "شخص",
      kind: "search",
      path: "/Services/API/IPerson.svc",
      iface: "IPerson",
      typeIndex: "Person",
      searchMethod: "SearchPerson",
      searchUser: "userName",
      findMethod: "FindPersonById",
      findUser: "username",
      findIdParam: "personId",
      itemTag: "PersonInfo",
      findPlaceholder: "GUID شخص",
    },
    {
      id: "organization",
      fa: "شرکت",
      kind: "search",
      path: "/Services/API/IOrganization.svc",
      iface: "IOrganization",
      typeIndex: "Organization",
      searchMethod: "SearchOrganization",
      searchUser: "userName",
      findMethod: "FindOrganizationById",
      findUser: "username",
      findIdParam: "organizationId",
      itemTag: "OrganizationInfo",
      findPlaceholder: "GUID شرکت",
    },
    {
      id: "identity",
      fa: "هویت",
      kind: "search",
      path: "/Services/API/IIdentity.svc",
      iface: "IIdentity",
      typeIndex: "Identity",
      searchMethod: "SearchIdentity",
      searchUser: "userName",
      findMethod: "FindIdentityById",
      findUser: "username",
      findIdParam: "identityId",
      itemTag: "IdentityInfo",
      findPlaceholder: "GUID هویت",
    },
    {
      id: "appointment",
      fa: "قرارملاقات",
      kind: "search",
      path: "/Services/API/IAppointment.svc",
      iface: "IAppointment",
      typeIndex: "Appointment",
      searchMethod: "SearchAppointment",
      searchUser: "userName",
      findMethod: "FindAppointmentById",
      findUser: "username",
      findIdParam: "appointmentId",
      itemTag: "AppointmentInfo",
      findPlaceholder: "GUID قرارملاقات",
    },
    {
      id: "task",
      fa: "وظیفه",
      kind: "search",
      path: "/Services/API/ITask.svc",
      iface: "ITask",
      typeIndex: "Task",
      searchMethod: "SearchTask",
      searchUser: "username",
      findMethod: "FindTaskById",
      findUser: "username",
      findIdParam: "taskId",
      itemTag: "TaskInfo",
      findPlaceholder: "GUID وظیفه",
    },
    {
      id: "ticket",
      fa: "تیکت",
      kind: "search",
      path: "/Services/API/ITicket.svc",
      iface: "ITicket",
      typeIndex: "Ticket",
      searchMethod: "SearchTicket",
      searchUser: "username",
      findMethod: "FindTicketById",
      findUser: "username",
      findIdParam: "ticketId",
      itemTag: "TicketInfo",
      findPlaceholder: "GUID تیکت",
    },
    {
      id: "contract",
      fa: "قرارداد",
      kind: "search",
      path: "/Services/API/IContract.svc",
      iface: "IContract",
      typeIndex: "Contract",
      searchMethod: "SearchContract",
      searchUser: "userName",
      findMethod: "FindContractById",
      findUser: "userName",
      findIdParam: "contractId",
      itemTag: "ContractInfo",
      findPlaceholder: "GUID قرارداد",
    },
    {
      id: "opportunity",
      fa: "فرصت",
      kind: "search",
      path: "/Services/API/IOpportunity.svc",
      iface: "IOpportunity",
      typeIndex: "Opportunity",
      searchMethod: "SearchOpportunity",
      searchUser: "userName",
      findMethod: "FindOpportunityById",
      findUser: "username",
      findIdParam: "opportunityId",
      itemTag: "OpportunityInfo",
      findPlaceholder: "GUID فرصت",
    },
    {
      id: "invoice",
      fa: "فاکتور",
      kind: "search",
      path: "/Services/API/IInvoice.svc",
      iface: "IInvoice",
      searchUser: "userName",
      findUser: "userName",
      itemTag: "InvoiceInfo",
      variants: [
        { id: "sale", fa: "فاکتور فروش", searchMethod: "SearchInvoice", findMethod: "FindInvoiceById", findIdParam: "invoiceId", typeIndex: "Invoice", findPlaceholder: "GUID فاکتور فروش" },
        { id: "quote", fa: "پیش‌فاکتور فروش", searchMethod: "SearchQuote", findMethod: "FindQuoteById", findIdParam: "quoteId", typeIndex: "Quote", findPlaceholder: "GUID پیش‌فاکتور" },
        { id: "purchase", fa: "فاکتور خرید", searchMethod: "SearchPurchaseInvoice", findMethod: "FindPurchaseInvoiceById", findIdParam: "purchInvoiceId", typeIndex: "PurchaseInvoice", findPlaceholder: "GUID فاکتور خرید" },
        { id: "returnSale", fa: "برگشت از فروش", searchMethod: "SearchReturnSaleInvoice", findMethod: "FindReturnInvoiceById", findIdParam: "returnInvoiceId", typeIndex: "ReturnInvoice", findPlaceholder: "GUID برگشت از فروش" },
        { id: "returnPurchase", fa: "برگشت از خرید", searchMethod: "SearchReturnPurchaseInvoice", findMethod: "FindReturnPurchaseInvoiceById", findIdParam: "returnPurchInvoiceId", typeIndex: "ReturnPurchaseInvoice", findPlaceholder: "GUID برگشت از خرید" },
        { id: "purchaseQuote", fa: "پیش‌فاکتور خرید", searchMethod: "SearchPurchaseQuote", findMethod: "FindPurchaseQuoteById", findIdParam: "purchQuoteId", typeIndex: "PurchaseQuote", findPlaceholder: "GUID پیش‌فاکتور خرید" },
      ],
    },
    {
      id: "payment",
      fa: "دریافت و پرداخت",
      kind: "search",
      path: "/Services/API/IPayment.svc",
      iface: "IPayment",
      searchUser: "userName",
      findUser: "userName",
      variants: [
        { id: "payment", fa: "پرداخت", searchMethod: "SearchPayment", findMethod: "FindPaymentById", findIdParam: "paymentId", itemTag: "PaymentInfo", typeIndex: "Payment", findPlaceholder: "GUID پرداخت" },
        { id: "receipt", fa: "دریافت", searchMethod: "SearchReceipt", findMethod: "FindReceiptById", findIdParam: "receiptId", itemTag: "PaymentInfo", typeIndex: "Receipt", findPlaceholder: "GUID دریافت" },
      ],
    },
    {
      id: "phonelog",
      fa: "تماس تلفنی",
      kind: "search",
      path: "/Services/API/IPhoneLog.svc",
      iface: "IPhoneLog",
      typeIndex: "PhoneCall",
      searchMethod: "SearchPhoneLog",
      searchUser: "userName",
      findMethod: "FindPhoneLogById",
      findUser: "userName",
      findIdParam: "phoneLogId",
      itemTag: "PhoneLogInfo",
      findPlaceholder: "GUID تماس",
    },
    {
      id: "note",
      fa: "یادداشت",
      kind: "lookup",
      path: "/Services/API/IBusinessNote.svc",
      iface: "IBusinessNote",
      findMethod: "GetBusinessNote",
      findUser: "userName",
      findIdParam: "crmId",
      itemTag: "BusinessNoteInfo",
      findPlaceholder: "GUID یادداشت",
    },
    {
      id: "product",
      fa: "محصولات",
      kind: "code",
      path: "/Services/API/IProduct.svc",
      iface: "IProduct",
      searchMethod: "FindProductByName",
      searchUser: "userName",
      queryParam: "name",
      queryLabel: "نام محصول",
      queryPlaceholder: "نام یا بخشی از نام",
      findMethod: "FindProductById",
      findUser: "userName",
      findIdParam: "productId",
      itemTag: "ProductInfo",
      findPlaceholder: "GUID یا کد محصول",
    },
    {
      id: "inventory",
      fa: "موجودی انبار",
      kind: "code",
      path: "/Services/API/IInventory.svc",
      iface: "IInventory",
      searchMethod: "GetRemainingStock",
      searchUser: "userName",
      queryParam: "productCode",
      queryLabel: "کد محصول",
      queryPlaceholder: "کد محصول",
      queryRequired: true,
      itemTag: "InventoryInfo",
      itemTags: ["InventoryInfo", "InventoryInfoList"],
    },
    {
      id: "users",
      fa: "کاربران",
      kind: "list",
      path: "/Services/API/IUser.svc",
      iface: "IUser",
      listMethod: "GetUserList",
      listUser: "userName",
      itemTag: "UserInfoItem",
      itemTags: ["UserInfoItem", "UserInfo"],
      findMethod: "GetUser",
      findUser: "userName",
      findIdParam: "targetUsername",
      findPlaceholder: "نام کاربری",
    },
    {
      id: "money",
      fa: "حساب‌های مالی",
      kind: "list",
      path: "/Services/API/IMoneyAccount.svc",
      iface: "IMoneyAccount",
      listMethod: "GetMoneyAccountList",
      listUser: "userName",
      itemTag: "MoneyAccountSummaryInfo",
      itemTags: ["MoneyAccountSummaryInfo", "MoneyAccountInfo"],
      paged: true,
      soapPageSize: 50,
    },
    {
      id: "crmtype",
      fa: "انواع موجودیت",
      kind: "list",
      path: "/Services/API/ICrmObjectType.svc",
      iface: "ICrmObjectType",
      listMethod: "GetCrmObjectTypeList",
      listUser: "username",
      itemTag: "CrmObjectTypeBasicInfo",
    },
    {
      id: "cardtable",
      fa: "کارتابل",
      kind: "list",
      path: "/Services/API/ICrmObjectType.svc",
      iface: "ICrmObjectType",
      listMethod: "GetCardtable",
      listUser: "username",
      itemTag: "CardtableItemInfo",
      paged: true,
      soapPageSize: 100,
    },
  ];

  const METHOD_FA = {
    SearchForm: "جستجوی فرم",
    FindFormById: "یافتن فرم با شناسه",
    SearchPerson: "جستجوی شخص",
    FindPersonById: "یافتن شخص با شناسه",
    SearchOrganization: "جستجوی شرکت",
    FindOrganizationById: "یافتن شرکت با شناسه",
    SearchIdentity: "جستجوی هویت",
    FindIdentityById: "یافتن هویت با شناسه",
    SearchAppointment: "جستجوی قرارملاقات",
    FindAppointmentById: "یافتن قرارملاقات با شناسه",
    SearchTask: "جستجوی وظیفه",
    FindTaskById: "یافتن وظیفه با شناسه",
    SearchTicket: "جستجوی تیکت",
    FindTicketById: "یافتن تیکت با شناسه",
    SearchContract: "جستجوی قرارداد",
    FindContractById: "یافتن قرارداد با شناسه",
    SearchOpportunity: "جستجوی فرصت",
    FindOpportunityById: "یافتن فرصت با شناسه",
    SearchInvoice: "جستجوی فاکتور فروش",
    FindInvoiceById: "یافتن فاکتور فروش با شناسه",
    SearchQuote: "جستجوی پیش‌فاکتور فروش",
    FindQuoteById: "یافتن پیش‌فاکتور فروش با شناسه",
    SearchPurchaseInvoice: "جستجوی فاکتور خرید",
    FindPurchaseInvoiceById: "یافتن فاکتور خرید با شناسه",
    SearchReturnSaleInvoice: "جستجوی برگشت از فروش",
    FindReturnInvoiceById: "یافتن برگشت از فروش با شناسه",
    SearchReturnPurchaseInvoice: "جستجوی برگشت از خرید",
    FindReturnPurchaseInvoiceById: "یافتن برگشت از خرید با شناسه",
    SearchPurchaseQuote: "جستجوی پیش‌فاکتور خرید",
    FindPurchaseQuoteById: "یافتن پیش‌فاکتور خرید با شناسه",
    SearchPayment: "جستجوی پرداخت",
    FindPaymentById: "یافتن پرداخت با شناسه",
    SearchReceipt: "جستجوی دریافت",
    FindReceiptById: "یافتن دریافت با شناسه",
    SearchPhoneLog: "جستجوی تماس",
    FindPhoneLogById: "یافتن تماس با شناسه",
    GetBusinessNote: "دریافت یادداشت",
    FindProductByName: "یافتن محصول با نام",
    FindProductById: "یافتن محصول با شناسه",
    GetRemainingStock: "دریافت موجودی انبار",
    GetUserList: "لیست کاربران",
    GetUser: "دریافت کاربر",
    GetMoneyAccountList: "لیست حساب‌های مالی",
    GetCrmObjectTypeList: "لیست انواع موجودیت",
    GetCardtable: "دریافت کارتابل",
  };

  const $ = (id) => document.getElementById(id);
  const app = $("app");
  const authStatus = $("authStatus");
  const IDLE_NOTICE = "برای اتصال به پیام‌گستر ابتدا باید وارد شوید.";

  let authenticated = false;
  let currentEntityId = "form";
  let currentVariantId = "";
  let currentMethodId = "";
  let lastRecords = [];
  let cache = Object.create(null);
  let typesCache = Object.create(null);
  let loadGen = 0;
  let currentPage = 1;
  let pageSize = 20;
  let paginationEnabled = false;

  function entityTabs() {
    const entity = entityById(currentEntityId);
    const faName = (method, noun) => METHOD_FA[method] || method;
    const fromCfg = (cfg, variantId) => {
      const noun = cfg.variantFa || cfg.fa;
      const tabs = [];
      if (cfg.searchMethod) {
        tabs.push({
          id: variantId ? `search:${variantId}` : "search",
          panel: "search",
          variantId: variantId || "",
          method: cfg.searchMethod,
          fa: faName(cfg.searchMethod, noun),
        });
      }
      if (cfg.listMethod) {
        tabs.push({
          id: variantId ? `list:${variantId}` : "list",
          panel: "list",
          variantId: variantId || "",
          method: cfg.listMethod,
          fa: faName(cfg.listMethod, noun),
        });
      }
      if (cfg.findMethod) {
        tabs.push({
          id: variantId ? `find:${variantId}` : "find",
          panel: "find",
          variantId: variantId || "",
          method: cfg.findMethod,
          fa: faName(cfg.findMethod, noun),
        });
      }
      return tabs;
    };
    if (entity.variants && entity.variants.length) {
      return entity.variants.flatMap((v) => fromCfg({ ...entity, ...v, variantFa: v.fa }, v.id));
    }
    return fromCfg(entity, "");
  }

  function activeTab() {
    const tabs = entityTabs();
    return tabs.find((t) => t.id === currentMethodId) || tabs[0] || null;
  }

  function entityById(id) {
    return ENTITIES.find((e) => e.id === id) || ENTITIES[0];
  }

  function activeConfig() {
    const entity = entityById(currentEntityId);
    if (entity.variants && entity.variants.length) {
      const variant =
        entity.variants.find((v) => v.id === currentVariantId) || entity.variants[0];
      return { ...entity, ...variant, fa: entity.fa, id: entity.id, variantFa: variant.fa };
    }
    return { ...entity };
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.entityId && ENTITIES.some((e) => e.id === s.entityId)) currentEntityId = s.entityId;
      if (s.variantId) currentVariantId = s.variantId;
      if (s.methodId) currentMethodId = s.methodId;
      if (s.pageSize && [10, 20, 50].includes(Number(s.pageSize))) {
        pageSize = Number(s.pageSize);
        $("pageSize").value = String(pageSize);
      }
    } catch (_) {}
  }

  function saveSettings() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      entityId: currentEntityId,
      variantId: currentVariantId,
      methodId: currentMethodId,
      typeKey: $("typeKey").value.trim(),
      pageSize,
    }));
  }

  function setAuthStatus(kind, text, loading = false) {
    const message = (kind === "idle" && !loading && !text) ? IDLE_NOTICE : (text || IDLE_NOTICE);
    authStatus.className = `status ${kind}`;
    const mark = document.createElement("span");
    mark.className = loading ? "spinner" : "dot";
    const label = document.createElement("span");
    label.textContent = message;
    authStatus.replaceChildren(mark, label);
  }

  function setLocked(locked) {
    app.classList.toggle("locked", locked);
    authenticated = !locked;
  }

  function escapeXml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function escapeQueryXml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function soapEnvelope(bodyInner) {
    return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    ${bodyInner}
  </soap:Body>
</soap:Envelope>`;
  }

  function baseUrl() {
    let u = $("crmUrl").value.trim().replace(/\/+$/, "");
    if (!u) return "";
    if (u.startsWith("//")) u = "https:" + u;
    else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = "https://" + u;
    $("crmUrl").value = u;
    return u;
  }

  function creds() {
    return {
      username: $("username").value.trim(),
      password: $("password").value,
    };
  }

  function credTags(userParam, passParam = "password") {
    const { username, password } = creds();
    return `<${userParam}>${escapeXml(username)}</${userParam}>
      <${passParam}>${escapeXml(password)}</${passParam}>`;
  }

  async function soapCall({ path, action, body, methodName, timeoutMs = SOAP_TIMEOUT_MS }) {
    const base = baseUrl();
    if (!base) throw new Error("آدرس CRM را وارد کنید.");
    const url =
      `/api/soap?base=${encodeURIComponent(base)}` +
      `&path=${encodeURIComponent(path)}`;
    const xml = soapEnvelope(body);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: `"http://tempuri.org/${action}"`,
          "X-SOAP-Method": methodName || "",
        },
        body: xml,
        signal: ctrl.signal,
      });
    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error(`زمان پاسخ به پایان رسید (${Math.round(timeoutMs / 1000)}ث)`);
      }
      throw new Error(`اتصال به سرور برقرار نشد. جزئیات: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }
    const text = await res.text();
    if (!res.ok) {
      throw new Error(parseFault(text) || `HTTP ${res.status}: ${text.slice(0, 300)}`);
    }
    return text;
  }

  function parseFault(xml) {
    const m = xml.match(/<(?:\w+:)?faultstring[^>]*>([\s\S]*?)<\/(?:\w+:)?faultstring>/i)
      || xml.match(/<(?:\w+:)?Message[^>]*>([\s\S]*?)<\/(?:\w+:)?Message>/i);
    return m ? decodeXml(m[1].trim()) : null;
  }

  function decodeXml(s) {
    return String(s)
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
      .replace(/&amp;/g, "&");
  }

  function tagText(xml, tag) {
    const re = new RegExp(`<(?:\\w+:)?${tag}[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, "i");
    const m = xml.match(re);
    return m ? decodeXml(m[1].trim()) : null;
  }

  function tagBool(xml, tag) {
    const v = tagText(xml, tag);
    if (v == null) return null;
    return /^(true|1|success)$/i.test(v);
  }

  function extractBlocks(xml, tag) {
    const re = new RegExp(`<(?:\\w+:)?${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/(?:\\w+:)?${tag}>`, "gi");
    const out = [];
    let m;
    while ((m = re.exec(xml)) !== null) out.push(m[1]);
    return out;
  }

  function topLevelElements(xml) {
    const out = [];
    const re = /<(?:(\w+):)?([A-Za-z_][\w.-]*)([^>]*)(?:\/>|>([\s\S]*?)<\/(?:\1:)?\2\s*>)/g;
    let m;
    while ((m = re.exec(xml)) !== null) {
      out.push({
        name: m[2],
        attrs: m[3] || "",
        inner: m[4] == null ? "" : m[4],
      });
    }
    return out;
  }

  function hasChildTags(inner) {
    return /<(?:[\w-]+:)?[A-Za-z_]/.test(inner);
  }

  function flattenNested(inner, depth = 0) {
    if (!hasChildTags(inner)) return decodeXml(inner.trim());
    const kids = topLevelElements(inner);
    if (!kids.length) return decodeXml(inner.trim());
    const lines = kids.map((k) => {
      if (/nil\s*=\s*["']true["']/i.test(k.attrs) && !k.inner.trim()) return null;
      const val = flattenNested(k.inner, depth + 1);
      if (val == null || val === "") return null;
      const pad = "  ".repeat(depth);
      if (String(val).includes("\n")) return `${pad}${k.name}:\n${val}`;
      return `${pad}${k.name}: ${val}`;
    }).filter(Boolean);
    return lines.join("\n");
  }

  function parseRecord(inner) {
    const extended = extractBlocks(inner, "BaseCrmObjectExtendedPropertyInfo").map((block) => ({
      name: tagText(block, "Name") || "",
      userKey: tagText(block, "UserKey") || "",
      value: tagText(block, "Value") || "",
    })).filter((e) => e.name || e.userKey || e.value);

    const skip = new Set([
      "ExtendedProperties",
      "BaseCrmObjectExtendedPropertyInfo",
      "Success",
      "Message",
    ]);
    const fields = [];
    const seen = new Set();
    for (const el of topLevelElements(inner)) {
      if (skip.has(el.name) || seen.has(el.name.toLowerCase())) continue;
      if (/nil\s*=\s*["']true["']/i.test(el.attrs) && !el.inner.trim()) continue;
      const value = flattenNested(el.inner);
      if (value == null || String(value).trim() === "") continue;
      seen.add(el.name.toLowerCase());
      fields.push({
        key: el.name,
        label: FIELD_LABELS[el.name] || el.name,
        value: String(value),
      });
    }

    const get = (k) => {
      const hit = fields.find((f) => f.key.toLowerCase() === k.toLowerCase());
      return hit ? hit.value : "";
    };
    const first = get("FirstName");
    const last = get("LastName");
    let title = (first || last) ? `${first} ${last}`.trim() : "";
    if (!title) {
      for (const k of ["Subject", "Name", "NickName", "Title", "Number", "UserName", "Username", "ProductName", "InventoryName", "Code"]) {
        const v = get(k);
        if (v && !v.includes("\n")) {
          title = v;
          break;
        }
      }
    }
    const crmId = get("CrmId") || get("Id") || get("LifePathId") || "";
    const typeCode = get("CrmObjectTypeCode") || get("UserKey") || get("Code") || "";
    return {
      title: title || crmId || "(بدون عنوان)",
      crmId,
      typeCode,
      fields,
      extended,
      raw: inner,
    };
  }

  function extractItems(xml, cfg) {
    const tags = cfg.itemTags || (cfg.itemTag ? [cfg.itemTag] : []);
    for (const tag of tags) {
      const blocks = extractBlocks(xml, tag);
      if (blocks.length) return blocks.map(parseRecord);
    }
    const fallback = [];
    const re = /<(?:(\w+):)?([A-Za-z]\w*Info)(?:\s[^>]*)?>([\s\S]*?)<\/(?:\1:)?\2\s*>/gi;
    let m;
    while ((m = re.exec(xml)) !== null) {
      if (/Result$/i.test(m[2]) || /List$/i.test(m[2])) continue;
      fallback.push(parseRecord(m[3]));
    }
    return fallback;
  }

  function assertSuccess(xml, fallback) {
    const success = tagBool(xml, "Success");
    const message = tagText(xml, "Message");
    if (success === false) throw new Error(message || fallback);
    return message;
  }

  function renderNav() {
    const sel = $("entity");
    sel.innerHTML = ENTITIES.map((e) =>
      `<option value="${escapeHtml(e.id)}">${escapeHtml(e.fa)}</option>`
    ).join("");
    sel.value = currentEntityId;
  }

  function renderMethodTabs() {
    const tabs = entityTabs();
    if (!tabs.length) {
      currentMethodId = "";
      $("methodTabs").innerHTML = "";
      return;
    }
    if (!tabs.some((t) => t.id === currentMethodId)) currentMethodId = tabs[0].id;
    const tab = tabs.find((t) => t.id === currentMethodId);
    if (tab && tab.variantId) currentVariantId = tab.variantId;
    $("methodTabs").innerHTML = tabs.map((t) =>
      `<button type="button" class="method-tab${t.id === currentMethodId ? " active" : ""}" data-id="${escapeHtml(t.id)}" role="tab" aria-selected="${t.id === currentMethodId}">${escapeHtml(t.fa)}</button>`
    ).join("");
    $("methodTabs").querySelectorAll(".method-tab").forEach((btn) => {
      btn.addEventListener("click", () => selectMethod(btn.dataset.id));
    });
  }

  function updateToolbar() {
    const cfg = activeConfig();
    $("entity").value = currentEntityId;
    renderMethodTabs();
    const tab = activeTab();
    const panel = tab ? tab.panel : "search";

    const showSearchBar = panel === "search" || panel === "list";
    $("toolbar").classList.toggle("hidden", !showSearchBar);
    $("findRow").classList.toggle("hidden", panel !== "find");

    const showType = panel === "search" && cfg.kind === "search" && !!cfg.typeIndex;
    $("typeField").classList.toggle("hidden", !showType);

    const showQuery = panel === "search" && (cfg.kind === "search" || cfg.kind === "code");
    $("queryField").classList.toggle("hidden", !showQuery);
    $("queryLabel").textContent = cfg.queryLabel || "کوئری جستجو";
    $("query").placeholder = cfg.queryPlaceholder || DEFAULT_QUERY;
    if (cfg.kind === "search" && !$("query").value.trim()) $("query").value = DEFAULT_QUERY;
    if (cfg.kind === "code") {
      $("query").placeholder = cfg.queryPlaceholder || "";
    }

    $("btnSearch").classList.toggle("hidden", !showSearchBar);
    $("btnSearch").textContent = panel === "list" ? "بارگذاری" : "جستجو";

    if (panel === "find") {
      $("findId").placeholder = cfg.findPlaceholder || "GUID";
      $("findLabel").textContent = cfg.findIdParam === "targetUsername" ? "نام کاربری" : "شناسه";
      $("btnFind").textContent = "یافتن";
    }
  }

  function populateTypeSelect(types) {
    const sel = $("typeKey");
    const current = sel.value;
    sel.innerHTML = `<option value="">انتخاب نوع…</option>` + types.map((t) =>
      `<option value="${escapeHtml(t.userKey)}">${escapeHtml(t.name)}${t.userKey ? " (" + escapeHtml(t.userKey) + ")" : ""}</option>`
    ).join("");
    if (current && types.some((t) => t.userKey === current)) sel.value = current;
    else if (types.length) sel.value = types[0].userKey;
  }

  function parseTypeBlock(block) {
    return {
      id: tagText(block, "Id") || "",
      name: tagText(block, "Name") || "",
      userKey: tagText(block, "UserKey") || "",
      isActive: tagText(block, "IsActive") || "",
    };
  }

  async function fetchTypes(typeIndex) {
    if (!typeIndex) return [];
    if (typesCache[typeIndex]) return typesCache[typeIndex];
    const xml = await soapCall({
      path: "/Services/API/ICrmObjectType.svc",
      action: "ICrmObjectType/GetCrmObjectTypeList",
      methodName: "GetCrmObjectTypeList",
      timeoutMs: TYPES_TIMEOUT_MS,
      body: `
    <GetCrmObjectTypeList xmlns="http://tempuri.org/">
      ${credTags("username")}
      <crmObjectTypeIndex>${escapeXml(typeIndex)}</crmObjectTypeIndex>
    </GetCrmObjectTypeList>`,
    });
    assertSuccess(xml, "دریافت انواع موجودیت ناموفق بود.");
    const types = extractBlocks(xml, "CrmObjectTypeBasicInfo")
      .map(parseTypeBlock)
      .filter((t) => t.userKey);
    typesCache[typeIndex] = types;
    return types;
  }

  async function soapMethod(cfg, method, extraInner, timeoutMs) {
    return soapCall({
      path: cfg.path,
      action: `${cfg.iface}/${method}`,
      methodName: method,
      timeoutMs,
      body: `
    <${method} xmlns="http://tempuri.org/">
      ${extraInner}
    </${method}>`,
    });
  }

  function cacheKey(cfg, extra) {
    return [cfg.id, cfg.variantFa || "", extra.typeKey || "", extra.query || "", extra.mode || "search"].join("|");
  }

  async function runSearch(cfg, { typeKey, query }) {
    const user = cfg.searchUser || "userName";
    const qParam = cfg.queryParam || "query";
    const qEsc = qParam === "query" ? escapeQueryXml(query) : escapeXml(query);
    const typeTag = cfg.typeIndex
      ? `<typeKey>${escapeXml(typeKey)}</typeKey>`
      : "";
    const queryTag = `<${qParam}>${qEsc}</${qParam}>`;
    const xml = await soapMethod(cfg, cfg.searchMethod, `
      ${credTags(user)}
      ${typeTag}
      ${queryTag}
    `);
    assertSuccess(xml, "جستجو ناموفق بود.");
    return extractItems(xml, cfg);
  }

  async function runList(cfg) {
    const user = cfg.listUser || cfg.searchUser || "userName";
    if (!cfg.paged) {
      const xml = await soapMethod(cfg, cfg.listMethod, credTags(user));
      assertSuccess(xml, "دریافت لیست ناموفق بود.");
      return extractItems(xml, cfg);
    }
    const size = cfg.soapPageSize || 50;
    const all = [];
    for (let pageIndex = 0; pageIndex < 40; pageIndex++) {
      const xml = await soapMethod(cfg, cfg.listMethod, `
        ${credTags(user)}
        <pageIndex>${pageIndex}</pageIndex>
        <pageSize>${size}</pageSize>
      `);
      assertSuccess(xml, "دریافت لیست ناموفق بود.");
      const chunk = extractItems(xml, cfg);
      all.push(...chunk);
      if (chunk.length < size) break;
    }
    return all;
  }

  async function runFind(cfg, idValue) {
    const user = cfg.findUser || cfg.searchUser || "username";
    let method = cfg.findMethod;
    let idParam = cfg.findIdParam;
    if (cfg.id === "product" && idValue && !/^[0-9a-f-]{32,36}$/i.test(idValue)) {
      method = "FindProductByCode";
      idParam = "code";
    }
    const xml = await soapMethod(cfg, method, `
      ${credTags(user)}
      <${idParam}>${escapeXml(idValue)}</${idParam}>
    `);
    assertSuccess(xml, "موردی پیدا نشد.");
    const items = extractItems(xml, cfg);
    if (!items.length) throw new Error("موردی پیدا نشد.");
    return items;
  }

  function setRecords(records, meta) {
    lastRecords = records;
    currentPage = 1;
    paginationEnabled = records.length > 0;
    $("resultsMeta").textContent = meta || "";
    $("detail").classList.remove("visible");
    renderList();
    if (!records.length) {
      paginationEnabled = false;
      updatePager();
      $("formList").innerHTML = `<div class="empty">نتیجه‌ای یافت نشد.</div>`;
    }
  }

  async function loadCurrent({ force = false } = {}) {
    if (!authenticated) return;
    const cfg = activeConfig();
    const gen = ++loadGen;
    saveSettings();
    $("detail").classList.remove("visible");

    if (cfg.kind === "lookup" || (activeTab() && activeTab().panel === "find")) {
      lastRecords = [];
      paginationEnabled = false;
      updatePager();
      $("formList").innerHTML = `<div class="empty">شناسه را وارد کنید و «یافتن» را بزنید.</div>`;
      $("resultsMeta").textContent = "";
      return;
    }

    const typeKey = $("typeKey").value.trim();
    let query = $("query").value.trim();
    if (cfg.kind === "search" && !query) {
      query = DEFAULT_QUERY;
      $("query").value = query;
    }
    if (cfg.queryRequired && !query) {
      lastRecords = [];
      paginationEnabled = false;
      updatePager();
      $("formList").innerHTML = `<div class="empty">${escapeHtml(cfg.queryLabel || "مقدار جستجو")} الزامی است.</div>`;
      $("resultsMeta").textContent = "";
      return;
    }
    const typeRequired = cfg.kind === "search" && cfg.typeIndex && !$("typeField").classList.contains("hidden");
    if (typeRequired && !typeKey) {
      lastRecords = [];
      paginationEnabled = false;
      updatePager();
      $("formList").innerHTML = `<div class="empty">یک نوع انتخاب کنید — جستجوی همه انواع ممکن است تایم‌اوت شود.</div>`;
      $("resultsMeta").textContent = "";
      return;
    }

    const key = cacheKey(cfg, { typeKey, query, mode: cfg.kind });
    if (!force && cache[key]) {
      setRecords(cache[key].records, `${cache[key].records.length} مورد · ${cfg.fa} (کش)`);
      return;
    }

    $("btnSearch").disabled = true;
    $("typeKey").disabled = true;
    $("entity").disabled = true;
    $("methodTabs").querySelectorAll("button").forEach((b) => { b.disabled = true; });
    paginationEnabled = false;
    updatePager();
    $("formList").innerHTML = `<div class="empty"><span class="spinner"></span> در حال دریافت «${escapeHtml(cfg.variantFa || cfg.fa)}»…</div>`;
    $("resultsMeta").textContent = "";

    try {
      const t0 = performance.now();
      const records = cfg.kind === "list"
        ? await runList(cfg)
        : await runSearch(cfg, { typeKey, query });
      if (gen !== loadGen) return;
      const ms = Math.round(performance.now() - t0);
      cache[key] = { records };
      setRecords(records, `${records.length} مورد · ${cfg.variantFa || cfg.fa}${typeKey ? " · " + typeKey : ""} · ${ms}ms`);
    } catch (err) {
      if (gen !== loadGen) return;
      lastRecords = [];
      paginationEnabled = false;
      updatePager();
      const msg = err.message || String(err);
      const hint = /زمان|timeout|timed out|Abort/i.test(msg)
        ? ' کوئری را محدودتر کنید، مثلاً CreateDatePersian > "1405/01/01".'
        : "";
      $("formList").innerHTML = `<div class="empty err">${escapeHtml(msg + hint)}</div>`;
      $("resultsMeta").textContent = "";
    } finally {
      if (gen === loadGen) {
        $("btnSearch").disabled = false;
        $("typeKey").disabled = false;
        $("entity").disabled = false;
        $("methodTabs").querySelectorAll("button").forEach((b) => { b.disabled = false; });
      }
    }
  }

  async function selectEntity(id, { restoreType = false } = {}) {
    currentEntityId = id;
    currentMethodId = "";
    lastRecords = [];
    $("detail").classList.remove("visible");
    $("entity").value = id;
    updateToolbar();
    await activateMethod(currentMethodId, { restoreType, force: false });
  }

  async function selectMethod(id) {
    if (id === currentMethodId) return;
    currentMethodId = id;
    lastRecords = [];
    $("detail").classList.remove("visible");
    updateToolbar();
    await activateMethod(id, { restoreType: false, force: false });
  }

  async function activateMethod(id, { restoreType = false, force = false } = {}) {
    const tab = activeTab();
    if (!tab) return;
    currentMethodId = tab.id;
    if (tab.variantId) currentVariantId = tab.variantId;
    saveSettings();
    if (!authenticated) {
      paginationEnabled = false;
      updatePager();
      $("formList").innerHTML = `<div class="empty">برای اجرای «${escapeHtml(tab.fa)}» ابتدا وارد شوید.</div>`;
      $("resultsMeta").textContent = "";
      return;
    }
    if (tab.panel === "find") {
      paginationEnabled = false;
      updatePager();
      $("formList").innerHTML = `<div class="empty">شناسه را وارد کنید و «یافتن» را بزنید.</div>`;
      $("resultsMeta").textContent = "";
      return;
    }
    if (tab.panel === "search") await prepareTypes(restoreType);
    await loadCurrent({ force });
  }

  async function prepareTypes(restoreType) {
    const cfg = activeConfig();
    const savedType = restoreType ? (() => {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}").typeKey || ""; }
      catch (_) { return ""; }
    })() : "";
    if (!restoreType) $("typeKey").value = "";
    if (cfg.kind !== "search" || !cfg.typeIndex) {
      $("typeKey").innerHTML = `<option value="">—</option>`;
      return;
    }
    $("formList").innerHTML = `<div class="empty"><span class="spinner"></span> دریافت انواع…</div>`;
    try {
      const types = await fetchTypes(cfg.typeIndex);
      populateTypeSelect(types);
      if (savedType && types.some((t) => t.userKey === savedType)) $("typeKey").value = savedType;
      if (!types.length) {
        $("typeField").classList.add("hidden");
      }
    } catch (err) {
      populateTypeSelect([]);
      $("typeField").classList.add("hidden");
      $("formList").innerHTML = `<div class="empty err">${escapeHtml(err.message || String(err))}</div>`;
    }
  }

  async function authenticate() {
    saveSettings();
    const { username, password } = creds();
    if (!baseUrl() || !username || !password) {
      setAuthStatus("err", "آدرس CRM، نام کاربری و رمز عبور الزامی است.");
      return;
    }
    $("btnAuth").disabled = true;
    setAuthStatus("idle", "در حال احراز هویت…", true);
    try {
      const xml = await soapCall({
        path: "/Services/IAuthentication.svc",
        action: "IAuthentication/Authenticate",
        methodName: "Authenticate",
        body: `
    <Authenticate xmlns="http://tempuri.org/">
      <username>${escapeXml(username)}</username>
      <password>${escapeXml(password)}</password>
    </Authenticate>`,
      });
      const status = tagText(xml, "Status");
      const message = tagText(xml, "Message") || "";
      const ok = status && /success/i.test(status);
      if (!ok) {
        const alt = tagText(xml, "AuthenticateResult");
        if (!(alt && /success/i.test(alt))) {
          throw new Error(message || status || "احراز هویت ناموفق بود.");
        }
      }
      setLocked(false);
      cache = Object.create(null);
      typesCache = Object.create(null);
      setAuthStatus("ok", message || "ورود موفق — دریافت داده…");
      renderNav();
      updateToolbar();
      await activateMethod(currentMethodId, { restoreType: true, force: false });
      setAuthStatus("ok", message || "ورود موفق");
    } catch (err) {
      setLocked(true);
      setAuthStatus("err", err.message || String(err));
    } finally {
      $("btnAuth").disabled = false;
    }
  }

  async function findById() {
    if (!authenticated) return;
    const cfg = activeConfig();
    if (!cfg.findMethod) return;
    const idValue = $("findId").value.trim();
    if (!idValue) {
      $("formList").innerHTML = `<div class="empty err">${escapeHtml(cfg.findPlaceholder || "شناسه")} را وارد کنید.</div>`;
      return;
    }
    $("btnFind").disabled = true;
    paginationEnabled = false;
    updatePager();
    $("formList").innerHTML = `<div class="empty"><span class="spinner"></span> در حال دریافت…</div>`;
    $("detail").classList.remove("visible");
    try {
      const records = await runFind(cfg, idValue);
      setRecords(records, `${records.length} مورد`);
      if (records.length) showDetail(records[0], 0);
    } catch (err) {
      lastRecords = [];
      $("formList").innerHTML = `<div class="empty err">${escapeHtml(err.message)}</div>`;
      $("resultsMeta").textContent = "";
      paginationEnabled = false;
      updatePager();
    } finally {
      $("btnFind").disabled = false;
    }
  }

  function totalPages() {
    return Math.max(1, Math.ceil(lastRecords.length / pageSize) || 1);
  }

  function pageSlice() {
    const start = (currentPage - 1) * pageSize;
    return { start, items: lastRecords.slice(start, start + pageSize) };
  }

  function updatePager() {
    const pager = $("pager");
    if (!paginationEnabled || !lastRecords.length) {
      pager.classList.remove("visible");
      return;
    }
    const pages = totalPages();
    if (currentPage > pages) currentPage = pages;
    if (currentPage < 1) currentPage = 1;
    pager.classList.add("visible");
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, lastRecords.length);
    $("pagerInfo").textContent = `${start}–${end} / ${lastRecords.length}`;
    $("btnPageFirst").disabled = currentPage <= 1;
    $("btnPagePrev").disabled = currentPage <= 1;
    $("btnPageNext").disabled = currentPage >= pages;
    $("btnPageLast").disabled = currentPage >= pages;
    let from = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
    let to = Math.min(pages, from + MAX_PAGE_BUTTONS - 1);
    from = Math.max(1, to - MAX_PAGE_BUTTONS + 1);
    const nums = $("pageNumbers");
    nums.innerHTML = "";
    for (let p = from; p <= to; p++) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-secondary" + (p === currentPage ? " active" : "");
      btn.textContent = String(p);
      btn.addEventListener("click", () => goToPage(p));
      nums.appendChild(btn);
    }
  }

  function goToPage(page) {
    currentPage = Math.min(totalPages(), Math.max(1, page));
    $("detail").classList.remove("visible");
    renderList();
    $("formList").scrollTop = 0;
  }

  function renderList() {
    if (!lastRecords.length) {
      $("formList").innerHTML = `<div class="empty">نتیجه‌ای یافت نشد.</div>`;
      updatePager();
      return;
    }
    const { start, items } = pageSlice();
    $("formList").innerHTML = items.map((rec, i) => {
      const idx = start + i;
      const meta = [rec.crmId, rec.typeCode].filter(Boolean).join(" · ");
      return `
        <button type="button" class="form-item" data-index="${idx}">
          <div class="title">${escapeHtml(rec.title)}</div>
          <div class="meta">${escapeHtml(meta)}</div>
        </button>`;
    }).join("");
    $("formList").querySelectorAll(".form-item").forEach((el) => {
      el.addEventListener("click", () => showDetail(lastRecords[Number(el.dataset.index)], Number(el.dataset.index)));
    });
    updatePager();
  }

  function showDetail(rec, index) {
    $("formList").querySelectorAll(".form-item").forEach((el) => {
      el.classList.toggle("active", Number(el.dataset.index) === index);
    });
    $("detailTitle").textContent = rec.title;
    $("detailKv").innerHTML = rec.fields
      .map((f) => `<dt>${escapeHtml(f.label)}</dt><dd>${escapeHtml(f.value)}</dd>`)
      .join("");
    const table = $("extTable");
    const tbody = table.querySelector("tbody");
    if (rec.extended.length) {
      table.classList.remove("hidden");
      tbody.innerHTML = rec.extended.map((e) => `<tr>
            <td>${escapeHtml(e.name)}</td>
            <td class="value">${escapeHtml(e.userKey)}</td>
            <td class="value">${escapeHtml(e.value)}</td>
          </tr>`).join("");
    } else {
      table.classList.add("hidden");
      tbody.innerHTML = "";
    }
    $("detail").classList.add("visible");
  }

  $("btnAuth").addEventListener("click", authenticate);
  $("btnSearch").addEventListener("click", () => loadCurrent({ force: true }));
  $("btnFind").addEventListener("click", findById);
  $("entity").addEventListener("change", () => {
    selectEntity($("entity").value);
  });
  $("typeKey").addEventListener("change", () => {
    saveSettings();
    if (activeTab() && activeTab().panel === "search") loadCurrent();
  });
  $("btnPageFirst").addEventListener("click", () => goToPage(1));
  $("btnPagePrev").addEventListener("click", () => goToPage(currentPage - 1));
  $("btnPageNext").addEventListener("click", () => goToPage(currentPage + 1));
  $("btnPageLast").addEventListener("click", () => goToPage(totalPages()));
  $("pageSize").addEventListener("change", () => {
    pageSize = Number($("pageSize").value) || 20;
    currentPage = 1;
    saveSettings();
    if (lastRecords.length) renderList();
  });
  $("password").addEventListener("keydown", (e) => {
    if (e.key === "Enter") authenticate();
  });
  $("query").addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadCurrent({ force: true });
  });
  $("findId").addEventListener("keydown", (e) => {
    if (e.key === "Enter") findById();
  });

  loadSettings();
  renderNav();
  updateToolbar();
  setLocked(true);
  updatePager();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      delete s.crmUrl;
      delete s.username;
      delete s.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    }
  } catch (_) {}
  $("crmUrl").value = "";
  $("username").value = "";
  $("password").value = "";
  fetch("/api/config").catch(() => {});
})();
