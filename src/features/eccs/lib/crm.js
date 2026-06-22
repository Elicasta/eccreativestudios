const money = (value) => Number((value || 0).toFixed(2));

const sumLineItems = (lineItems = []) =>
  money(
    lineItems.reduce((total, item) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || 0);
      return total + quantity * unitPrice;
    }, 0),
  );

const recalcQuote = (quote) => {
  const subtotal = sumLineItems(quote.lineItems);
  const discount = money(Number(quote.discount || 0));
  const tax = money(Number(quote.tax || 0));
  const total = money(Math.max(0, subtotal - discount + tax));
  return { ...quote, subtotal, discount, tax, total };
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
    name: pkg.name,
    description: pkg.description,
    quantity: 1,
    unitPrice: pkg.price,
  },
  ...addons.map((addon) => ({
    id: nextId("qi"),
    name: addon.name,
    description: addon.description,
    quantity: 1,
    unitPrice: addon.price,
  })),
];

const buildInvoiceItems = (label, amount) => [
  {
    id: nextId("ii"),
    name: label,
    description: label,
    quantity: 1,
    unitPrice: money(amount),
  },
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
    id: "pkg_signature",
    name: "The Signature Experience",
    description: "Full maternity portrait session with styling guidance, creative direction, and premium gallery delivery.",
    price: 1850,
  },
  {
    id: "pkg_heirloom",
    name: "The Heirloom Session",
    description: "Family storytelling session with extended gallery coverage and heirloom album credit.",
    price: 2400,
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
    location: "Dallas, TX",
    status: "accepted",
    lineItems: buildQuoteItems(basePackages[0], [baseAddons[0]]),
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
    location: "Dallas, TX",
    status: "sent",
    lineItems: buildQuoteItems(basePackages[0]),
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
    location: "Fort Worth, TX",
    status: "accepted",
    lineItems: buildQuoteItems(basePackages[1], [baseAddons[1]]),
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
  });

  return {
    selectedClientId: clientSarahId,
    packages: basePackages,
    addons: baseAddons,
    locations: [
      { id: "loc_light_haus", name: "The Light Haus Studio", city: "Dallas, TX" },
      { id: "loc_botanical", name: "Dallas Arboretum", city: "Dallas, TX" },
      { id: "loc_stockyards", name: "Stockyards Hotel", city: "Fort Worth, TX" },
    ],
    inquiries: [
      {
        id: inquirySarahId,
        clientId: clientSarahId,
        name: "Sarah Garcia",
        email: "sarahgarcia@email.com",
        phone: "(214) 555-3872",
        sessionType: "Maternity Session",
        budgetRange: "$900-$1,500",
        desiredDate: "Jul 20, 2026",
        location: "Dallas, TX",
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
        budgetRange: "$900-$1,500",
        desiredDate: "Jul 29, 2026",
        location: "Dallas, TX",
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
        budgetRange: "$3,500-$5,000",
        desiredDate: "Oct 14, 2026",
        location: "Fort Worth, TX",
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
        packageId: "pkg_signature",
        status: "active",
        city: "Dallas, TX",
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
        packageId: "pkg_signature",
        status: "active",
        city: "Dallas, TX",
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
        packageId: "pkg_heirloom",
        status: "active",
        city: "Fort Worth, TX",
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
        customLocation: "The Light Haus Studio",
        sessionVision:
          "Soft, timeless, elegant images that celebrate this chapter with airy movement, editorial framing, and meaningful detail.",
        sessionNotes:
          "Bring neutral undergarments, hydrate well, and arrive 15 minutes early so we can settle in before photographing.",
        propList: ["Flowing cream dress", "Draped gauze", "Wood stool", "Floral stem bundle"],
        visionImages: [],
        galleryImages: [],
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
        const packageId = state.packages[0]?.id || null;
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

    case "create_quote": {
      const bundle = getClientBundle(state, action.clientId);
      if (!bundle.client) return state;
      const existing = bundle.quotes.find((entry) => activeQuoteStatuses.includes(entry.status));
      if (existing) {
        return { ...state, selectedClientId: action.clientId };
      }
      const pkg = state.packages.find((entry) => entry.id === bundle.client.packageId) || state.packages[0];
      const quote = recalcQuote({
        id: nextId("quote"),
        number: `QUO-${1000 + state.quotes.length + 1}`,
        clientId: action.clientId,
        inquiryId: bundle.client.inquiryId,
        eventType: bundle.client.sessionType,
        sessionDate: bundle.inquiry?.desiredDate || "",
        location: bundle.client.city || "",
        status: "draft",
        lineItems: buildQuoteItems(pkg),
        discount: 0,
        tax: 0,
        notes: "Drafted inside EC Creative Studios CRM.",
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

    case "patch_quote": {
      return {
        ...state,
        quotes: state.quotes.map((entry) =>
          entry.id === action.quoteId ? recalcQuote({ ...entry, ...action.patch }) : entry,
        ),
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
            entry.id === action.quoteId ? { ...entry, status, [dateField]: dayStamp() } : entry,
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

      const depositAmount = money(Math.round(quote.total * 0.4));
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
        invoices: state.invoices.map((entry) =>
          entry.id === action.invoiceId ? recalcInvoice({ ...entry, ...action.patch }) : entry,
        ),
      };
    }

    case "send_invoice": {
      const invoice = state.invoices.find((entry) => entry.id === action.invoiceId);
      if (!invoice) return state;
      return withActivity(
        {
          ...state,
          invoices: state.invoices.map((entry) =>
            entry.id === action.invoiceId ? { ...entry, status: "sent", sentAt: dayStamp() } : entry,
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
      const finalInvoice = { ...updatedInvoice, status };
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
      const pkg = working.packages.find((entry) => entry.id === bundle.client.packageId) || working.packages[0];

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
            lineItems: buildQuoteItems(pkg),
            discount: 0,
            tax: 0,
            notes: "Drafted via Manual Override.",
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
          const slot = { date: "Jul 20, 2026", time: "4:30 PM", locationName: "The Light Haus Studio" };
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

    default:
      return state;
  }
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
