const money = (value) => Number((value || 0).toFixed(2));

const sumLineItems = (lineItems = [], { includeOptional = false } = {}) =>
  money(
    lineItems.reduce((total, item) => {
      const optional = Boolean(item.optional);
      const selected = Boolean(item.selected);
      if (optional && !includeOptional && !selected) return total;
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      return total + quantity * unitPrice;
    }, 0),
  );

const selectedGroupOptions = (optionGroups = []) =>
  optionGroups.flatMap((group) => {
    const selected = new Set(group.selectedOptionIds || []);
    return (group.options || [])
      .filter((option) => selected.has(option.id))
      .map((option) => ({ ...option, groupId: group.id, groupTitle: group.title }));
  });

const sumOptionGroups = (optionGroups = []) => sumLineItems(selectedGroupOptions(optionGroups), { includeOptional: true });

const recalcQuote = (quote) => {
  const lineItems = quote.lineItems || [];
  const optionGroups = quote.optionGroups || [];
  const subtotal = money(sumLineItems(lineItems) + sumOptionGroups(optionGroups));
  const optionalTotal = money(sumLineItems(lineItems, { includeOptional: true }) - sumLineItems(lineItems));
  const discount = money(Number(quote.discount || 0));
  const tax = money(Number(quote.tax || 0));
  const total = money(Math.max(0, subtotal - discount + tax));
  return { ...quote, lineItems, optionGroups, subtotal, optionalTotal, discount, tax, total };
};

const recalcInvoice = (invoice) => {
  const subtotal = sumLineItems(invoice.lineItems);
  const tax = money(Number(invoice.tax || 0));
  const total = money(subtotal + tax);
  const amountPaid = money(Number(invoice.amountPaid || 0));
  const balanceDue = money(Math.max(0, total - amountPaid));
  return { ...invoice, subtotal, tax, total, amountPaid, balanceDue };
};

const stamp = () =>
  new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const dayStamp = () =>
  new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const nextId = (prefix) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

const buildQuoteItems = (pkg, addons = []) => [
  {
    id: nextId("qi"),
    name: pkg?.name || "Session package",
    description: pkg?.description || "Photography session package.",
    quantity: 1,
    unitPrice: pkg?.price || 0,
  },
  ...addons.map((addon) => ({
    id: nextId("qi"),
    name: addon.name,
    description: addon.description,
    quantity: 1,
    unitPrice: addon.price,
    optional: Boolean(addon.optional),
    selected: Boolean(addon.selected),
  })),
];

const normalizeSessionKey = (value = "") =>
  String(value).toLowerCase().replace(/[^a-z0-9]+/g, "").replace(/session$/, "");

const getPackageCandidates = (packages = [], sessionType = "") => {
  const sessionKey = normalizeSessionKey(sessionType);
  const exact = packages.filter((pkg) => normalizeSessionKey(pkg.sessionType || pkg.category || pkg.name).includes(sessionKey) || sessionKey.includes(normalizeSessionKey(pkg.sessionType || pkg.category || pkg.name)));
  return exact.length ? exact : packages;
};

const resolvePackage = (packages = [], packageId, sessionType = "") => {
  const byId = packages.find((entry) => entry.id === packageId);
  if (byId) return byId;
  return getPackageCandidates(packages, sessionType)[0] || packages[0] || null;
};

const buildPackageOptionGroup = (packages = [], selectedPackageId, sessionType = "") => {
  const candidates = getPackageCandidates(packages, sessionType);
  const options = candidates.map((pkg) => ({
    id: nextId("qopt"),
    packageId: pkg.id,
    name: pkg.name,
    description: pkg.description,
    quantity: 1,
    unitPrice: pkg.price,
  }));
  const selected = options.find((option) => option.packageId === selectedPackageId) || options[0];
  return {
    id: nextId("qgrp"),
    title: sessionType ? `Choose your ${sessionType.toLowerCase()} package` : "Choose your photography experience",
    description: "This is pulled from the inquiry package choice. The client can still choose another option before accepting.",
    selectionMode: "single",
    required: true,
    selectedOptionIds: selected ? [selected.id] : [],
    options,
  };
};

const buildQuoteNotesFromInquiry = (inquiry, pkg) => {
  const parts = [
    inquiry?.notes ? `Inquiry notes: ${inquiry.notes}` : "",
    inquiry?.budgetRange ? `Budget range: ${inquiry.budgetRange}` : "",
    inquiry?.desiredDate ? `Preferred date: ${inquiry.desiredDate}` : "",
    pkg?.name ? `Default package: ${pkg.name}` : "",
  ].filter(Boolean);
  return parts.join("\n");
};

const buildInvoiceItems = (label, amount) => [
  {
    id: nextId("ii"),
    name: label,
    description: label,
    quantity: 1,
    unitPrice: money(amount),
  },
];

const DEFAULT_CONTRACT_CLAUSES = [
  { id: "scope", title: "1. Scope of Services", body: "EC Creative Studios (\"Photographer\") agrees to provide photography services for the session described in the associated quote, including pre-session planning, the session itself, and post-production editing of the final selected images." },
  { id: "payment", title: "2. Payment Terms", body: "A non-refundable deposit secures the session date. The remaining balance is due according to the invoice schedule. Sessions will not be scheduled or held without a paid deposit and a signed agreement." },
  { id: "reschedule", title: "3. Rescheduling & Cancellation", body: "Client may reschedule once at no charge with at least 14 days' notice, subject to Photographer availability. Cancellations forfeit the deposit. Photographer-initiated reschedules will not incur any fee to Client." },
  { id: "usage", title: "4. Usage Rights & Licensing", body: "Client receives a personal-use license to the final delivered images. Photographer retains copyright and may use images for portfolio, marketing, and promotional purposes unless a separate privacy agreement is signed." },
  { id: "delivery", title: "5. Delivery", body: "Final edited images are delivered via online gallery within the timeframe stated at booking. Rush delivery may be available for an additional fee." },
  { id: "liability", title: "6. Liability", body: "Photographer's liability is limited to the amount paid for services. Photographer is not responsible for circumstances beyond reasonable control, including but not limited to illness, weather, or equipment failure, and will make reasonable efforts to reschedule in such cases." },
];

export const PIPELINE_STAGES = [
  { key: "new_inquiry", label: "New Inquiry" },
  { key: "needs_review", label: "Needs Review" },
  { key: "quote_drafted", label: "Quote Drafted" },
  { key: "quote_sent", label: "Quote Sent" },
  { key: "quote_accepted", label: "Quote Accepted" },
  { key: "contract_sent", label: "Contract Sent" },
  { key: "contract_signed", label: "Contract Signed" },
  { key: "invoice_sent", label: "Invoice Sent" },
  { key: "deposit_paid", label: "Deposit Paid" },
  { key: "session_scheduled", label: "Session Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "gallery_delivered", label: "Gallery Delivered" },
  { key: "archived", label: "Archived" },
  { key: "lost", label: "Lost / Cancelled" },
];

// Stages a Manual Override can actually fast-forward a client to. "new_inquiry"
// isn't reachable here because a client record only exists once an inquiry has
// already been approved. "archived" and "lost" are terminal flags, handled as
// their own dispatches instead of the forward sequencer.
export const FORCE_STAGE_ORDER = [
  "needs_review",
  "quote_drafted",
  "quote_sent",
  "quote_accepted",
  "contract_sent",
  "contract_signed",
  "invoice_sent",
  "deposit_paid",
  "session_scheduled",
  "completed",
  "gallery_delivered",
];

export const PIPELINE_LABELS = Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage.key, stage.label]));

export const BOOKING_STEPS = [
  { key: "quoteAccepted", label: "Quote accepted" },
  { key: "contractSigned", label: "Contract signed" },
  { key: "paymentReceived", label: "Payment received" },
];

const basePackages = [
  {
    id: "pkg_maternity_essential",
    name: "Maternity Essential",
    sessionType: "Maternity Session",
    category: "maternity",
    quoteTemplateName: "Maternity Portrait Quote",
    emailTemplateKey: "maternity_quote",
    description: "A calm, guided maternity session with creative direction, wardrobe support, and a refined edited gallery.",
    price: 950,
  },
  {
    id: "pkg_maternity_signature",
    name: "Maternity Signature",
    sessionType: "Maternity Session",
    category: "maternity",
    quoteTemplateName: "Maternity Portrait Quote",
    emailTemplateKey: "maternity_quote",
    description: "The full maternity experience with deeper styling, partner/family coverage, and a larger finished gallery.",
    price: 1850,
  },
  {
    id: "pkg_newborn_essential",
    name: "Newborn Essential",
    sessionType: "Newborn Session",
    category: "newborn",
    quoteTemplateName: "Newborn Session Quote",
    emailTemplateKey: "newborn_quote",
    description: "A gentle newborn session built around baby-led posing, soft family moments, and a clean timeless gallery.",
    price: 1250,
  },
  {
    id: "pkg_family_story",
    name: "Family Story",
    sessionType: "Family Session",
    category: "family",
    quoteTemplateName: "Family Story Quote",
    emailTemplateKey: "family_quote",
    description: "Outdoor or in-home family storytelling with guided prompts, natural movement, and polished gallery delivery.",
    price: 1200,
  },
  {
    id: "pkg_wedding_heirloom",
    name: "Wedding Heirloom",
    sessionType: "Wedding",
    category: "wedding",
    quoteTemplateName: "Wedding Coverage Quote",
    emailTemplateKey: "wedding_quote",
    description: "Wedding coverage with planning support, documentary coverage, portraits, details, and heirloom delivery structure.",
    price: 2700,
  },
];

const baseAddons = [
  {
    id: "addon_hmua",
    name: "Hair + Makeup",
    description: "Studio-arranged HMUA add-on",
    price: 250,
  },
  {
    id: "addon_video",
    name: "Behind-the-scenes reel",
    description: "Short-form BTS video capture",
    price: 300,
  },
  {
    id: "addon_studio",
    name: "Studio Rental",
    description: "Use of EC Creative Studios' indoor studio space",
    price: 150,
  },
  {
    id: "addon_extra_hour",
    name: "Extra Hour",
    description: "One additional hour of session time",
    price: 200,
  },
  {
    id: "addon_rush",
    name: "Rush Delivery",
    description: "Final gallery delivered within 72 hours",
    price: 175,
  },
  {
    id: "addon_travel",
    name: "Travel Fee",
    description: "Travel beyond a 20-mile radius of Miami",
    price: 100,
  },
  {
    id: "addon_album",
    name: "Album Credit",
    description: "Credit toward a printed heirloom album",
    price: 350,
  },
];


const defaultLocations = [
  { id: "loc_mint_room", name: "Mint Room Studios", city: "Miami, FL", address: "Miami, FL" },
  { id: "loc_casa_terra", name: "Casa Terra", city: "Miami, FL", address: "Miami, FL" },
  { id: "loc_vizcaya", name: "Vizcaya", city: "Miami, FL", address: "3251 S Miami Ave, Miami, FL" },
  { id: "loc_la_maison_leaf", name: "La Maison Leaf", city: "Miami, FL", address: "Miami, FL" },
  { id: "loc_creative_casa", name: "Creative Casa", city: "Miami, FL", address: "Miami, FL" },
  { id: "loc_soultuary_dania", name: "Soultuary Dania", city: "Dania Beach, FL", address: "Dania Beach, FL" },
];

const defaultEmailTemplates = [
  { key: "portal_access", name: "Send portal access", subject: "Your EC Creative Studios portal is ready, {{client_name}}", body: "Hi {{client_name}},\n\nYour private planning portal is ready: {{portal_link}}\n\nEC Creative Studios" },
  { key: "date_selection", name: "Send date selection", subject: "Pick your {{session_type}} date", body: "Hi {{client_name}},\n\nYour deposit is in. Please pick your session date and time from your portal.\n\nEC Creative Studios" },
  { key: "calendar_invite", name: "Send calendar invite", subject: "Calendar invite: {{session_date}} at {{session_time}}", body: "Hi {{client_name}},\n\nHere is your calendar invite for {{session_date}} at {{session_time}} at {{location}}.\n\nEC Creative Studios" },
  { key: "booking_reminder", name: "Booking reminder", subject: "Finish booking your {{session_type}}", body: "Hi {{client_name}},\n\nYour booking is not complete yet. Please finish the next step in your portal.\n\nEC Creative Studios" },
  { key: "gallery_delivery", name: "Deliver gallery", subject: "Your gallery is ready", body: "Hi {{client_name}},\n\nYour gallery is ready: {{gallery_link}}\n\nYou can also shop prints here: {{print_store_link}}\n\nEC Creative Studios" },
  { key: "quote", name: "Send quote", subject: "Your {{session_type}} quote from {{business_name}}", body: "Hi {{client_name}},\n\nYour quote {{quote_number}} is ready. Current quote total: {{quote_total}}.\n\nReview it from your portal and accept when ready.\n\nEC Creative Studios" },
  { key: "invoice", name: "Send invoice", subject: "Invoice {{invoice_number}} from {{business_name}}", body: "Hi {{client_name}},\n\nInvoice {{invoice_number}} is ready. Balance due: {{invoice_total}}.\n\nEC Creative Studios" },
  { key: "contract", name: "Send contract", subject: "Please review and sign {{contract_title}}", body: "Hi {{client_name}},\n\nYour contract is ready for review and signature.\n\nEC Creative Studios" },
  { key: "payment_reminder", name: "Payment reminder", subject: "Payment reminder for {{session_date}}", body: "Hi {{client_name}},\n\nYour final balance is due before or on {{session_date}}.\n\nEC Creative Studios" },
];

const defaultPortalSteps = [
  { id: "step_booked", title: "Session Booked", body: "Your quote, contract, and deposit are complete.", status: "complete" },
  { id: "step_date", title: "Session Date", body: "Choose your date or wait for the studio to set it manually.", status: "pending" },
  { id: "step_prep", title: "Planning", body: "Review prep notes, inspiration, props, and location details.", status: "pending" },
  { id: "step_gallery", title: "Gallery Delivery", body: "Your final gallery and print store link will appear here after delivery.", status: "pending" },
];

const defaultContractTemplates = [
  "Standard Photography Agreement",
  "Wedding Agreement",
  "Branding Agreement",
  "Event Agreement",
  "Milestone Package Agreement",
];

export function createInitialState() {
  const inquiryDanielId = "inq_daniel";
  const inquirySarahId = "inq_sarah";
  const inquiryAshleyId = "inq_ashley";
  const inquiryThomasId = "inq_thomas";

  const clientSarahId = "client_sarah";
  const clientAshleyId = "client_ashley";
  const clientThomasId = "client_thomas";

  const sarahQuoteId = "quote_sarah";
  const ashleyQuoteId = "quote_ashley";
  const thomasQuoteId = "quote_thomas";

  const sarahContractId = "contract_sarah";
  const thomasContractId = "contract_thomas";

  const sarahDepositInvoiceId = "invoice_sarah_deposit";

  const sarahQuote = recalcQuote({
    id: sarahQuoteId,
    number: "QUO-1001",
    clientId: clientSarahId,
    inquiryId: inquirySarahId,
    eventType: "Maternity Session",
    sessionDate: "Jul 20, 2026",
    location: "Miami, FL",
    status: "accepted",
    lineItems: [],
    optionGroups: [buildPackageOptionGroup(basePackages, "pkg_maternity_signature", "Maternity Session")],
    discount: 250,
    tax: 0,
    notes: "Includes creative planning call, wardrobe guidance, and gallery delivery.",
    expirationDate: "Jul 5, 2026",
    createdAt: "Jun 1, 2026",
    sentAt: "Jun 2, 2026",
    viewedAt: "Jun 2, 2026",
    acceptedAt: "Jun 3, 2026",
  });

  const ashleyQuote = recalcQuote({
    id: ashleyQuoteId,
    number: "QUO-1002",
    clientId: clientAshleyId,
    inquiryId: inquiryAshleyId,
    eventType: "Newborn Session",
    sessionDate: "",
    location: "Miami, FL",
    status: "sent",
    lineItems: [],
    optionGroups: [buildPackageOptionGroup(basePackages, "pkg_newborn_essential", "Newborn Session")],
    discount: 0,
    tax: 0,
    notes: "Held for 7 days pending approval.",
    expirationDate: "Jun 29, 2026",
    createdAt: "Jun 21, 2026",
    sentAt: "Jun 22, 2026",
  });

  const thomasQuote = recalcQuote({
    id: thomasQuoteId,
    number: "QUO-1003",
    clientId: clientThomasId,
    inquiryId: inquiryThomasId,
    eventType: "Wedding",
    sessionDate: "Oct 14, 2026",
    location: "Miami, FL",
    status: "accepted",
    lineItems: buildQuoteItems({ name: baseAddons[1].name, description: baseAddons[1].description, price: baseAddons[1].price }),
    optionGroups: [buildPackageOptionGroup(basePackages, "pkg_wedding_heirloom", "Wedding")],
    discount: 0,
    tax: 0,
    notes: "Coverage includes engagement planning and highlight reel.",
    expirationDate: "Jun 28, 2026",
    createdAt: "Jun 18, 2026",
    sentAt: "Jun 19, 2026",
    acceptedAt: "Jun 20, 2026",
  });

  const sarahDepositInvoice = recalcInvoice({
    id: sarahDepositInvoiceId,
    number: "INV-1001",
    kind: "deposit",
    clientId: clientSarahId,
    quoteId: sarahQuoteId,
    contractId: sarahContractId,
    sessionId: "session_sarah",
    status: "paid",
    lineItems: buildInvoiceItems("Deposit to secure session", 750),
    tax: 0,
    amountPaid: 750,
    dueDate: "Jun 18, 2026",
    createdAt: "Jun 12, 2026",
    sentAt: "Jun 12, 2026",
    paidAt: "Jun 18, 2026",
    paymentMethod: "Card",
    internalNotes: "Deposit captured through portal.",
    locked: true,
  });

  return {
    selectedClientId: clientSarahId,
    availability: [
      { date: "Jul 18, 2026", times: ["9:00 AM", "1:00 PM"] },
      { date: "Jul 20, 2026", times: ["10:00 AM", "4:30 PM"] },
      { date: "Jul 22, 2026", times: ["10:00 AM", "2:00 PM"] },
    ],
    scheduledEmails: [],
    marketingCampaigns: [
      { id: "camp_fall_minis", name: "Fall Mini-Sessions Promo", segment: "All clients", status: "Sent", stats: "41% open · 9% click", createdAt: "Jun 1, 2026" },
      { id: "camp_welcome", name: "Welcome Series — New Inquiry", segment: "All inquiries", status: "Automated", stats: "Triggers on inquiry approval", createdAt: "Jan 5, 2026" },
      { id: "camp_reengage", name: "Past Client Re-Engagement", segment: "Returning inquiry", status: "Draft", stats: "—", createdAt: "Mar 3, 2026" },
    ],
    socialRules: [
      { id: "rule_minis", keyword: "MINIS", reply: "Mini-session info + booking link", count: 38 },
      { id: "rule_maternity", keyword: "MATERNITY", reply: "Maternity package PDF + inquiry link", count: 21 },
      { id: "rule_book", keyword: "BOOK", reply: "Direct link to the inquiry form", count: 64 },
    ],
    studioSettings: { heroImageUrl: "", heroHeadline: "Admin first. Booking rules before everything else." },
    packages: basePackages,
    addons: baseAddons,
    locations: defaultLocations,
    emailTemplates: defaultEmailTemplates,
    contractTemplates: defaultContractTemplates,
    quoteTemplates: ["Blank Quote", "Maternity Template", "Newborn Template", "Family Template", "Branding Template", "Wedding Template", "Event Template"],
    portalDefaults: defaultPortalSteps,
    calendarConnections: { google: false, apple: false },
    availabilityLastEditedAt: "Jun 22, 2026 at 4:15 PM",
    inquiries: [
      {
        id: inquirySarahId,
        clientId: clientSarahId,
        name: "Sarah Garcia",
        email: "sarahgarcia@email.com",
        phone: "(214) 555-3872",
        sessionType: "Maternity Session",
        packageId: "pkg_maternity_signature",
        budgetRange: "$900-$1,500",
        desiredDate: "Jul 20, 2026",
        location: "Miami, FL",
        notes: "Looking for soft, timeless images with editorial direction.",
        status: "converted",
        receivedAt: "May 30, 2026",
      },
      {
        id: inquiryDanielId,
        clientId: null,
        name: "Daniel Andersson",
        email: "daniel@example.com",
        phone: "(214) 555-4411",
        sessionType: "Family Session",
        packageId: "pkg_family_story",
        budgetRange: "$800-$1,200",
        desiredDate: "Aug 9, 2026",
        location: "Plano, TX",
        notes: "Wants outdoor golden-hour session with two toddlers.",
        status: "new",
        receivedAt: "Jun 22, 2026",
      },
      {
        id: inquiryAshleyId,
        clientId: clientAshleyId,
        name: "Ashley Morgan",
        email: "ashley.morgan@example.com",
        phone: "(469) 555-9001",
        sessionType: "Newborn Session",
        packageId: "pkg_newborn_essential",
        budgetRange: "$900-$1,500",
        desiredDate: "Jul 29, 2026",
        location: "Miami, FL",
        notes: "Nursery palette is cream and sage.",
        status: "approved",
        receivedAt: "Jun 21, 2026",
      },
      {
        id: inquiryThomasId,
        clientId: clientThomasId,
        name: "Thomas & Rachel",
        email: "thomasrachel@example.com",
        phone: "(817) 555-3002",
        sessionType: "Wedding",
        packageId: "pkg_wedding_heirloom",
        budgetRange: "$3,500-$5,000",
        desiredDate: "Oct 14, 2026",
        location: "Miami, FL",
        notes: "Needs full-day coverage and social teaser.",
        status: "approved",
        receivedAt: "Jun 20, 2026",
      },
    ],
    clients: [
      {
        id: clientSarahId,
        inquiryId: inquirySarahId,
        name: "Sarah Garcia",
        email: "sarahgarcia@email.com",
        phone: "(214) 555-3872",
        sessionType: "Maternity Session",
        packageId: "pkg_maternity_signature",
        status: "active",
        city: "Miami, FL",
        preferredLocationId: "loc_light_haus",
        tags: ["Maternity", "Returning inquiry"],
      },
      {
        id: clientAshleyId,
        inquiryId: inquiryAshleyId,
        name: "Ashley Morgan",
        email: "ashley.morgan@example.com",
        phone: "(469) 555-9001",
        sessionType: "Newborn Session",
        packageId: "pkg_newborn_essential",
        status: "active",
        city: "Miami, FL",
        preferredLocationId: "loc_light_haus",
        tags: ["Newborn"],
      },
      {
        id: clientThomasId,
        inquiryId: inquiryThomasId,
        name: "Thomas & Rachel",
        email: "thomasrachel@example.com",
        phone: "(817) 555-3002",
        sessionType: "Wedding",
        packageId: "pkg_wedding_heirloom",
        status: "active",
        city: "Miami, FL",
        preferredLocationId: "loc_stockyards",
        tags: ["Wedding", "High touch"],
      },
    ],
    quotes: [sarahQuote, ashleyQuote, thomasQuote],
    contracts: [
      {
        id: sarahContractId,
        number: "CON-1001",
        clientId: clientSarahId,
        quoteId: sarahQuoteId,
        templateName: "Portrait Session Agreement",
        status: "signed",
        createdAt: "Jun 10, 2026",
        sentAt: "Jun 10, 2026",
        signedAt: "Jun 11, 2026",
        signerName: "Sarah Garcia",
        clauses: DEFAULT_CONTRACT_CLAUSES,
      },
      {
        id: thomasContractId,
        number: "CON-1002",
        clientId: clientThomasId,
        quoteId: thomasQuoteId,
        templateName: "Wedding Coverage Agreement",
        status: "sent",
        createdAt: "Jun 21, 2026",
        sentAt: "Jun 21, 2026",
        signedAt: "",
        signerName: "",
        clauses: DEFAULT_CONTRACT_CLAUSES,
      },
    ],
    invoices: [sarahDepositInvoice],
    payments: [
      {
        id: "payment_sarah_deposit",
        clientId: clientSarahId,
        invoiceId: sarahDepositInvoiceId,
        amount: 750,
        method: "Card",
        paidAt: "Jun 18, 2026",
        note: "Deposit paid through portal",
      },
    ],
    sessions: [
      {
        id: "session_sarah",
        clientId: clientSarahId,
        quoteId: sarahQuoteId,
        contractId: sarahContractId,
        invoiceIds: [sarahDepositInvoiceId],
        sessionType: "Maternity Session",
        status: "awaiting_schedule",
        sessionDate: "",
        sessionTime: "",
        locationId: "loc_light_haus",
        prepStatus: "awaiting_client_date",
        galleryStatus: "not_ready",
        projectCreatedAt: "Jun 18, 2026",
        portalAccessSentAt: "Jun 18, 2026",
        availabilityEmailSentAt: "Jun 18, 2026",
        calendarInviteSentAt: "",
        notes: "Deposit received. Waiting for final date confirmation through portal.",
      },
      {
        id: "session_ashley",
        clientId: clientAshleyId,
        quoteId: ashleyQuoteId,
        contractId: null,
        invoiceIds: [],
        sessionType: "Newborn Session",
        status: "planning",
        sessionDate: "",
        sessionTime: "",
        locationId: "loc_light_haus",
        prepStatus: "not_started",
        galleryStatus: "not_ready",
        projectCreatedAt: "",
        portalAccessSentAt: "",
        availabilityEmailSentAt: "",
        calendarInviteSentAt: "",
        notes: "Quote sent. Awaiting client decision.",
      },
      {
        id: "session_thomas",
        clientId: clientThomasId,
        quoteId: thomasQuoteId,
        contractId: thomasContractId,
        invoiceIds: [],
        sessionType: "Wedding",
        status: "contract_pending",
        sessionDate: "",
        sessionTime: "",
        locationId: "loc_stockyards",
        prepStatus: "contract_out",
        galleryStatus: "not_ready",
        projectCreatedAt: "",
        portalAccessSentAt: "",
        availabilityEmailSentAt: "",
        calendarInviteSentAt: "",
        notes: "Contract has been sent. Payment schedule pending signature.",
      },
    ],
    portalProfiles: [
      {
        clientId: clientSarahId,
        useProjectDetails: false,
        customDate: "",
        customTime: "",
        customLocation: "Mint Room Studios",
        sessionVision:
          "Soft, timeless, elegant images that celebrate this chapter with airy movement, editorial framing, and meaningful detail.",
        sessionNotes:
          "Bring neutral undergarments, hydrate well, and arrive 15 minutes early so we can settle in before photographing.",
        propList: ["Flowing cream dress", "Draped gauze", "Wood stool", "Floral stem bundle"],
        visionImages: [],
        galleryImages: [],
        galleryLink: { url: "", title: "", previewImage: "" },
        printStoreLink: "",
        planPrepSteps: defaultPortalSteps.map((step) => ({ ...step })),
      },
      {
        clientId: clientAshleyId,
        useProjectDetails: true,
        customDate: "",
        customTime: "",
        customLocation: "",
        sessionVision: "Warm, cozy newborn imagery with a clean and gentle palette.",
        sessionNotes: "Draft portal only. Unlock once booking is complete.",
        propList: ["Cream swaddle", "Bassinet", "Rattan stool"],
        visionImages: [],
        galleryImages: [],
        galleryLink: { url: "", title: "", previewImage: "" },
        printStoreLink: "",
        planPrepSteps: defaultPortalSteps.map((step) => ({ ...step })),
      },
      {
        clientId: clientThomasId,
        useProjectDetails: true,
        customDate: "",
        customTime: "",
        customLocation: "",
        sessionVision: "Romantic and documentary-forward wedding coverage.",
        sessionNotes: "Portal staged but hidden until signature + invoice are ready.",
        propList: ["Getting-ready flat lay kit", "Champagne coupe"],
        visionImages: [],
        galleryImages: [],
        galleryLink: { url: "", title: "", previewImage: "" },
        printStoreLink: "",
        planPrepSteps: defaultPortalSteps.map((step) => ({ ...step })),
      },
    ],
    messages: [
      {
        id: "msg_1",
        clientId: clientSarahId,
        from: "studio",
        text: "Hi Sarah! Your deposit is in. Pick your date whenever you're ready and we'll lock everything in.",
        createdAt: "Jun 18, 2026",
      },
      {
        id: "msg_2",
        clientId: clientSarahId,
        from: "client",
        text: "Perfect. I’m looking at the available dates now.",
        createdAt: "Jun 18, 2026",
      },
    ],
    notes: [
      {
        id: "note_1",
        clientId: clientSarahId,
        body: "Client prefers soft neutral styling and wants to include partner for a short set.",
        createdAt: "Jun 2, 2026",
      },
      {
        id: "note_2",
        clientId: clientThomasId,
        body: "Needs social teaser add-on reflected in proposal copy.",
        createdAt: "Jun 20, 2026",
      },
    ],
    activity: [
      { id: "act_1", clientId: clientSarahId, text: "Deposit invoice INV-1001 paid by card", createdAt: "Jun 18, 2026" },
      { id: "act_2", clientId: clientThomasId, text: "Contract CON-1002 sent for signature", createdAt: "Jun 21, 2026" },
      { id: "act_3", clientId: clientAshleyId, text: "Quote QUO-1002 sent to Ashley Morgan", createdAt: "Jun 22, 2026" },
      { id: "act_4", clientId: inquiryDanielId, text: "New inquiry received from Daniel Andersson", createdAt: "Jun 22, 2026" },
    ],
    emailLogs: [
      {
        id: "email_1",
        clientId: clientSarahId,
        kind: "invoice",
        subject: "Your invoice from EC Creative Studios",
        sentAt: "Jun 12, 2026",
      },
      {
        id: "email_2",
        clientId: clientSarahId,
        kind: "portal_access",
        subject: "Your EC Creative Studios portal is ready",
        sentAt: "Jun 18, 2026",
      },
    ],
  };
}

const activeQuoteStatuses = ["draft", "sent", "viewed", "accepted"];
const activeContractStatuses = ["draft", "sent", "signed"];
const activeInvoiceStatuses = ["draft", "sent", "partially_paid", "paid"];

export function getClientBundle(state, clientId) {
  const client = state.clients.find((entry) => entry.id === clientId) || null;
  const inquiry = client ? state.inquiries.find((entry) => entry.id === client.inquiryId) || null : null;
  const quotes = state.quotes
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const contracts = state.contracts
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const invoices = state.invoices
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  const payments = state.payments
    .filter((entry) => entry.clientId === clientId)
    .sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));
  const session = state.sessions.find((entry) => entry.clientId === clientId) || null;
  const portal = state.portalProfiles.find((entry) => entry.clientId === clientId) || null;
  const messages = state.messages.filter((entry) => entry.clientId === clientId);
  const notes = state.notes.filter((entry) => entry.clientId === clientId);
  const activity = state.activity.filter((entry) => entry.clientId === clientId);
  const emailLogs = (state.emailLogs || []).filter((entry) => entry.clientId === clientId);
  const scheduledEmails = (state.scheduledEmails || []).filter((entry) => entry.clientId === clientId);
  const stage = derivePipelineStage({ client, inquiry, quotes, contracts, invoices, session });
  const booking = deriveBookingState({ inquiry, quotes, contracts, invoices, session });
  const projectStatus = deriveProjectStatus(session, booking, emailLogs);

  return {
    client,
    inquiry,
    quotes,
    contracts,
    invoices,
    payments,
    session,
    portal,
    messages,
    notes,
    activity,
    emailLogs,
    scheduledEmails,
    stage,
    booking,
    projectStatus,
    primaryQuote: quotes[0] || null,
    primaryContract: contracts[0] || null,
    primaryInvoice: invoices[0] || null,
  };
}

export function deriveBookingState(bundle) {
  const { quotes = [], contracts = [], invoices = [] } = bundle;
  const acceptedQuote = quotes.find((entry) => entry.status === "accepted");
  const signedContract = contracts.find((entry) => entry.status === "signed");
  const paidInvoice = invoices.find(
    (entry) => ["deposit", "full"].includes(entry.kind) && entry.status === "paid",
  );
  const invoiceSent = invoices.find((entry) => entry.status === "sent" || entry.status === "partially_paid");

  const steps = {
    quoteAccepted: Boolean(acceptedQuote),
    contractSigned: Boolean(signedContract),
    paymentReceived: Boolean(paidInvoice),
  };

  return {
    steps,
    isBooked: Object.values(steps).every(Boolean),
    invoiceSent: Boolean(invoiceSent),
    completionCount: Object.values(steps).filter(Boolean).length,
    acceptedQuote,
    signedContract,
    paidInvoice,
  };
}

function deriveProjectStatus(session, booking, emailLogs) {
  const projectCreated = Boolean(session?.projectCreatedAt || booking.isBooked);
  const portalReady = projectCreated;
  const portalAccessSent = Boolean(session?.portalAccessSentAt || emailLogs.some((entry) => entry.kind === "portal_access"));
  const availabilitySent = Boolean(session?.availabilityEmailSentAt || emailLogs.some((entry) => entry.kind === "availability"));
  const calendarInviteSent = Boolean(session?.calendarInviteSentAt || emailLogs.some((entry) => entry.kind === "calendar_invite"));

  return {
    projectCreated,
    projectCreatedAt: session?.projectCreatedAt || "",
    portalReady,
    portalAccessSent,
    portalAccessSentAt: session?.portalAccessSentAt || "",
    availabilitySent,
    availabilitySentAt: session?.availabilityEmailSentAt || "",
    calendarInviteSent,
    calendarInviteSentAt: session?.calendarInviteSentAt || "",
  };
}

export function derivePipelineStage(bundle) {
  const { client, inquiry, quotes = [], contracts = [], invoices = [], session } = bundle;
  const booking = deriveBookingState(bundle);
  const quote = quotes[0];
  const contract = contracts[0];
  const sentInvoice = invoices.find((entry) => ["sent", "partially_paid", "paid"].includes(entry.status));

  if (inquiry?.status === "lost") return "lost";
  if (client?.status === "archived") return "archived";
  if (session?.galleryStatus === "delivered") return "gallery_delivered";
  if (session?.status === "completed") return "completed";
  if (session?.status === "scheduled" && session.sessionDate) return "session_scheduled";
  if (booking.isBooked) return "deposit_paid";
  if (sentInvoice) return "invoice_sent";
  if (contract?.status === "signed") return "contract_signed";
  if (contract?.status === "sent") return "contract_sent";
  if (quote?.status === "accepted") return "quote_accepted";
  if (quote?.status === "sent" || quote?.status === "viewed") return "quote_sent";
  if (quote?.status === "draft") return "quote_drafted";
  if (inquiry?.status === "approved" || inquiry?.status === "converted") return "needs_review";
  return "new_inquiry";
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function crmReducer(state, action) {
  switch (action.type) {
    case "select_client":
      return { ...state, selectedClientId: action.clientId };

    case "approve_inquiry": {
      const inquiry = state.inquiries.find((entry) => entry.id === action.inquiryId);
      if (!inquiry) return state;

      let clientId = inquiry.clientId;
      let clients = state.clients;
      let sessions = state.sessions;
      let portalProfiles = state.portalProfiles;

      if (!clientId) {
        clientId = nextId("client");
        const packageId = resolvePackage(state.packages, inquiry.packageId, inquiry.sessionType)?.id || state.packages[0]?.id || null;
        clients = [
          {
            id: clientId,
            inquiryId: inquiry.id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            sessionType: inquiry.sessionType,
            packageId,
            status: "active",
            city: inquiry.location,
            preferredLocationId: state.locations[0]?.id || null,
            tags: ["New lead"],
          },
          ...state.clients,
        ];
        sessions = [
          {
            id: nextId("session"),
            clientId,
            quoteId: null,
            contractId: null,
            invoiceIds: [],
            sessionType: inquiry.sessionType,
            status: "planning",
            sessionDate: "",
            sessionTime: "",
            locationId: state.locations[0]?.id || null,
            prepStatus: "not_started",
            galleryStatus: "not_ready",
            projectCreatedAt: "",
            portalAccessSentAt: "",
            availabilityEmailSentAt: "",
            calendarInviteSentAt: "",
            notes: "Lead approved. Build proposal next.",
          },
          ...state.sessions,
        ];
        portalProfiles = [
          {
            clientId,
            useProjectDetails: true,
            customDate: "",
            customTime: "",
            customLocation: "",
            sessionVision: "",
            sessionNotes: "",
            propList: [],
            visionImages: [],
            galleryImages: [],
            galleryLink: { url: "", title: "", previewImage: "" },
            printStoreLink: "",
            planPrepSteps: defaultPortalSteps.map((step) => ({ ...step })),
          },
          ...state.portalProfiles,
        ];
      }

      return withActivity(
        {
          ...state,
          selectedClientId: clientId,
          clients,
          sessions,
          portalProfiles,
          inquiries: state.inquiries.map((entry) =>
            entry.id === action.inquiryId ? { ...entry, clientId, status: "approved" } : entry,
          ),
        },
        inquiry.name,
        "Inquiry approved and converted into an active client record.",
      );
    }

    case "patch_inquiry": {
      return {
        ...state,
        inquiries: state.inquiries.map((entry) =>
          entry.id === action.inquiryId ? { ...entry, ...action.patch } : entry,
        ),
      };
    }

    case "start_quote_from_inquiry": {
      const inquiry = state.inquiries.find((entry) => entry.id === action.inquiryId);
      if (!inquiry) return state;

      let clientId = inquiry.clientId;
      let clients = state.clients;
      let sessions = state.sessions;
      let portalProfiles = state.portalProfiles;
      const pkg = resolvePackage(state.packages, inquiry.packageId, inquiry.sessionType);

      if (!clientId) {
        clientId = nextId("client");
        clients = [
          {
            id: clientId,
            inquiryId: inquiry.id,
            name: inquiry.name,
            email: inquiry.email,
            phone: inquiry.phone,
            sessionType: inquiry.sessionType,
            packageId: pkg?.id || state.packages[0]?.id || null,
            status: "active",
            city: inquiry.location,
            preferredLocationId: state.locations[0]?.id || null,
            tags: ["Lead converted"],
          },
          ...state.clients,
        ];
        sessions = [
          {
            id: nextId("session"),
            clientId,
            quoteId: null,
            contractId: null,
            invoiceIds: [],
            sessionType: inquiry.sessionType,
            status: "planning",
            sessionDate: "",
            sessionTime: "",
            locationId: state.locations[0]?.id || null,
            prepStatus: "quote_in_progress",
            galleryStatus: "not_ready",
            projectCreatedAt: "",
            portalAccessSentAt: "",
            availabilityEmailSentAt: "",
            calendarInviteSentAt: "",
            notes: "Quote started from the client inquiry.",
          },
          ...state.sessions,
        ];
        portalProfiles = [
          {
            clientId,
            useProjectDetails: true,
            customDate: "",
            customTime: "",
            customLocation: "",
            sessionVision: inquiry.notes || "",
            sessionNotes: "",
            propList: [],
            visionImages: [],
            galleryImages: [],
            galleryLink: { url: "", title: "", previewImage: "" },
            printStoreLink: "",
            planPrepSteps: defaultPortalSteps.map((step) => ({ ...step })),
          },
          ...state.portalProfiles,
        ];
      } else {
        clients = state.clients.map((entry) =>
          entry.id === clientId
            ? { ...entry, packageId: pkg?.id || entry.packageId, sessionType: inquiry.sessionType || entry.sessionType, city: inquiry.location || entry.city }
            : entry,
        );
      }

      const bundleAfterClient = getClientBundle({ ...state, clients, sessions, portalProfiles }, clientId);
      const existing = bundleAfterClient.quotes.find((entry) => activeQuoteStatuses.includes(entry.status));
      const quote = existing || recalcQuote({
        id: nextId("quote"),
        number: `QUO-${1000 + state.quotes.length + 1}`,
        clientId,
        inquiryId: inquiry.id,
        eventType: inquiry.sessionType,
        sessionDate: inquiry.desiredDate || "",
        location: inquiry.location || "",
        status: "draft",
        lineItems: [],
        optionGroups: [buildPackageOptionGroup(state.packages, pkg?.id, inquiry.sessionType)],
        discount: 0,
        tax: 0,
        notes: buildQuoteNotesFromInquiry(inquiry, pkg) || "Drafted from the inquiry form.",
        expirationDate: "",
        createdAt: dayStamp(),
        sentAt: "",
        viewedAt: "",
        acceptedAt: "",
      });

      return withActivity(
        {
          ...state,
          selectedClientId: clientId,
          clients,
          sessions: sessions.map((entry) => entry.clientId === clientId ? { ...entry, quoteId: quote.id } : entry),
          portalProfiles,
          inquiries: state.inquiries.map((entry) =>
            entry.id === inquiry.id ? { ...entry, clientId, status: entry.status === "new" ? "approved" : entry.status, packageId: pkg?.id || entry.packageId } : entry,
          ),
          quotes: existing ? state.quotes : [quote, ...state.quotes],
        },
        inquiry.name,
        existing ? `Opened existing quote ${existing.number} from inquiry.` : `Quote ${quote.number} drafted from the inquiry form.`,
      );
    }

    case "create_quote": {
      const bundle = getClientBundle(state, action.clientId);
      if (!bundle.client) return state;
      const existing = bundle.quotes.find((entry) => activeQuoteStatuses.includes(entry.status));
      if (existing && !action.force) {
        return { ...state, selectedClientId: action.clientId };
      }
      const pkg = resolvePackage(state.packages, bundle.inquiry?.packageId || bundle.client.packageId, bundle.client.sessionType);
      const quote = recalcQuote({
        id: nextId("quote"),
        number: `QUO-${1000 + state.quotes.length + 1}`,
        clientId: action.clientId,
        inquiryId: bundle.client.inquiryId,
        eventType: bundle.client.sessionType,
        sessionDate: bundle.inquiry?.desiredDate || "",
        location: bundle.client.city || "",
        status: "draft",
        lineItems: [],
        optionGroups: [buildPackageOptionGroup(state.packages, pkg?.id || bundle.client.packageId, bundle.client.sessionType)],
        discount: 0,
        tax: 0,
        notes: buildQuoteNotesFromInquiry(bundle.inquiry, pkg) || "Drafted inside EC Creative Studios CRM.",
        expirationDate: "",
        createdAt: dayStamp(),
        sentAt: "",
        viewedAt: "",
        acceptedAt: "",
      });
      return withActivity(
        {
          ...state,
          selectedClientId: action.clientId,
          quotes: [quote, ...state.quotes],
          sessions: state.sessions.map((entry) =>
            entry.clientId === action.clientId ? { ...entry, quoteId: quote.id } : entry,
          ),
        },
        bundle.client.name,
        `Quote ${quote.number} drafted.`,
      );
    }

    case "add_quote_catalog_item": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                lineItems: [
                  ...entry.lineItems,
                  { id: nextId("qi"), name: action.name, description: action.description || "", quantity: 1, unitPrice: action.unitPrice || 0, optional: Boolean(action.optional) },
                ],
              })
            : entry,
        ),
      };
    }

    case "patch_quote": {
      return {
        ...state,
        quotes: state.quotes.map((entry) => {
          if (entry.id !== action.quoteId) return entry;
          if (entry.locked && !action.patch?.locked) return entry;
          return recalcQuote({ ...entry, ...action.patch });
        }),
      };
    }

    case "add_quote_item": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                lineItems: [
                  ...entry.lineItems,
                  { id: nextId("qi"), name: "Custom line item", description: "", quantity: 1, unitPrice: 0 },
                ],
              })
            : entry,
        ),
      };
    }

    case "patch_quote_item": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                lineItems: entry.lineItems.map((item) =>
                  item.id === action.itemId ? { ...item, ...action.patch } : item,
                ),
              })
            : entry,
        ),
      };
    }

    case "remove_quote_item": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                lineItems: entry.lineItems.filter((item) => item.id !== action.itemId),
              })
            : entry,
        ),
      };
    }

    case "delete_quote": {
      const quote = state.quotes.find((entry) => entry.id === action.quoteId);
      if (!quote) return state;
      const bundle = getClientBundle(state, quote.clientId);
      return withActivity(
        {
          ...state,
          quotes: state.quotes.filter((entry) => entry.id !== action.quoteId),
          sessions: state.sessions.map((entry) =>
            entry.quoteId === action.quoteId ? { ...entry, quoteId: null } : entry,
          ),
        },
        bundle.client?.name || "Client",
        `${quote.number} deleted.`,
      );
    }

    case "add_quote_package_group": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                optionGroups: [
                  ...(entry.optionGroups || []),
                  buildPackageOptionGroup(state.packages, action.selectedPackageId),
                ],
              })
            : entry,
        ),
      };
    }

    case "patch_quote_option_group": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                optionGroups: (entry.optionGroups || []).map((group) =>
                  group.id === action.groupId ? { ...group, ...action.patch } : group,
                ),
              })
            : entry,
        ),
      };
    }

    case "remove_quote_option_group": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({ ...entry, optionGroups: (entry.optionGroups || []).filter((group) => group.id !== action.groupId) })
            : entry,
        ),
      };
    }

    case "add_quote_option": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                optionGroups: (entry.optionGroups || []).map((group) =>
                  group.id === action.groupId
                    ? {
                        ...group,
                        options: [
                          ...(group.options || []),
                          { id: nextId("qopt"), name: "New package option", description: "", quantity: 1, unitPrice: 0 },
                        ],
                      }
                    : group,
                ),
              })
            : entry,
        ),
      };
    }

    case "patch_quote_option": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                optionGroups: (entry.optionGroups || []).map((group) =>
                  group.id === action.groupId
                    ? {
                        ...group,
                        options: (group.options || []).map((option) =>
                          option.id === action.optionId ? { ...option, ...action.patch } : option,
                        ),
                      }
                    : group,
                ),
              })
            : entry,
        ),
      };
    }

    case "remove_quote_option": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                optionGroups: (entry.optionGroups || []).map((group) => ({
                  ...group,
                  selectedOptionIds: (group.selectedOptionIds || []).filter((id) => id !== action.optionId),
                  options: (group.options || []).filter((option) => option.id !== action.optionId),
                })),
              })
            : entry,
        ),
      };
    }

    case "select_quote_option": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId
            ? recalcQuote({
                ...entry,
                optionGroups: (entry.optionGroups || []).map((group) => {
                  if (group.id !== action.groupId) return group;
                  if (group.selectionMode === "multiple") {
                    const selected = new Set(group.selectedOptionIds || []);
                    if (action.selected) selected.add(action.optionId);
                    else selected.delete(action.optionId);
                    return { ...group, selectedOptionIds: Array.from(selected) };
                  }
                  return { ...group, selectedOptionIds: [action.optionId] };
                }),
              })
            : entry,
        ),
      };
    }

    case "send_quote":
    case "view_quote":
    case "accept_quote":
    case "decline_quote": {
      const statusMap = {
        send_quote: ["sent", "sentAt", "Quote sent to client."],
        view_quote: ["viewed", "viewedAt", "Client viewed quote."],
        accept_quote: ["accepted", "acceptedAt", "Quote accepted."],
        decline_quote: ["declined", "declinedAt", "Quote declined."],
      };
      const [status, dateField, text] = statusMap[action.type];
      const quote = state.quotes.find((entry) => entry.id === action.quoteId);
      if (!quote) return state;
      return withActivity(
        {
          ...state,
          quotes: state.quotes.map((entry) =>
            entry.id === action.quoteId ? { ...entry, status, [dateField]: dayStamp(), locked: action.type === "send_quote" ? true : entry.locked } : entry,
          ),
        },
        getClientBundle(state, quote.clientId).client?.name || "Client",
        `${quote.number} ${text.toLowerCase()}`,
      );
    }

    case "create_contract": {
      const bundle = getClientBundle(state, action.clientId);
      const quote = bundle.quotes.find((entry) => entry.status === "accepted");
      if (!bundle.client || !quote) return state;
      const existing = bundle.contracts.find((entry) => activeContractStatuses.includes(entry.status));
      if (existing) return { ...state, selectedClientId: action.clientId };
      const contract = {
        id: nextId("contract"),
        number: `CON-${1000 + state.contracts.length + 1}`,
        clientId: action.clientId,
        quoteId: quote.id,
        templateName: "Portrait Session Agreement",
        status: "draft",
        createdAt: dayStamp(),
        sentAt: "",
        signedAt: "",
        signerName: "",
        clauses: DEFAULT_CONTRACT_CLAUSES.map((clause) => ({ ...clause })),
      };
      return withActivity(
        {
          ...state,
          selectedClientId: action.clientId,
          contracts: [contract, ...state.contracts],
          sessions: state.sessions.map((entry) =>
            entry.clientId === action.clientId ? { ...entry, contractId: contract.id } : entry,
          ),
        },
        bundle.client.name,
        `Contract ${contract.number} generated from ${quote.number}.`,
      );
    }

    case "send_contract":
    case "sign_contract": {
      const status = action.type === "send_contract" ? "sent" : "signed";
      const field = action.type === "send_contract" ? "sentAt" : "signedAt";
      const contract = state.contracts.find((entry) => entry.id === action.contractId);
      if (!contract) return state;
      const nextState = {
        ...state,
        contracts: state.contracts.map((entry) =>
            entry.id === action.contractId
              ? {
                  ...entry,
                  status,
                  [field]: dayStamp(),
                  signerName: status === "signed" ? getClientBundle(state, entry.clientId).client?.name || "" : entry.signerName,
                }
              : entry,
          ),
        sessions: state.sessions.map((entry) =>
            entry.contractId === action.contractId
              ? {
                  ...entry,
                  status: status === "signed" ? "payment_pending" : "contract_pending",
                  prepStatus: status === "signed" ? "awaiting_invoice" : entry.prepStatus,
                }
              : entry,
          ),
      };
      return withActivity(
        maybeCreateProjectForClient(nextState, contract.clientId),
        getClientBundle(state, contract.clientId).client?.name || "Client",
        `${contract.number} ${status === "sent" ? "sent for signature." : "signed by client."}`,
      );
    }

    case "create_invoice": {
      const bundle = getClientBundle(state, action.clientId);
      const client = bundle.client;
      const quote = bundle.quotes.find((entry) => entry.status === "accepted") || bundle.primaryQuote;
      const contract = bundle.contracts.find((entry) => entry.status === "signed") || bundle.primaryContract;
      const session = bundle.session;
      if (!client || !quote) return state;
      const existing = bundle.invoices.find(
        (entry) => entry.kind === action.kind && activeInvoiceStatuses.includes(entry.status),
      );
      if (existing) return { ...state, selectedClientId: action.clientId };

      const depositAmount = money(Math.round(quote.total * 0.5));
      const fullAmount = money(quote.total);
      const alreadyBilled = money(bundle.invoices.reduce((total, entry) => total + entry.total, 0));
      const remainingAmount = money(Math.max(0, quote.total - alreadyBilled));
      const invoiceAmount =
        action.kind === "deposit" ? depositAmount : action.kind === "final" ? remainingAmount || money(quote.total - depositAmount) : fullAmount;
      const label =
        action.kind === "deposit"
          ? "Deposit to secure session"
          : action.kind === "final"
            ? "Final balance"
            : "Full payment";
      const invoice = recalcInvoice({
        id: nextId("invoice"),
        number: `INV-${1000 + state.invoices.length + 1}`,
        kind: action.kind,
        clientId: action.clientId,
        quoteId: quote.id,
        contractId: contract?.id || null,
        sessionId: session?.id || null,
        status: "draft",
        lineItems: buildInvoiceItems(label, invoiceAmount),
        tax: 0,
        amountPaid: 0,
        dueDate: "",
        createdAt: dayStamp(),
        sentAt: "",
        paidAt: "",
        paymentMethod: "",
        internalNotes: "",
        locked: false,
      });
      return withActivity(
        {
          ...state,
          selectedClientId: action.clientId,
          invoices: [invoice, ...state.invoices],
          sessions: state.sessions.map((entry) =>
            entry.clientId === action.clientId
              ? { ...entry, invoiceIds: Array.from(new Set([...(entry.invoiceIds || []), invoice.id])) }
              : entry,
          ),
        },
        client.name,
        `${label} invoice ${invoice.number} drafted.`,
      );
    }

    case "patch_invoice": {
      return {
        ...state,
        invoices: state.invoices.map((entry) => {
          if (entry.id !== action.invoiceId) return entry;
          if (entry.status === "paid") return entry;
          if (entry.locked && !action.patch?.locked) return entry;
          return recalcInvoice({ ...entry, ...action.patch });
        }),
      };
    }

    case "send_invoice": {
      const invoice = state.invoices.find((entry) => entry.id === action.invoiceId);
      if (!invoice) return state;
      return withActivity(
        {
          ...state,
          invoices: state.invoices.map((entry) =>
            entry.id === action.invoiceId ? { ...entry, status: "sent", sentAt: dayStamp(), locked: true } : entry,
          ),
          sessions: state.sessions.map((entry) =>
            entry.id === invoice.sessionId ? { ...entry, status: "payment_pending", prepStatus: "invoice_sent" } : entry,
          ),
          emailLogs: [
            {
              id: nextId("email"),
              clientId: invoice.clientId,
              kind: "invoice",
              subject: `${invoice.number} from EC Creative Studios`,
              sentAt: dayStamp(),
            },
            ...(state.emailLogs || []),
          ],
        },
        getClientBundle(state, invoice.clientId).client?.name || "Client",
        `${invoice.number} sent to client.`,
      );
    }

    case "record_payment": {
      const invoice = state.invoices.find((entry) => entry.id === action.invoiceId);
      if (!invoice) return state;
      const amount = money(Math.min(Number(action.amount || 0), invoice.balanceDue));
      if (!amount) return state;
      const updatedInvoice = recalcInvoice({
        ...invoice,
        amountPaid: money(invoice.amountPaid + amount),
        paidAt: dayStamp(),
        paymentMethod: action.method || invoice.paymentMethod || "Manual",
      });
      const status =
        updatedInvoice.balanceDue <= 0 ? "paid" : updatedInvoice.amountPaid > 0 ? "partially_paid" : updatedInvoice.status;
      const finalInvoice = { ...updatedInvoice, status, locked: status === "paid" ? true : invoice.locked };
      const nextState = {
        ...state,
        invoices: state.invoices.map((entry) => (entry.id === action.invoiceId ? finalInvoice : entry)),
        payments: [
          {
            id: nextId("payment"),
            clientId: invoice.clientId,
            invoiceId: invoice.id,
            amount,
            method: action.method || "Manual",
            paidAt: dayStamp(),
            note: action.note || "",
          },
          ...state.payments,
        ],
        sessions: state.sessions.map((entry) =>
          entry.id === invoice.sessionId
            ? {
                ...entry,
                status:
                  invoice.kind === "deposit" && finalInvoice.status === "paid"
                    ? "awaiting_schedule"
                    : finalInvoice.status === "paid"
                      ? entry.status
                      : "payment_pending",
                prepStatus:
                  invoice.kind === "deposit" && finalInvoice.status === "paid"
                    ? "awaiting_client_date"
                    : entry.prepStatus,
              }
            : entry,
        ),
      };
      return withActivity(
        maybeCreateProjectForClient(nextState, invoice.clientId),
        getClientBundle(state, invoice.clientId).client?.name || "Client",
        `Payment of ${formatCurrency(amount)} applied to ${invoice.number}.`,
      );
    }

    case "send_portal_access": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      const nextState = {
        ...state,
        sessions: state.sessions.map((entry) =>
          entry.clientId === action.clientId ? { ...entry, portalAccessSentAt: entry.portalAccessSentAt || dayStamp() } : entry,
        ),
        emailLogs: [
          {
            id: nextId("email"),
            clientId: action.clientId,
            kind: "portal_access",
            subject: "Your EC Creative Studios portal is ready",
            sentAt: dayStamp(),
          },
          ...(state.emailLogs || []),
        ],
      };
      return withActivity(
        nextState,
        client.name,
        "Portal access email sent to client.",
      );
    }

    case "send_booking_reminder": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      return withActivity(
        {
          ...state,
          emailLogs: [
            {
              id: nextId("email"),
              clientId: action.clientId,
              kind: "booking_reminder",
              subject: "Your session is not booked yet",
              sentAt: dayStamp(),
            },
            ...(state.emailLogs || []),
          ],
        },
        client.name,
        "Booking reminder email sent.",
      );
    }

    case "send_availability": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      return withActivity(
        {
          ...state,
          sessions: state.sessions.map((entry) =>
            entry.clientId === action.clientId ? { ...entry, availabilityEmailSentAt: entry.availabilityEmailSentAt || dayStamp() } : entry,
          ),
          emailLogs: [
            {
              id: nextId("email"),
              clientId: action.clientId,
              kind: "availability",
              subject: "Choose your EC Creative Studios session date",
              sentAt: dayStamp(),
            },
            ...(state.emailLogs || []),
          ],
        },
        client.name,
        "Availability email sent with date selection link.",
      );
    }

    case "send_calendar_invite": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      return withActivity(
        {
          ...state,
          sessions: state.sessions.map((entry) =>
            entry.clientId === action.clientId ? { ...entry, calendarInviteSentAt: entry.calendarInviteSentAt || dayStamp() } : entry,
          ),
          emailLogs: [
            {
              id: nextId("email"),
              clientId: action.clientId,
              kind: "calendar_invite",
              subject: "Your EC Creative Studios session calendar invite",
              sentAt: dayStamp(),
            },
            ...(state.emailLogs || []),
          ],
        },
        client.name,
        "Calendar invite email sent with ICS attachment.",
      );
    }

    case "schedule_session": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      return withActivity(
        {
          ...state,
          sessions: state.sessions.map((entry) =>
            entry.clientId === action.clientId
              ? {
                  ...entry,
                  status: "scheduled",
                  sessionDate: action.date,
                  sessionTime: action.time,
                  prepStatus: "scheduled",
                  locationId: action.locationId || entry.locationId,
                  projectCreatedAt: entry.projectCreatedAt || dayStamp(),
                  notes: "Session date secured through portal.",
                }
              : entry,
          ),
          portalProfiles: state.portalProfiles.map((entry) =>
            entry.clientId === action.clientId
              ? {
                  ...entry,
                  useProjectDetails: false,
                  customDate: action.date,
                  customTime: action.time,
                  customLocation: action.locationName || entry.customLocation,
                }
              : entry,
          ),
          invoices: state.invoices.map((entry) =>
            entry.clientId === action.clientId && entry.kind === "final" && entry.status !== "paid"
              ? { ...entry, dueDate: action.date, internalNotes: entry.internalNotes || "Final balance due before or on the session date. Reminder should send 7 days before the shoot." }
              : entry,
          ),
        },
        client.name,
        `Session scheduled for ${action.date} at ${action.time}.`,
      );
    }

    case "complete_session": {
      const session = state.sessions.find((entry) => entry.id === action.sessionId);
      if (!session) return state;
      return withActivity(
        {
          ...state,
          sessions: state.sessions.map((entry) =>
            entry.id === action.sessionId ? { ...entry, status: "completed", galleryStatus: "ready_for_delivery" } : entry,
          ),
        },
        getClientBundle(state, session.clientId).client?.name || "Client",
        "Session marked complete.",
      );
    }

    case "update_portal": {
      return {
        ...state,
        portalProfiles: state.portalProfiles.map((entry) =>
          entry.clientId === action.clientId ? { ...entry, ...action.patch } : entry,
        ),
      };
    }

    case "send_message": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client || !action.text?.trim()) return state;
      return withActivity(
        {
          ...state,
          messages: [
            {
              id: nextId("msg"),
              clientId: action.clientId,
              from: action.from || "studio",
              text: action.text.trim(),
              createdAt: stamp(),
            },
            ...state.messages,
          ],
        },
        client.name,
        `${action.from === "client" ? "Client" : "Studio"} message added.`,
      );
    }

    case "force_stage": {
      const { clientId, stageKey } = action;
      const targetRank = FORCE_STAGE_ORDER.indexOf(stageKey);
      if (targetRank === -1) return state;

      let working = state;
      let bundle = getClientBundle(working, clientId);
      if (!bundle.client) return state;
      const clientName = bundle.client.name;
      const pkg = resolvePackage(working.packages, bundle.inquiry?.packageId || bundle.client.packageId, bundle.client.sessionType);

      if (targetRank >= FORCE_STAGE_ORDER.indexOf("quote_drafted")) {
        bundle = getClientBundle(working, clientId);
        let quote = bundle.quotes.find((entry) => activeQuoteStatuses.includes(entry.status)) || bundle.quotes[0];
        if (!quote) {
          quote = recalcQuote({
            id: nextId("quote"),
            number: `QUO-${1000 + working.quotes.length + 1}`,
            clientId,
            inquiryId: bundle.client.inquiryId,
            eventType: bundle.client.sessionType,
            sessionDate: bundle.inquiry?.desiredDate || "",
            location: bundle.client.city || "",
            status: "draft",
            lineItems: [],
            optionGroups: [buildPackageOptionGroup(working.packages, pkg?.id || bundle.client.packageId, bundle.client.sessionType)],
            discount: 0,
            tax: 0,
            notes: buildQuoteNotesFromInquiry(bundle.inquiry, pkg) || "Drafted via Manual Override.",
            expirationDate: "",
            createdAt: dayStamp(),
            sentAt: "",
            viewedAt: "",
            acceptedAt: "",
          });
          working = {
            ...working,
            quotes: [quote, ...working.quotes],
            sessions: working.sessions.map((entry) => (entry.clientId === clientId ? { ...entry, quoteId: quote.id } : entry)),
          };
        }
        if (targetRank >= FORCE_STAGE_ORDER.indexOf("quote_sent") && quote.status === "draft") {
          quote = { ...quote, status: "sent", sentAt: quote.sentAt || dayStamp() };
          working = { ...working, quotes: working.quotes.map((entry) => (entry.id === quote.id ? quote : entry)) };
        }
        if (targetRank >= FORCE_STAGE_ORDER.indexOf("quote_accepted") && quote.status !== "accepted") {
          quote = { ...quote, status: "accepted", acceptedAt: dayStamp() };
          working = { ...working, quotes: working.quotes.map((entry) => (entry.id === quote.id ? quote : entry)) };
        }
      }

      if (targetRank >= FORCE_STAGE_ORDER.indexOf("contract_sent")) {
        bundle = getClientBundle(working, clientId);
        const acceptedQuote = bundle.quotes.find((entry) => entry.status === "accepted");
        let contract = bundle.contracts.find((entry) => activeContractStatuses.includes(entry.status)) || bundle.contracts[0];
        if (!contract && acceptedQuote) {
          contract = {
            id: nextId("contract"),
            number: `CON-${1000 + working.contracts.length + 1}`,
            clientId,
            quoteId: acceptedQuote.id,
            templateName: "Portrait Session Agreement",
            status: "draft",
            createdAt: dayStamp(),
            sentAt: "",
            signedAt: "",
            signerName: "",
            clauses: DEFAULT_CONTRACT_CLAUSES.map((clause) => ({ ...clause })),
          };
          working = {
            ...working,
            contracts: [contract, ...working.contracts],
            sessions: working.sessions.map((entry) => (entry.clientId === clientId ? { ...entry, contractId: contract.id } : entry)),
          };
        }
        if (contract && contract.status === "draft") {
          contract = { ...contract, status: "sent", sentAt: contract.sentAt || dayStamp() };
          working = { ...working, contracts: working.contracts.map((entry) => (entry.id === contract.id ? contract : entry)) };
        }
        if (contract && targetRank >= FORCE_STAGE_ORDER.indexOf("contract_signed") && contract.status !== "signed") {
          contract = { ...contract, status: "signed", signedAt: dayStamp(), signerName: clientName };
          working = { ...working, contracts: working.contracts.map((entry) => (entry.id === contract.id ? contract : entry)) };
          working = maybeCreateProjectForClient(working, clientId);
        }
      }

      if (targetRank >= FORCE_STAGE_ORDER.indexOf("invoice_sent")) {
        bundle = getClientBundle(working, clientId);
        const acceptedQuote = bundle.quotes.find((entry) => entry.status === "accepted");
        const signedContract = bundle.contracts.find((entry) => entry.status === "signed");
        let invoice = bundle.invoices.find((entry) => entry.kind === "deposit") || bundle.invoices[0];
        if (!invoice && acceptedQuote) {
          const depositAmount = money(Math.round(acceptedQuote.total * 0.4));
          invoice = recalcInvoice({
            id: nextId("invoice"),
            number: `INV-${1000 + working.invoices.length + 1}`,
            kind: "deposit",
            clientId,
            quoteId: acceptedQuote.id,
            contractId: signedContract?.id || null,
            sessionId: bundle.session?.id || null,
            status: "draft",
            lineItems: buildInvoiceItems("Deposit to secure session", depositAmount),
            tax: 0,
            amountPaid: 0,
            dueDate: "",
            createdAt: dayStamp(),
            sentAt: "",
            paidAt: "",
            paymentMethod: "",
            internalNotes: "Created via Manual Override.",
          });
          working = {
            ...working,
            invoices: [invoice, ...working.invoices],
            sessions: working.sessions.map((entry) =>
              entry.clientId === clientId
                ? { ...entry, invoiceIds: Array.from(new Set([...(entry.invoiceIds || []), invoice.id])) }
                : entry,
            ),
          };
        }
        if (invoice && invoice.status === "draft") {
          invoice = { ...invoice, status: "sent", sentAt: invoice.sentAt || dayStamp() };
          working = { ...working, invoices: working.invoices.map((entry) => (entry.id === invoice.id ? invoice : entry)) };
        }
        if (invoice && targetRank >= FORCE_STAGE_ORDER.indexOf("deposit_paid") && invoice.balanceDue > 0) {
          const amount = invoice.balanceDue;
          const updated = recalcInvoice({ ...invoice, amountPaid: invoice.total, paidAt: dayStamp(), paymentMethod: invoice.paymentMethod || "Manual override" });
          const finalInvoice = { ...updated, status: "paid" };
          working = {
            ...working,
            invoices: working.invoices.map((entry) => (entry.id === invoice.id ? finalInvoice : entry)),
            payments: [
              { id: nextId("payment"), clientId, invoiceId: invoice.id, amount, method: "Manual override", paidAt: dayStamp(), note: "Recorded via Manual Override" },
              ...working.payments,
            ],
            sessions: working.sessions.map((entry) =>
              entry.clientId === clientId ? { ...entry, status: "awaiting_schedule", prepStatus: "awaiting_client_date" } : entry,
            ),
          };
          working = maybeCreateProjectForClient(working, clientId);
        }
      }

      if (targetRank >= FORCE_STAGE_ORDER.indexOf("session_scheduled")) {
        bundle = getClientBundle(working, clientId);
        const session = bundle.session;
        if (session && !session.sessionDate) {
          const slot = { date: "Jul 20, 2026", time: "4:30 PM", locationName: "Mint Room Studios" };
          working = {
            ...working,
            sessions: working.sessions.map((entry) =>
              entry.id === session.id
                ? { ...entry, status: "scheduled", sessionDate: slot.date, sessionTime: slot.time, prepStatus: "scheduled", projectCreatedAt: entry.projectCreatedAt || dayStamp() }
                : entry,
            ),
            portalProfiles: working.portalProfiles.map((entry) =>
              entry.clientId === clientId
                ? { ...entry, useProjectDetails: false, customDate: slot.date, customTime: slot.time, customLocation: slot.locationName }
                : entry,
            ),
          };
        }
      }

      if (targetRank >= FORCE_STAGE_ORDER.indexOf("completed")) {
        bundle = getClientBundle(working, clientId);
        const session = bundle.session;
        if (session && session.status !== "completed") {
          working = {
            ...working,
            sessions: working.sessions.map((entry) => (entry.id === session.id ? { ...entry, status: "completed", galleryStatus: "ready_for_delivery" } : entry)),
          };
        }
      }

      if (targetRank >= FORCE_STAGE_ORDER.indexOf("gallery_delivered")) {
        bundle = getClientBundle(working, clientId);
        const session = bundle.session;
        if (session && session.galleryStatus !== "delivered") {
          working = {
            ...working,
            sessions: working.sessions.map((entry) => (entry.id === session.id ? { ...entry, galleryStatus: "delivered", galleryDeliveredAt: dayStamp() } : entry)),
          };
        }
      }

      const targetLabel = PIPELINE_LABELS[stageKey] || stageKey;
      return withActivity(working, clientName, `Manual Override: fast-forwarded to "${targetLabel}".`);
    }

    case "mark_lost": {
      const bundle = getClientBundle(state, action.clientId);
      if (!bundle.client) return state;
      return withActivity(
        { ...state, inquiries: state.inquiries.map((entry) => (entry.id === bundle.client.inquiryId ? { ...entry, status: "lost" } : entry)) },
        bundle.client.name,
        "Marked as lost via Manual Override.",
      );
    }

    case "mark_archived": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      return withActivity(
        { ...state, clients: state.clients.map((entry) => (entry.id === action.clientId ? { ...entry, status: "archived" } : entry)) },
        client.name,
        "Client archived via Manual Override.",
      );
    }

    case "deliver_gallery": {
      const bundle = getClientBundle(state, action.clientId);
      if (!bundle.session) return state;
      return withActivity(
        {
          ...state,
          sessions: state.sessions.map((entry) =>
            entry.id === bundle.session.id ? { ...entry, galleryStatus: "delivered", galleryDeliveredAt: dayStamp() } : entry,
          ),
        },
        bundle.client?.name || "Client",
        "Gallery marked delivered.",
      );
    }

    case "update_studio_settings": {
      return { ...state, studioSettings: { ...state.studioSettings, ...action.patch } };
    }

    case "patch_contract": {
      return {
        ...state,
        contracts: state.contracts.map((entry) => (entry.id === action.contractId ? { ...entry, ...action.patch } : entry)),
      };
    }

    case "delete_contract": {
      const contract = state.contracts.find((entry) => entry.id === action.contractId);
      if (!contract) return state;
      const bundle = getClientBundle(state, contract.clientId);
      return withActivity(
        {
          ...state,
          contracts: state.contracts.filter((entry) => entry.id !== action.contractId),
          sessions: state.sessions.map((entry) =>
            entry.contractId === action.contractId ? { ...entry, contractId: null } : entry,
          ),
        },
        bundle.client?.name || "Client",
        `${contract.number} deleted.`,
      );
    }

    case "add_invoice_catalog_item": {
      return {
        ...state,
        invoices: state.invoices.map((entry) =>
          entry.id === action.invoiceId && entry.status !== "paid" && !entry.locked
            ? recalcInvoice({
                ...entry,
                lineItems: [
                  ...entry.lineItems,
                  { id: nextId("ii"), name: action.name, description: action.description || "", quantity: 1, unitPrice: action.unitPrice || 0 },
                ],
              })
            : entry,
        ),
      };
    }

    case "add_invoice_item": {
      return {
        ...state,
        invoices: state.invoices.map((entry) =>
          entry.id === action.invoiceId && entry.status !== "paid" && !entry.locked
            ? recalcInvoice({
                ...entry,
                lineItems: [...entry.lineItems, { id: nextId("ii"), name: "Custom line item", description: "", quantity: 1, unitPrice: 0 }],
              })
            : entry,
        ),
      };
    }

    case "patch_invoice_item": {
      return {
        ...state,
        invoices: state.invoices.map((entry) =>
          entry.id === action.invoiceId && entry.status !== "paid" && !entry.locked
            ? recalcInvoice({
                ...entry,
                lineItems: entry.lineItems.map((item) => (item.id === action.itemId ? { ...item, ...action.patch } : item)),
              })
            : entry,
        ),
      };
    }

    case "remove_invoice_item": {
      return {
        ...state,
        invoices: state.invoices.map((entry) =>
          entry.id === action.invoiceId && entry.status !== "paid" && !entry.locked
            ? recalcInvoice({ ...entry, lineItems: entry.lineItems.filter((item) => item.id !== action.itemId) })
            : entry,
        ),
      };
    }

    case "delete_invoice": {
      const invoice = state.invoices.find((entry) => entry.id === action.invoiceId);
      if (!invoice) return state;
      const bundle = getClientBundle(state, invoice.clientId);
      return withActivity(
        {
          ...state,
          invoices: state.invoices.filter((entry) => entry.id !== action.invoiceId),
          payments: state.payments.filter((entry) => entry.invoiceId !== action.invoiceId),
          sessions: state.sessions.map((entry) =>
            (entry.invoiceIds || []).includes(action.invoiceId)
              ? { ...entry, invoiceIds: (entry.invoiceIds || []).filter((id) => id !== action.invoiceId) }
              : entry,
          ),
        },
        bundle.client?.name || "Client",
        `${invoice.number} deleted.`,
      );
    }

    case "set_availability": {
      const existing = state.availability.find((entry) => entry.date === action.date);
      const times = Array.from(new Set(action.times)).sort();
      const nextAvailability = existing
        ? state.availability.map((entry) => (entry.date === action.date ? { ...entry, times } : entry))
        : [...state.availability, { date: action.date, times }];
      return { ...state, availability: nextAvailability.filter((entry) => entry.times.length > 0), availabilityLastEditedAt: stamp() };
    }

    case "add_availability_slot": {
      const existing = state.availability.find((entry) => entry.date === action.date);
      if (existing) {
        if (existing.times.includes(action.time)) return state;
        return {
          ...state,
          availability: state.availability.map((entry) =>
            entry.date === action.date ? { ...entry, times: [...entry.times, action.time].sort() } : entry,
          ),
          availabilityLastEditedAt: stamp(),
        };
      }
      return { ...state, availability: [...state.availability, { date: action.date, times: [action.time] }], availabilityLastEditedAt: stamp() };
    }

    case "remove_availability_slot": {
      return {
        ...state,
        availability: state.availability
          .map((entry) => (entry.date === action.date ? { ...entry, times: entry.times.filter((time) => time !== action.time) } : entry))
          .filter((entry) => entry.times.length > 0),
        availabilityLastEditedAt: stamp(),
      };
    }

    case "schedule_email": {
      const entry = {
        id: nextId("sched"),
        clientId: action.clientId,
        subject: action.subject,
        body: action.body,
        sendAt: action.sendAt,
        createdAt: dayStamp(),
      };
      return withActivity(
        { ...state, scheduledEmails: [entry, ...state.scheduledEmails] },
        getClientBundle(state, action.clientId).client?.name || "Client",
        `Email scheduled for ${action.sendAt}: "${action.subject}".`,
      );
    }

    case "send_scheduled_email_now": {
      const entry = state.scheduledEmails.find((item) => item.id === action.id);
      if (!entry) return state;
      return withActivity(
        { ...state, scheduledEmails: state.scheduledEmails.filter((item) => item.id !== action.id) },
        getClientBundle(state, entry.clientId).client?.name || "Client",
        `Scheduled email sent now: "${entry.subject}".`,
      );
    }

    case "cancel_scheduled_email": {
      return { ...state, scheduledEmails: state.scheduledEmails.filter((item) => item.id !== action.id) };
    }

    case "add_addon": {
      const addon = { id: nextId("addon"), name: action.name || "New Add-On", description: action.description || "", price: action.price || 0 };
      return { ...state, addons: [...state.addons, addon] };
    }

    case "update_addon": {
      return { ...state, addons: state.addons.map((entry) => (entry.id === action.addonId ? { ...entry, ...action.patch } : entry)) };
    }

    case "remove_addon": {
      return { ...state, addons: state.addons.filter((entry) => entry.id !== action.addonId) };
    }

    case "create_client": {
      const clientId = nextId("client");
      const inquiryId = nextId("inq");
      const name = action.name?.trim() || "New Client";
      const sessionType = action.sessionType?.trim() || "Portrait Session";
      const pkg = resolvePackage(state.packages, action.packageId, sessionType);
      const inquiry = {
        id: inquiryId,
        clientId,
        name,
        email: action.email || "",
        phone: action.phone || "",
        sessionType,
        packageId: pkg?.id || action.packageId || null,
        budgetRange: action.budgetRange || "",
        desiredDate: action.desiredDate || "",
        location: action.location || "Miami, FL",
        notes: action.notes || "Created from quick add.",
        status: "approved",
        receivedAt: dayStamp(),
      };
      const client = {
        id: clientId,
        inquiryId,
        name,
        email: action.email || "",
        phone: action.phone || "",
        sessionType,
        packageId: pkg?.id || state.packages[0]?.id || null,
        status: "active",
        city: action.location || "Miami, FL",
        preferredLocationId: state.locations[0]?.id || null,
        tags: action.tags || ["Quick add"],
      };
      const session = {
        id: nextId("session"),
        clientId,
        quoteId: null,
        contractId: null,
        invoiceIds: [],
        sessionType,
        status: "planning",
        sessionDate: action.desiredDate || "",
        sessionTime: "",
        locationId: state.locations[0]?.id || null,
        prepStatus: "not_started",
        galleryStatus: "not_ready",
        projectCreatedAt: "",
        portalAccessSentAt: "",
        availabilityEmailSentAt: "",
        calendarInviteSentAt: "",
        notes: "Client created from quick add.",
      };
      const portal = {
        clientId,
        useProjectDetails: true,
        customDate: "",
        customTime: "",
        customLocation: "",
        sessionVision: "",
        sessionNotes: "",
        propList: [],
        visionImages: [],
        galleryImages: [],
        galleryLink: { url: "", title: "", previewImage: "" },
        printStoreLink: "",
        planPrepSteps: defaultPortalSteps.map((step) => ({ ...step })),
      };
      return withActivity(
        {
          ...state,
          selectedClientId: clientId,
          inquiries: [inquiry, ...state.inquiries],
          clients: [client, ...state.clients],
          sessions: [session, ...state.sessions],
          portalProfiles: [portal, ...state.portalProfiles],
        },
        name,
        "Client record created from the quick-add button.",
      );
    }

    case "create_inquiry": {
      const sessionType = action.sessionType || "Portrait Session";
      const pkg = resolvePackage(state.packages, action.packageId, sessionType);
      const inquiry = {
        id: nextId("inq"),
        clientId: null,
        name: action.name?.trim() || "New Inquiry",
        email: action.email || "",
        phone: action.phone || "",
        sessionType,
        packageId: pkg?.id || action.packageId || null,
        budgetRange: action.budgetRange || "",
        desiredDate: action.desiredDate || "",
        location: action.location || "Miami, FL",
        notes: action.notes || "Created from quick add.",
        status: "new",
        receivedAt: dayStamp(),
      };
      return { ...state, inquiries: [inquiry, ...state.inquiries] };
    }

    case "log_email": {
      const client = state.clients.find((entry) => entry.id === action.clientId);
      if (!client) return state;
      return withActivity(
        {
          ...state,
          emailLogs: [
            {
              id: nextId("email"),
              clientId: action.clientId,
              kind: action.kind || "manual",
              subject: action.subject || "Manual email",
              sentAt: dayStamp(),
            },
            ...(state.emailLogs || []),
          ],
        },
        client.name,
        `Manual email logged: "${action.subject || "Manual email"}".`,
      );
    }

    case "add_marketing_campaign": {
      const campaign = {
        id: nextId("camp"),
        name: action.name || "New Campaign",
        segment: action.segment || "All clients",
        status: "Draft",
        stats: "—",
        createdAt: dayStamp(),
      };
      return { ...state, marketingCampaigns: [campaign, ...(state.marketingCampaigns || [])] };
    }

    case "add_social_rule": {
      const rule = {
        id: nextId("rule"),
        keyword: (action.keyword || "KEYWORD").toUpperCase(),
        reply: action.reply || "Reply with booking link",
        count: 0,
      };
      return { ...state, socialRules: [rule, ...(state.socialRules || [])] };
    }

    case "refund_payment": {
      const payment = state.payments.find((entry) => entry.id === action.paymentId);
      if (!payment || payment.status === "refunded" || payment.amount <= 0) return state;
      const invoice = state.invoices.find((entry) => entry.id === payment.invoiceId);
      if (!invoice) return state;
      const amount = money(Number(action.amount || payment.amount));
      const nextPayments = state.payments.map((entry) =>
        entry.id === action.paymentId ? { ...entry, status: "refunded", refundedAt: dayStamp(), refundNote: action.note || "Refunded" } : entry,
      );
      const refund = {
        id: nextId("payment"),
        clientId: payment.clientId,
        invoiceId: payment.invoiceId,
        amount: -amount,
        method: payment.method,
        paidAt: dayStamp(),
        note: action.note || `Refund for ${formatCurrency(amount)}`,
        type: "refund",
        linkedPaymentId: payment.id,
      };
      const nextState = rebalanceInvoiceAfterPaymentChange({ ...state, payments: [refund, ...nextPayments] }, invoice.id, -amount);
      return withActivity(
        nextState,
        getClientBundle(state, payment.clientId).client?.name || "Client",
        `Refunded ${formatCurrency(amount)} from ${invoice.number}.`,
      );
    }

    case "delete_payment": {
      const payment = state.payments.find((entry) => entry.id === action.paymentId);
      if (!payment) return state;
      const invoice = state.invoices.find((entry) => entry.id === payment.invoiceId);
      const nextState = rebalanceInvoiceAfterPaymentChange(
        { ...state, payments: state.payments.filter((entry) => entry.id !== action.paymentId && entry.linkedPaymentId !== action.paymentId) },
        payment.invoiceId,
        -payment.amount,
      );
      return withActivity(
        nextState,
        getClientBundle(state, payment.clientId).client?.name || "Client",
        `Deleted ${formatCurrency(payment.amount)} payment${invoice ? ` from ${invoice.number}` : ""}.`,
      );
    }


    case "patch_session": {
      const session = state.sessions.find((entry) => entry.id === action.sessionId);
      if (!session) return state;
      const nextSession = { ...session, ...action.patch };
      const location = state.locations.find((entry) => entry.id === nextSession.locationId);
      const locationName = action.patch.locationName || location?.name || action.patch.customLocation;
      return withActivity(
        {
          ...state,
          sessions: state.sessions.map((entry) => (entry.id === action.sessionId ? nextSession : entry)),
          portalProfiles: state.portalProfiles.map((entry) =>
            entry.clientId === session.clientId
              ? {
                  ...entry,
                  useProjectDetails: false,
                  customDate: nextSession.sessionDate || entry.customDate,
                  customTime: nextSession.sessionTime || entry.customTime,
                  customLocation: locationName || entry.customLocation,
                }
              : entry,
          ),
          invoices: state.invoices.map((entry) =>
            entry.clientId === session.clientId && entry.kind === "final" && entry.status !== "paid"
              ? { ...entry, dueDate: nextSession.sessionDate || entry.dueDate }
              : entry,
          ),
        },
        getClientBundle(state, session.clientId).client?.name || "Client",
        "Session details updated.",
      );
    }

    case "update_email_template": {
      return {
        ...state,
        emailTemplates: (state.emailTemplates || defaultEmailTemplates).map((entry) =>
          entry.key === action.key ? { ...entry, ...action.patch } : entry,
        ),
      };
    }

    case "add_location": {
      const location = { id: nextId("loc"), name: action.name || "New Location", city: action.city || "Miami, FL", address: action.address || action.city || "Miami, FL" };
      return { ...state, locations: [...(state.locations || []), location] };
    }

    case "update_location": {
      return { ...state, locations: (state.locations || []).map((entry) => (entry.id === action.locationId ? { ...entry, ...action.patch } : entry)) };
    }

    case "remove_location": {
      return { ...state, locations: (state.locations || []).filter((entry) => entry.id !== action.locationId) };
    }

    case "update_calendar_connection": {
      return { ...state, calendarConnections: { ...(state.calendarConnections || {}), [action.provider]: action.connected } };
    }

    default:
      return state;
  }
}

function invoiceStatusAfterAmount(invoice) {
  if (invoice.balanceDue <= 0 && invoice.total > 0) return "paid";
  if (invoice.amountPaid > 0) return "partially_paid";
  if (invoice.sentAt) return "sent";
  return "draft";
}

function removeProjectIfPaymentGateBreaks(state, clientId) {
  const bundle = getClientBundle(state, clientId);
  if (bundle.booking.isBooked) return state;
  return {
    ...state,
    sessions: state.sessions.map((entry) =>
      entry.clientId === clientId
        ? {
            ...entry,
            status: entry.status === "completed" ? entry.status : "payment_pending",
            prepStatus: entry.status === "completed" ? entry.prepStatus : "invoice_sent",
            projectCreatedAt: "",
          }
        : entry,
    ),
  };
}

function rebalanceInvoiceAfterPaymentChange(state, invoiceId, deltaAmount) {
  const invoice = state.invoices.find((entry) => entry.id === invoiceId);
  if (!invoice) return state;
  const nextAmountPaid = money(Math.max(0, Number(invoice.amountPaid || 0) + Number(deltaAmount || 0)));
  const rebalanced = recalcInvoice({
    ...invoice,
    amountPaid: nextAmountPaid,
    paidAt: nextAmountPaid >= invoice.total ? invoice.paidAt || dayStamp() : "",
  });
  const finalInvoice = { ...rebalanced, status: invoiceStatusAfterAmount(rebalanced) };
  const nextState = {
    ...state,
    invoices: state.invoices.map((entry) => (entry.id === invoiceId ? finalInvoice : entry)),
  };
  return removeProjectIfPaymentGateBreaks(nextState, invoice.clientId);
}

function maybeCreateProjectForClient(state, clientId) {
  const bundle = getClientBundle(state, clientId);
  if (!bundle.booking.isBooked) return state;
  return {
    ...state,
    sessions: state.sessions.map((entry) =>
      entry.clientId === clientId && !entry.projectCreatedAt
        ? { ...entry, projectCreatedAt: dayStamp() }
        : entry,
    ),
  };
}

function withActivity(state, clientName, text) {
  const client = state.clients.find((entry) => entry.name === clientName) || state.clients.find((entry) => entry.id === state.selectedClientId);
  return {
    ...state,
    activity: [
      {
        id: nextId("act"),
        clientId: client?.id || state.selectedClientId,
        text,
        createdAt: stamp(),
      },
      ...state.activity,
    ],
  };
}
