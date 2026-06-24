"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  Eye,
  FileSignature,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LayoutTemplate,
  ListChecks,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  Palette,
  PenLine,
  Plus,
  Receipt,
  Search,
  Send,
  Settings as SettingsIcon,
  Sparkles,
  UserCog,
  Users,
  Workflow,
  Trash2,
  X,
} from "lucide-react";
import { C } from "../lib/brand";
import {
  BOOKING_STEPS,
  formatCurrency,
  getClientBundle,
  PIPELINE_LABELS,
  PIPELINE_STAGES,
} from "../lib/crm";
import { Avatar, Card, EmptyState, Pill, SectionLabel, StatusLight } from "../components/ui";
import { LinkPreviewCard } from "../components/LinkPreviewCard";

const NAV = [
  { group: null, items: [
    { key: "dashboard", label: "Dashboard", icon: FolderKanban },
    { key: "pipeline", label: "Pipeline", icon: Sparkles },
    { key: "activity", label: "Activity", icon: Bell },
  ] },
  { group: "Clients", items: [
    { key: "inquiries", label: "Inquiries", icon: Inbox },
    { key: "clients", label: "Clients", icon: Users },
    { key: "projects", label: "Projects", icon: ClipboardList },
    { key: "sessions", label: "Sessions", icon: CalendarDays },
    { key: "calendar", label: "Calendar", icon: CalendarDays },
    { key: "portal", label: "Portal Editor", icon: LayoutTemplate },
  ] },
  { group: "Sales", items: [
    { key: "quotes", label: "Quotes", icon: FileText },
    { key: "contracts", label: "Contracts", icon: FileSignature },
    { key: "invoices", label: "Invoices", icon: Receipt },
    { key: "payments", label: "Payments", icon: CreditCard },
    { key: "addons", label: "Add-Ons", icon: Plus },
  ] },
  { group: "Communication", items: [
    { key: "clientMessages", label: "Client Messages", icon: MessageCircle },
    { key: "emails", label: "Emails", icon: Mail },
    { key: "marketing", label: "Email Marketing", icon: Megaphone },
    { key: "social", label: "Social Messaging", icon: MessageCircle },
    { key: "forms", label: "Contact Forms", icon: ClipboardList },
    { key: "templates", label: "Templates", icon: LayoutTemplate },
    { key: "workflows", label: "Workflows", icon: Workflow },
  ] },
  { group: "Studio", items: [
    { key: "settings", label: "Settings", icon: SettingsIcon },
    { key: "branding", label: "Branding", icon: Palette },
    { key: "team", label: "Team", icon: UserCog },
  ] },
];

const FLAT_NAV = NAV.flatMap((group) => group.items);

const BOTTOM_NAV = [
  { key: "dashboard", label: "Home", icon: FolderKanban },
  { key: "clients", label: "Clients", icon: Users },
  { key: "inquiries", label: "Inquiries", icon: Inbox },
  { key: "activity", label: "Alerts", icon: Bell },
  { key: "__more", label: "More", icon: Menu },
];


export default function AdminApp({ state, selectedBundle, actions, setApp }) {
  const [page, setPage] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const [backStack, setBackStack] = useState([]);

  const filteredClients = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return state.clients;
    return state.clients.filter((client) =>
      [client.name, client.email, client.sessionType].some((value) => value?.toLowerCase().includes(lower)),
    );
  }, [query, state.clients]);

  const go = (nextPage) => {
    if (!nextPage || nextPage === page) {
      setDrawer(false);
      return;
    }
    setBackStack((stack) => [...stack.slice(-24), page]);
    setPage(nextPage);
    setDrawer(false);
  };

  const goBack = () => {
    setBackStack((stack) => {
      const previous = stack[stack.length - 1];
      if (!previous) return stack;
      setPage(previous);
      return stack.slice(0, -1);
    });
    setDrawer(false);
  };

  const currentNavItem = FLAT_NAV.find((item) => item.key === page);

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 44px)" }}>
      <aside className="hidden md:flex md:flex-col w-72 shrink-0 px-4 py-6" style={{ background: C.charcoal }}>
        <Sidebar page={page} setPage={go} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-72 px-4 py-6 overflow-y-auto" style={{ background: C.charcoal }}>
            <Sidebar page={page} setPage={go} onClose={() => setDrawer(false)} />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setDrawer(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <Topbar
          query={query}
          setQuery={setQuery}
          onMenu={() => setDrawer(true)}
          title={currentNavItem?.label || "Dashboard"}
          state={state}
          selectedBundle={selectedBundle}
          actions={actions}
          page={page}
          setPage={go}
          onBack={goBack}
          canGoBack={backStack.length > 0}
          onQuickCreate={() => setQuickCreateOpen(true)}
        />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-5">
          {page === "dashboard" && (
            <DashboardPage
              state={state}
              selectedBundle={selectedBundle}
              filteredClients={filteredClients}
              actions={actions}
              setPage={go}
              setApp={setApp}
              query={query}
              setQuery={setQuery}
            />
          )}
          {page === "pipeline" && <PipelinePage state={state} actions={actions} setPage={go} />}
          {page === "inquiries" && <InquiriesPage state={state} actions={actions} setPage={go} />}
          {page === "clients" && (
            <ClientsPage
              state={state}
              selectedBundle={selectedBundle}
              filteredClients={filteredClients}
              actions={actions}
              setPage={go}
            />
          )}
          {page === "projects" && <ProjectsPage key={`proj-${state.selectedClientId}`} state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "quotes" && <QuotesPage key={`quo-${state.selectedClientId}`} state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "contracts" && <ContractsPage key={`con-${state.selectedClientId}`} state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "invoices" && <InvoicesPage key={`inv-${state.selectedClientId}`} state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "payments" && <PaymentsPage key={`pay-${state.selectedClientId}`} state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "addons" && <AddOnsPage state={state} actions={actions} />}
          {page === "sessions" && <SessionsPage state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "calendar" && <CalendarPage state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "portal" && <PortalPage key={`portal-${state.selectedClientId}`} selectedBundle={selectedBundle} actions={actions} setApp={setApp} setPage={go} />}
          {page === "clientMessages" && <ClientMessagesPage state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "emails" && <EmailsPage selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "marketing" && <MarketingPage state={state} actions={actions} setPage={go} />}
          {page === "social" && <SocialPage state={state} actions={actions} />}
          {page === "forms" && <FormsPage />}
          {page === "templates" && <TemplatesPage />}
          {page === "workflows" && <PlaceholderPage title="Workflows" body="Automation rules (auto-send prep guide, auto-remind on unpaid invoice) live here in v2. This skeleton moves clients through the pipeline via real actions and Manual Override instead." />}
          {page === "activity" && <ActivityPage state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "settings" && <SettingsPage state={state} actions={actions} />}
          {page === "branding" && <BrandingPage state={state} actions={actions} />}
          {page === "team" && <PlaceholderPage title="Team" body="Add Emily and any second shooters or editors with role-based access once auth exists." />}
        </div>
      </main>

      {quickCreateOpen && (
        <QuickCreateModal
          page={page}
          state={state}
          selectedBundle={selectedBundle}
          actions={actions}
          setPage={go}
          onClose={() => setQuickCreateOpen(false)}
        />
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around py-2" style={{ background: C.charcoal }}>
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = item.key === "__more" ? drawer : page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => (item.key === "__more" ? setDrawer(true) : go(item.key))}
              className="flex flex-col items-center gap-0.5 px-2"
            >
              <Icon size={18} color={active ? "#fff" : C.taupe} />
              <span className="text-[10px]" style={{ color: active ? "#fff" : C.taupe }}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Sidebar({ page, setPage, onClose }) {
  return (
    <>
      <div className="mb-8 px-1 flex items-center justify-between">
        <div>
          <p className="ecc-display text-white text-2xl leading-none">EC</p>
          <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: C.taupe }}>
            Creative Studios
          </p>
        </div>
        {onClose && <button onClick={onClose}><X size={18} color={C.taupe} /></button>}
      </div>
      <nav className="space-y-4 flex-1 overflow-y-auto ecc-scrollbar">
        {NAV.map((group, groupIndex) => (
          <div key={group.group || `g${groupIndex}`}>
            {group.group && (
              <p className="text-[10px] uppercase tracking-[0.25em] px-3 mb-1.5" style={{ color: "rgba(189,167,150,0.7)" }}>{group.group}</p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = item.key === page;
                return (
                  <button
                    key={item.key}
                    onClick={() => setPage(item.key)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm"
                    style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.cream }}
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="pt-4 mt-4 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: C.taupe }}>
        Admin-first local CRM
      </div>
    </>
  );
}

function Topbar({ query, setQuery, onMenu, title, state, selectedBundle, actions, setPage, onBack, canGoBack, onQuickCreate }) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const activeClientSearch = clientSearch || query;
  const pickerClients = state.clients.filter((client) => {
    const needle = activeClientSearch.trim().toLowerCase();
    if (!needle) return true;
    return [client.name, client.email, client.sessionType].some((value) => value?.toLowerCase().includes(needle));
  });

  const globalResults = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    const clientResults = state.clients
      .filter((client) => [client.name, client.email, client.phone, client.sessionType].some((value) => String(value || "").toLowerCase().includes(needle)))
      .slice(0, 4)
      .map((client) => ({ key: `client-${client.id}`, type: "Client", title: client.name, subtitle: client.sessionType, onClick: () => { actions.selectClient(client.id); setPage("clients"); setQuery(""); } }));
    const quoteResults = state.quotes
      .filter((quote) => [quote.number, quote.eventType, quote.status].some((value) => String(value || "").toLowerCase().includes(needle)))
      .slice(0, 3)
      .map((quote) => ({ key: `quote-${quote.id}`, type: "Quote", title: quote.number, subtitle: `${quote.eventType} · ${formatCurrency(quote.total)}`, onClick: () => { actions.selectClient(quote.clientId); setPage("quotes"); setQuery(""); } }));
    const invoiceResults = state.invoices
      .filter((invoice) => [invoice.number, invoice.kind, invoice.status].some((value) => String(value || "").toLowerCase().includes(needle)))
      .slice(0, 3)
      .map((invoice) => ({ key: `invoice-${invoice.id}`, type: "Invoice", title: invoice.number, subtitle: `${invoice.kind} · ${formatCurrency(invoice.balanceDue)} due`, onClick: () => { actions.selectClient(invoice.clientId); setPage("invoices"); setQuery(""); } }));
    const inquiryResults = state.inquiries
      .filter((inquiry) => [inquiry.name, inquiry.email, inquiry.sessionType, inquiry.location, inquiry.notes].some((value) => String(value || "").toLowerCase().includes(needle)))
      .slice(0, 3)
      .map((inquiry) => ({ key: `inquiry-${inquiry.id}`, type: "Inquiry", title: inquiry.name, subtitle: `${inquiry.sessionType} · ${inquiry.status === "approved" ? "in progress" : inquiry.status}`, onClick: () => { if (inquiry.clientId) actions.selectClient(inquiry.clientId); setPage("inquiries"); setQuery(""); } }));
    const sessionResults = state.sessions
      .filter((session) => [session.sessionType, session.sessionDate, session.sessionTime, session.status].some((value) => String(value || "").toLowerCase().includes(needle)))
      .slice(0, 3)
      .map((session) => ({ key: `session-${session.id}`, type: "Session", title: session.sessionType, subtitle: `${session.sessionDate || "No date"} · ${session.status}`, onClick: () => { actions.selectClient(session.clientId); setPage("sessions"); setQuery(""); } }));
    return [...clientResults, ...quoteResults, ...invoiceResults, ...inquiryResults, ...sessionResults].slice(0, 8);
  }, [query, state, actions, setPage, setQuery]);
  return (
    <div className="relative flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
      <button className="md:hidden" onClick={onMenu}><Menu size={20} color={C.ink} /></button>
      <button disabled={!canGoBack} onClick={onBack} className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium disabled:opacity-30" style={{ background: C.bg, color: C.charcoal }} title="Back to previous CRM view">
        <ChevronLeft size={14} /> Back
      </button>
      <p className="ecc-display text-2xl flex-1" style={{ color: C.ink }}>
        {title}
      </p>
      <div className="hidden sm:flex relative items-center gap-2 px-3 py-2 rounded-full w-full max-w-xs" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
        <Search size={14} color={C.taupe} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients, pipeline, invoices..."
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: C.ink }}
        />
        {query && (
          <button onClick={() => setQuery("")} title="Clear search">
            <X size={14} color={C.taupe} />
          </button>
        )}
        {query && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-lg z-50 overflow-hidden" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <p className="text-[10px] uppercase tracking-[0.25em] px-4 pt-3 pb-1" style={{ color: C.taupe }}>Search results</p>
            {globalResults.length === 0 && <p className="px-4 py-3 text-sm" style={{ color: C.taupe }}>No clients, quotes, invoices, sessions, or inquiries match.</p>}
            {globalResults.map((item) => (
              <button key={item.key} onClick={item.onClick} className="w-full text-left px-4 py-3 flex items-center justify-between gap-3" style={{ borderTop: `1px solid ${C.line}` }}>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{item.title}</p>
                  <p className="text-xs truncate" style={{ color: C.taupe }}>{item.subtitle}</p>
                </div>
                <Pill tone="info">{item.type}</Pill>
              </button>
            ))}
          </div>
        )}
      </div>

      <button
        onClick={() => setPickerOpen((open) => !open)}
        className="flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium"
        style={{ background: C.cream, color: C.ink }}
      >
        <Avatar name={selectedBundle.client?.name || "?"} size={22} />
        <span className="hidden lg:inline max-w-[160px] truncate">{query && pickerClients.length ? `Switch: ${pickerClients[0].name}` : selectedBundle.client?.name || "Choose client"}</span>
        <ChevronDown size={14} color={C.taupe} />
      </button>

      <button onClick={onQuickCreate} className="w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0" style={{ background: C.forest }} title={`Quick add for ${title}`}>
        <Plus size={16} />
      </button>

      {pickerOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setPickerOpen(false)} />
          <div className="absolute right-4 sm:right-6 top-full mt-1 w-80 rounded-2xl shadow-lg z-40 max-h-96 overflow-y-auto ecc-scrollbar" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <p className="text-[10px] uppercase tracking-[0.25em] px-4 pt-3 pb-2" style={{ color: C.taupe }}>Switch client</p>
            <div className="mx-3 mb-2 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: C.bg }}>
              <Search size={14} color={C.taupe} />
              <input value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} placeholder={query ? `Matches for ${query}` : "Search name, email, session..."} className="bg-transparent outline-none text-sm w-full" style={{ color: C.ink }} />
              {clientSearch && <button onClick={() => setClientSearch("")}><X size={13} color={C.taupe} /></button>}
            </div>
            {pickerClients.map((client) => (
              <button
                key={client.id}
                onClick={() => { actions.selectClient(client.id); setPickerOpen(false); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left"
                style={{ background: client.id === state.selectedClientId ? C.cream : "transparent" }}
              >
                <Avatar name={client.name} size={26} />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{client.name}</p>
                  <p className="text-xs truncate" style={{ color: C.taupe }}>{client.sessionType}</p>
                </div>
              </button>
            ))}
            {pickerClients.length === 0 && <p className="px-4 py-4 text-sm" style={{ color: C.taupe }}>No clients match that search.</p>}
          </div>
        </>
      )}
    </div>
  );
}

const QUICK_CREATE_COPY = {
  dashboard: { title: "Quick add", body: "Create a client, inquiry, quote, invoice, email, campaign, or social keyword from one place." },
  clients: { title: "New client", body: "Create a client record, matching inquiry shell, session shell, and portal shell." },
  inquiries: { title: "New inquiry", body: "Add a fresh inquiry without making them an active client yet." },
  quotes: { title: "New quote", body: "Pick a client and draft a quote with package choices." },
  invoices: { title: "New invoice", body: "Pick a client and invoice type. The amount comes from the accepted quote when available." },
  emails: { title: "New email log", body: "Record a manual email touchpoint for the selected client." },
  marketing: { title: "New campaign", body: "Create a draft campaign shell for a client segment." },
  social: { title: "New social keyword", body: "Create a comment-to-DM rule shell." },
  addons: { title: "New add-on", body: "Add a reusable add-on to quote and invoice pickers." },
  calendar: { title: "New availability slot", body: "Open a session slot clients can choose from the portal." },
  templates: { title: "New template", body: "Create a reusable contract, invoice, quote, questionnaire, or email template." },
  forms: { title: "New form", body: "Create a contact form shell and add fields from the builder." },
};

function QuickCreateModal({ page, state, selectedBundle, actions, setPage, onClose }) {
  const defaultClientId = selectedBundle.client?.id || state.clients[0]?.id || "";
  const [mode, setMode] = useState(() => {
    if (page === "inquiries") return "inquiry";
    if (page === "clients") return "client";
    if (page === "quotes") return "quote";
    if (page === "invoices") return "invoice";
    if (page === "emails") return "email";
    if (page === "marketing") return "campaign";
    if (page === "social") return "social";
    if (page === "addons") return "addon";
    if (page === "calendar") return "slot";
    if (page === "templates") return "template";
    if (page === "forms") return "form";
    return "client";
  });
  const [draft, setDraft] = useState({
    clientId: defaultClientId,
    name: "",
    email: "",
    phone: "",
    sessionType: "Maternity Session",
    packageId: "",
    location: "Miami, FL",
    desiredDate: "",
    notes: "",
    invoiceKind: "deposit",
    subject: "",
    campaignName: "",
    segment: "All clients",
    keyword: "",
    reply: "",
    price: "",
    date: "Jul 24, 2026",
    time: "10:00 AM",
    templateType: "contracts",
  });
  const copy = QUICK_CREATE_COPY[page] || QUICK_CREATE_COPY.dashboard;

  const update = (patch) => setDraft((current) => ({ ...current, ...patch }));
  const requireClient = ["quote", "invoice", "email"].includes(mode);

  const submit = () => {
    if (mode === "client") {
      actions.createClient(draft);
      setPage("clients");
      onClose();
      return;
    }
    if (mode === "inquiry") {
      actions.createInquiry(draft);
      setPage("inquiries");
      onClose();
      return;
    }
    if (mode === "quote") {
      if (!draft.clientId) return;
      actions.selectClient(draft.clientId);
      actions.createQuote(draft.clientId, { force: true });
      setPage("quotes");
      onClose();
      return;
    }
    if (mode === "invoice") {
      if (!draft.clientId) return;
      actions.selectClient(draft.clientId);
      actions.createInvoice(draft.clientId, draft.invoiceKind);
      setPage("invoices");
      onClose();
      return;
    }
    if (mode === "email") {
      if (!draft.clientId) return;
      actions.logEmail({ clientId: draft.clientId, kind: "manual", subject: draft.subject || "Manual email" });
      actions.selectClient(draft.clientId);
      setPage("emails");
      onClose();
      return;
    }
    if (mode === "campaign") {
      actions.addMarketingCampaign({ name: draft.campaignName || "Untitled Campaign", segment: draft.segment });
      setPage("marketing");
      onClose();
      return;
    }
    if (mode === "social") {
      actions.addSocialRule({ keyword: draft.keyword || "BOOK", reply: draft.reply || "Send booking link" });
      setPage("social");
      onClose();
      return;
    }
    if (mode === "addon") {
      actions.addAddon({ name: draft.name || "New Add-On", description: draft.notes, price: Number(draft.price || 0) });
      setPage("addons");
      onClose();
      return;
    }
    if (mode === "slot") {
      actions.addAvailabilitySlot(draft.date, draft.time);
      setPage("calendar");
      onClose();
      return;
    }
    if (mode === "template") {
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("eccs:create-template", { detail: { type: draft.templateType } }));
      setPage("templates");
      onClose();
      return;
    }
    if (mode === "form") {
      if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("eccs:create-form"));
      setPage("forms");
      onClose();
    }
  };

  return (
    <Modal onClose={onClose} title={copy.title}>
      <p className="text-sm mb-4" style={{ color: C.charcoal }}>{copy.body}</p>
      <div className="flex gap-1 overflow-x-auto ecc-scrollbar mb-4">
        {[
          ["client", "Client"],
          ["inquiry", "Inquiry"],
          ["quote", "Quote"],
          ["invoice", "Invoice"],
          ["email", "Email"],
          ["campaign", "Campaign"],
          ["social", "Keyword"],
          ["addon", "Add-on"],
          ["slot", "Slot"],
          ["template", "Template"],
          ["form", "Form"],
        ].map(([key, label]) => (
          <button key={key} onClick={() => setMode(key)} className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0" style={{ background: mode === key ? C.charcoal : C.bg, color: mode === key ? "#fff" : C.charcoal }}>
            {label}
          </button>
        ))}
      </div>

      {requireClient && (
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Client</p>
          <select value={draft.clientId} onChange={(event) => update({ clientId: event.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            {state.clients.map((client) => <option key={client.id} value={client.id}>{client.name} — {client.sessionType}</option>)}
          </select>
        </div>
      )}

      {(mode === "client" || mode === "inquiry" || mode === "addon") && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={mode === "addon" ? "Add-on name" : "Name"} value={draft.name} onChange={(value) => update({ name: value })} />
          {mode !== "addon" && <Field label="Email" value={draft.email} onChange={(value) => update({ email: value })} />}
          {mode !== "addon" && <Field label="Phone" value={draft.phone} onChange={(value) => update({ phone: value })} />}
          {mode !== "addon" && <Field label="Session type" value={draft.sessionType} onChange={(value) => update({ sessionType: value })} />}
          {mode !== "addon" && (
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Requested package</p>
              <select value={draft.packageId} onChange={(event) => update({ packageId: event.target.value })} className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}>
                <option value="">Auto-match from session type</option>
                {state.packages.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name} — {formatCurrency(pkg.price || 0)}</option>)}
              </select>
            </div>
          )}
          {mode !== "addon" && <Field label="Location" value={draft.location} onChange={(value) => update({ location: value })} />}
          {mode === "addon" && <Field label="Price" type="number" value={draft.price} onChange={(value) => update({ price: value })} />}
        </div>
      )}

      {mode === "invoice" && (
        <div className="mb-3">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Invoice type</p>
          <select value={draft.invoiceKind} onChange={(event) => update({ invoiceKind: event.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            <option value="deposit">Deposit invoice</option>
            <option value="final">Final balance invoice</option>
            <option value="full">Full-payment invoice</option>
          </select>
        </div>
      )}

      {mode === "email" && <Field label="Subject" value={draft.subject} onChange={(value) => update({ subject: value })} />}
      {mode === "campaign" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Campaign name" value={draft.campaignName} onChange={(value) => update({ campaignName: value })} />
          <Field label="Segment" value={draft.segment} onChange={(value) => update({ segment: value })} />
        </div>
      )}
      {mode === "social" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Keyword" value={draft.keyword} onChange={(value) => update({ keyword: value })} />
          <Field label="Auto reply" value={draft.reply} onChange={(value) => update({ reply: value })} />
        </div>
      )}
      {mode === "slot" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Date label" value={draft.date} onChange={(value) => update({ date: value })} />
          <Field label="Time" value={draft.time} onChange={(value) => update({ time: value })} />
        </div>
      )}
      {mode === "template" && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Template type</p>
          <select value={draft.templateType} onChange={(event) => update({ templateType: event.target.value })} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            {TEMPLATE_TABS.map((tabOption) => <option key={tabOption.key} value={tabOption.key}>{tabOption.label}</option>)}
          </select>
        </div>
      )}
      {mode === "form" && <p className="text-sm rounded-2xl p-4" style={{ background: C.bg, color: C.charcoal }}>This creates an untitled form and opens the form builder.</p>}
      {(mode === "client" || mode === "inquiry" || mode === "addon") && (
        <div className="mt-3">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Notes / description</p>
          <textarea rows={3} value={draft.notes} onChange={(event) => update({ notes: event.target.value })} className="w-full rounded-2xl p-3 text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
        </div>
      )}
      <button onClick={submit} className="mt-5 w-full py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
        Create {mode}
      </button>
    </Modal>
  );
}

function DashboardPage({ state, selectedBundle, filteredClients, actions, setPage, setApp, query, setQuery }) {
  const metrics = [
    { label: "Open Inquiries", value: state.inquiries.filter((entry) => entry.status === "new").length, page: "inquiries" },
    { label: "Quotes Awaiting Decision", value: state.quotes.filter((entry) => ["draft", "sent", "viewed"].includes(entry.status)).length, page: "quotes" },
    { label: "Contracts Awaiting Signature", value: state.contracts.filter((entry) => entry.status === "sent").length, page: "contracts" },
    { label: "Booked Clients", value: state.clients.filter((client) => getClientBundle(state, client.id).booking.isBooked).length, page: "projects" },
  ];

  const goToClient = (clientId) => {
    actions.selectClient(clientId);
    setPage("clients");
  };

  const upcomingSessions = state.sessions
    .filter((session) => session.sessionDate)
    .map((session) => ({ session, bundle: getClientBundle(state, session.clientId) }))
    .slice(0, 4);

  const heroUrl = state.studioSettings?.heroImageUrl;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.18fr_0.82fr] gap-5">
      <div className="space-y-5">
        <Card className="overflow-hidden" style={{ borderColor: "transparent" }}>
          <div className={`grid grid-cols-1 ${heroUrl ? "sm:grid-cols-[1.2fr_1fr]" : ""}`} style={{ background: `linear-gradient(135deg, ${C.charcoal}, ${C.ink})` }}>
            <div className="p-8 sm:p-10">
              <p className="text-[10px] uppercase tracking-[0.35em] mb-3" style={{ color: C.taupe }}>
                {selectedBundle.client ? "Selected Client" : "EC Creative Studios"}
              </p>
              <p className="ecc-display text-4xl text-white max-w-xl leading-tight">
                {selectedBundle.client ? selectedBundle.client.name : state.studioSettings?.heroHeadline || "Admin first. Booking rules before everything else."}
              </p>
              <p className="text-sm mt-4 max-w-lg" style={{ color: C.cream }}>
                {selectedBundle.client
                  ? `${selectedBundle.client.sessionType} · ${PIPELINE_LABELS[selectedBundle.stage]} · next: ${nextActionText(selectedBundle)}`
                  : "This dashboard now makes the quote, contract, payment, project, portal, and calendar handoff explicit."}
              </p>
              {!heroUrl && (
                <button onClick={() => setPage("branding")} className="text-xs underline mt-4 inline-block" style={{ color: C.taupe }}>
                  Add a studio photo in Branding →
                </button>
              )}
            </div>
            {heroUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={heroUrl} alt="Studio" className="w-full h-full object-cover min-h-[220px]" />
            )}
          </div>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <button key={metric.label} onClick={() => setPage(metric.page)} className="text-left">
              <Card className="p-4 h-full">
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>
                  {metric.label}
                </p>
                <p className="ecc-display text-3xl mt-2" style={{ color: C.ink }}>
                  {metric.value}
                </p>
              </Card>
            </button>
          ))}
        </div>

        {selectedBundle.client ? (
          <Card className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>
                  Selected Client
                </p>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>
                  {selectedBundle.client.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => actions.selectClient(null)} className="text-xs underline" style={{ color: C.charcoal }}>Clear</button>
                <button onClick={() => setApp("client")} className="text-sm underline" style={{ color: C.forest }}>Preview portal</button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <SummaryChip label="Pipeline" value={PIPELINE_LABELS[selectedBundle.stage]} onClick={() => setPage("pipeline")} />
              <SummaryChip label="Booked" value={selectedBundle.booking.isBooked ? "Yes" : "Not yet"} onClick={() => setPage("projects")} />
              <SummaryChip label="Project" value={selectedBundle.projectStatus.projectCreated ? "Created" : "Locked"} onClick={() => setPage("projects")} />
              <SummaryChip label="Outstanding" value={formatCurrency(selectedBundle.invoices.reduce((total, invoice) => total + invoice.balanceDue, 0))} onClick={() => setPage("invoices")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <ActionCard title="Next step" body={nextActionText(selectedBundle)} actionLabel="Open workflow" onClick={() => setPage("projects")} />
              <ActionCard title="Portal handoff" body={selectedBundle.projectStatus.portalAccessSent ? "Portal email already sent." : "Send portal access after booking is complete."} actionLabel="Open emails" onClick={() => setPage("emails")} />
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-center justify-between px-5 pt-5 pb-1">
              <SectionLabel icon={Sparkles}>Pipeline Overview</SectionLabel>
              <button onClick={() => setPage("pipeline")} className="text-xs underline" style={{ color: C.forest }}>Open full pipeline</button>
            </div>
            <p className="text-xs px-5 pb-3" style={{ color: C.taupe }}>No client selected — here's the sales pipeline at a glance. Click anyone to focus on them.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 px-5 pb-5">
              {PIPELINE_STAGES.slice(1, 9).map((stage) => {
                const items = state.clients.filter((client) => getClientBundle(state, client.id).stage === stage.key);
                return (
                  <div key={stage.key} className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
                    <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.taupe }}>{stage.label}</p>
                    <p className="ecc-display text-2xl mb-1" style={{ color: C.ink }}>{items.length}</p>
                    {items.slice(0, 2).map((client) => (
                      <button key={client.id} onClick={() => goToClient(client.id)} className="block w-full text-left text-xs py-1 truncate" style={{ color: C.forest }}>
                        {client.name}
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        <Card className="p-5">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <SectionLabel icon={Users}>{query ? `Results for "${query}"` : "Client List"}</SectionLabel>
            <div className="flex items-center gap-3">
              {query && <button onClick={() => setQuery("")} className="text-xs underline" style={{ color: C.charcoal }}>Clear search</button>}
              <button onClick={() => setPage("clients")} className="text-xs underline" style={{ color: C.forest }}>View all</button>
            </div>
          </div>
          <div className="space-y-2 px-5 pb-5">
            {filteredClients.slice(0, 6).map((client) => {
              const bundle = getClientBundle(state, client.id);
              return (
                <div
                  key={client.id}
                  className="w-full flex items-center justify-between p-3 rounded-xl"
                  style={{ background: client.id === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}
                >
                  <button onClick={() => actions.selectClient(client.id)} className="flex items-center gap-3 min-w-0 text-left flex-1">
                    <Avatar name={client.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{client.name}</p>
                      <p className="text-xs truncate" style={{ color: C.charcoal }}>
                        {client.sessionType} • {bundle.booking.completionCount}/3 booking steps complete
                      </p>
                    </div>
                  </button>
                  <button onClick={() => goToClient(client.id)} className="pl-3 shrink-0" title="Open full client page">
                    <ChevronRight size={16} color={C.taupe} />
                  </button>
                </div>
              );
            })}
            {filteredClients.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No clients match "{query}".</p>}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        {selectedBundle.client && <BookingChecklistCard selectedBundle={selectedBundle} setPage={setPage} />}

        <RevenueCard state={state} setPage={setPage} />

        <Card className="p-5">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <SectionLabel icon={MessageCircle}>Client Messages</SectionLabel>
            <button onClick={() => setPage("clientMessages")} className="text-xs underline" style={{ color: C.forest }}>Open messages</button>
          </div>
          <div className="px-5 pb-5 space-y-2">
            {(state.messages || []).filter((message) => message.from === "client").slice(0, 3).map((message) => {
              const bundle = getClientBundle(state, message.clientId);
              return (
                <button key={message.id} onClick={() => { actions.selectClient(message.clientId); setPage("clientMessages"); }} className="w-full text-left rounded-xl p-3" style={{ background: C.bg }}>
                  <div className="flex items-center gap-2 mb-1"><span className="w-2 h-2 rounded-full" style={{ background: C.forest }} /><p className="text-sm font-medium" style={{ color: C.ink }}>{bundle.client?.name || "Client"}</p></div>
                  <p className="text-xs truncate" style={{ color: C.charcoal }}>{message.text}</p>
                </button>
              );
            })}
            {(state.messages || []).filter((message) => message.from === "client").length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No unread client messages.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <SectionLabel icon={CalendarDays}>Upcoming Sessions</SectionLabel>
            <button onClick={() => setPage("calendar")} className="text-xs underline" style={{ color: C.forest }}>View calendar</button>
          </div>
          <div className="px-5 pb-5">
            {upcomingSessions.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>Nothing scheduled yet.</p>}
            {upcomingSessions.map(({ session, bundle }, index) => (
              <button
                key={session.id}
                onClick={() => goToClient(session.clientId)}
                className="w-full text-left flex items-center justify-between py-2.5"
                style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}
              >
                <div>
                  <p className="text-sm" style={{ color: C.ink }}>{bundle.client?.sessionType} — {bundle.client?.name}</p>
                  <p className="text-xs" style={{ color: C.taupe }}>{session.sessionDate} · {session.sessionTime || "TBD"}</p>
                </div>
                <ChevronRight size={14} color={C.taupe} />
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <SectionLabel icon={Inbox}>New Inquiry Queue</SectionLabel>
            <button onClick={() => setPage("inquiries")} className="text-xs underline" style={{ color: C.forest }}>View all</button>
          </div>
          <div className="space-y-3 px-5 pb-5">
            {state.inquiries.filter((entry) => entry.status === "new").map((entry) => (
              <button key={entry.id} onClick={() => setPage("inquiries")} className="w-full text-left rounded-xl p-3" style={{ background: C.bg }}>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.name}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                  {entry.sessionType} • {entry.budgetRange}
                </p>
                <span
                  onClick={(event) => { event.stopPropagation(); actions.approveInquiry(entry.id); }}
                  className="inline-block mt-3 px-3 py-2 rounded-full text-xs font-medium text-white"
                  style={{ background: C.forest }}
                >
                  Approve and create client
                </span>
              </button>
            ))}
            {state.inquiries.filter((entry) => entry.status === "new").length === 0 && (
              <p className="text-sm" style={{ color: C.taupe }}>No new inquiries waiting.</p>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={Bell}>Recent Activity</SectionLabel>
          <div className="px-5 pb-5">
            {state.activity.slice(0, 8).map((entry, index) => {
              const bundle = getClientBundle(state, entry.clientId);
              return (
                <button
                  key={entry.id}
                  onClick={() => bundle.client && goToClient(entry.clientId)}
                  className="w-full text-left py-3"
                  style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}`, cursor: bundle.client ? "pointer" : "default" }}
                >
                  <p className="text-sm" style={{ color: bundle.client ? C.forest : C.ink, textDecoration: bundle.client ? "underline" : "none" }}>{entry.text}</p>
                  <p className="text-xs mt-1" style={{ color: C.taupe }}>{entry.createdAt}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BookingChecklistCard({ selectedBundle, setPage }) {
  const steps = selectedBundle.booking?.steps || {};
  const items = BOOKING_STEPS.map((step) => ({ ...step, done: Boolean(steps[step.key]) }));
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between px-5 pb-3">
        <SectionLabel icon={CheckCircle2}>Booking Checklist</SectionLabel>
        <Pill tone={selectedBundle.booking?.isBooked ? "done" : "warn"}>{selectedBundle.booking?.completionCount || 0}/{BOOKING_STEPS.length}</Pill>
      </div>
      <div className="px-5 pb-5 space-y-2">
        {items.map((item) => (
          <button key={item.key} onClick={() => setPage(item.key === "quoteAccepted" ? "quotes" : item.key === "contractSigned" ? "contracts" : "invoices")} className="w-full flex items-center gap-3 rounded-2xl px-3 py-2 text-left" style={{ background: item.done ? "#eaf1ee" : C.bg, border: `1px solid ${C.line}` }}>
            <StatusLight tone={item.done ? "done" : "warn"} />
            <span className="text-sm" style={{ color: C.ink }}>{item.label}</span>
          </button>
        ))}
      </div>
    </Card>
  );
}

function RevenueCard({ state, setPage }) {
  const collected = state.invoices.reduce((sum, entry) => sum + entry.amountPaid, 0);
  const buckets = [
    { key: "draft", label: "Draft", color: C.line, amount: state.invoices.filter((i) => i.status === "draft").reduce((s, i) => s + i.total, 0) },
    { key: "sent", label: "Sent, unpaid", color: C.blue, amount: state.invoices.filter((i) => i.status === "sent").reduce((s, i) => s + i.balanceDue, 0) },
    { key: "partial", label: "Partially paid", color: "#c98a3e", amount: state.invoices.filter((i) => i.status === "partially_paid").reduce((s, i) => s + i.balanceDue, 0) },
    { key: "paid", label: "Collected", color: C.forest, amount: collected },
  ];
  const total = buckets.reduce((sum, bucket) => sum + bucket.amount, 0) || 1;
  let acc = 0;
  const stops = buckets.map((bucket) => {
    const start = (acc / total) * 360;
    acc += bucket.amount;
    const end = (acc / total) * 360;
    return `${bucket.color} ${start}deg ${end}deg`;
  });

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between px-5 pt-5 pb-1">
        <SectionLabel icon={CreditCard}>Revenue Snapshot</SectionLabel>
        <button onClick={() => setPage("payments")} className="text-xs underline" style={{ color: C.forest }}>View payments</button>
      </div>
      <div className="px-5 pb-5 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full shrink-0" style={{ background: `conic-gradient(${stops.join(",")})` }}>
          <div className="w-12 h-12 rounded-full m-auto relative top-4" style={{ background: "#fff" }} />
        </div>
        <div className="space-y-1.5 flex-1">
          {buckets.map((bucket) => (
            <div key={bucket.key} className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5" style={{ color: C.charcoal }}>
                <span className="w-2 h-2 rounded-full" style={{ background: bucket.color }} /> {bucket.label}
              </span>
              <span style={{ color: C.ink }}>{formatCurrency(bucket.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function PipelinePage({ state, actions, setPage }) {
  return (
    <div className="space-y-3">
      <Card className="p-4 flex items-center justify-between">
        <p className="text-sm" style={{ color: C.charcoal }}>Click any card to focus that client everywhere in admin — Quotes, Contracts, Invoices, Portal Editor all follow.</p>
        <button onClick={() => setPage("clients")} className="text-xs underline shrink-0 ml-3" style={{ color: C.forest }}>View as list</button>
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PIPELINE_STAGES.slice(0, 10).map((stage) => {
          const items = state.clients.filter((client) => getClientBundle(state, client.id).stage === stage.key);
          return (
            <Card key={stage.key} className="p-4">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{stage.label}</p>
              <p className="ecc-display text-3xl mt-2 mb-4" style={{ color: C.ink }}>{items.length}</p>
              <div className="space-y-2">
                {items.length === 0 && <p className="text-xs" style={{ color: C.charcoal }}>No records here.</p>}
                {items.map((client) => {
                  const bundle = getClientBundle(state, client.id);
                  const value = bundle.primaryQuote?.total || 0;
                  const active = client.id === state.selectedClientId;
                  return (
                    <button
                      key={client.id}
                      onClick={() => { actions.selectClient(client.id); setPage("clients"); }}
                      className="w-full flex items-center gap-2.5 p-3 rounded-xl text-left transition"
                      style={{ background: active ? C.cream : C.bg, border: `1px solid ${active ? C.taupe : "transparent"}` }}
                    >
                      <Avatar name={client.name} size={28} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{client.name}</p>
                        <p className="text-xs truncate" style={{ color: C.charcoal }}>{client.sessionType}{value ? ` • ${formatCurrency(value)}` : ""}</p>
                      </div>
                      <ChevronRight size={14} color={C.taupe} />
                    </button>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function InquiriesPage({ state, actions, setPage }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [openInquiryId, setOpenInquiryId] = useState(null);

  const sessionTypes = useMemo(() => Array.from(new Set(state.inquiries.map((entry) => entry.sessionType))), [state.inquiries]);
  const openInquiry = state.inquiries.find((entry) => entry.id === openInquiryId);

  const stats = [
    { key: "all", label: "All", count: state.inquiries.length },
    { key: "new", label: "New", count: state.inquiries.filter((e) => e.status === "new").length },
    { key: "approved", label: "In Progress", count: state.inquiries.filter((e) => e.status === "approved").length },
    { key: "followup", label: "Follow-Up", count: state.inquiries.filter((e) => ["sent", "approved"].includes(e.status)).length },
    { key: "converted", label: "Converted", count: state.inquiries.filter((e) => e.status === "converted").length },
    { key: "lost", label: "Lost", count: state.inquiries.filter((e) => e.status === "lost").length },
  ];

  const filtered = state.inquiries
    .filter((entry) => statusFilter === "all" || (statusFilter === "followup" ? ["sent", "approved"].includes(entry.status) : entry.status === statusFilter))
    .filter((entry) => typeFilter === "all" || entry.sessionType === typeFilter)
    .filter((entry) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [entry.name, entry.email, entry.phone, entry.sessionType, entry.budgetRange, entry.location, entry.notes]
        .some((value) => String(value || "").toLowerCase().includes(needle));
    })
    .sort((a, b) => (sort === "newest" ? String(b.receivedAt).localeCompare(String(a.receivedAt)) : String(a.receivedAt).localeCompare(String(b.receivedAt))));

  const startQuote = (inquiryId) => {
    actions.startQuoteFromInquiry(inquiryId);
    setOpenInquiryId(null);
    setPage("quotes");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {stats.map((stat) => (
          <button key={stat.key} onClick={() => setStatusFilter(stat.key)} className="text-left">
            <Card className="p-4" style={{ borderColor: statusFilter === stat.key ? C.taupe : C.line }}>
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{stat.label}</p>
              <p className="ecc-display text-3xl mt-2" style={{ color: C.ink }}>{stat.count}</p>
            </Card>
          </button>
        ))}
      </div>

      <Card className="p-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-full flex-1 min-w-[180px]" style={{ background: C.bg }}>
          <Search size={14} color={C.taupe} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, package, notes..." className="bg-transparent outline-none text-sm w-full" style={{ color: C.ink }} />
          {query && <button onClick={() => setQuery("")}><X size={13} color={C.taupe} /></button>}
        </div>
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} className="px-3 py-2 rounded-full text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
          <option value="all">All session types</option>
          {sessionTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <select value={sort} onChange={(event) => setSort(event.target.value)} className="px-3 py-2 rounded-full text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between px-5 pb-2">
          <SectionLabel icon={Inbox}>Incoming Leads</SectionLabel>
          <p className="text-xs" style={{ color: C.taupe }}>Tap a lead to open the actual inquiry form.</p>
        </div>
        <div className="space-y-3 px-5 pb-5 pt-2">
          {filtered.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No inquiries match these filters.</p>}
          {filtered.map((inquiry) => {
            const pkg = state.packages.find((entry) => entry.id === inquiry.packageId);
            const hasClient = Boolean(inquiry.clientId);
            return (
              <button
                key={inquiry.id}
                onClick={() => setOpenInquiryId(inquiry.id)}
                className="w-full text-left rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3"
                style={{ background: inquiry.status === "new" ? "#fff8ef" : "#fff", border: `1px solid ${C.line}` }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={inquiry.name} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{inquiry.name}</p>
                    <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                      {inquiry.sessionType} • Preferred date: {inquiry.desiredDate || "TBD"} • {inquiry.location || "No location"} • {inquiry.receivedAt}
                    </p>
                    <p className="text-xs mt-2 max-w-md line-clamp-2" style={{ color: C.charcoal }}>{inquiry.notes}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Pill tone={inquiry.status === "new" ? "warn" : inquiry.status === "lost" ? "warn" : "info"}>{inquiry.status === "approved" ? "in progress" : inquiry.status}</Pill>
                  <Pill tone={hasClient ? "done" : "warn"}>{hasClient ? "Returning Client" : "First-time Client"}</Pill>
                  <ChevronRight size={14} color={C.taupe} />
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {openInquiry && (
        <InquiryDetailModal
          inquiry={openInquiry}
          packages={state.packages}
          actions={actions}
          onClose={() => setOpenInquiryId(null)}
          onOpenClient={(clientId) => { actions.selectClient(clientId); setOpenInquiryId(null); setPage("clients"); }}
          onStartQuote={() => startQuote(openInquiry.id)}
        />
      )}
    </div>
  );
}

function InquiryDetailModal({ inquiry, packages, actions, onClose, onOpenClient, onStartQuote }) {
  const selectedPackage = packages.find((entry) => entry.id === inquiry.packageId);
  const matchingPackages = packages.filter((pkg) => {
    const session = String(inquiry.sessionType || "").toLowerCase();
    return !pkg.sessionType || session.includes(String(pkg.sessionType).toLowerCase().replace(" session", "")) || String(pkg.sessionType).toLowerCase().includes(session.replace(" session", ""));
  });
  const packageOptions = matchingPackages.length ? matchingPackages : packages;

  return (
    <Modal onClose={onClose} title="Inquiry form">
      <div className="flex items-start gap-3 mb-5">
        <Avatar name={inquiry.name} size={42} />
        <div className="min-w-0">
          <p className="ecc-display text-3xl leading-tight" style={{ color: C.ink }}>{inquiry.name}</p>
          <p className="text-sm mt-1" style={{ color: C.charcoal }}>{inquiry.email || "No email"} • {inquiry.phone || "No phone"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <InfoBlock label="Session type" value={inquiry.sessionType} />
        <InfoBlock label="Budget" value={inquiry.budgetRange || "Not provided"} />
        <InfoBlock label="Preferred date" value={inquiry.desiredDate || "TBD"} />
        <InfoBlock label="Location" value={inquiry.location || "Not provided"} />
      </div>

      <div className="rounded-2xl p-4 mb-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
        <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Quote package default</p>
        <select
          value={inquiry.packageId || ""}
          onChange={(event) => actions.patchInquiry(inquiry.id, { packageId: event.target.value })}
          className="w-full px-3 py-2.5 rounded-xl text-sm mb-2"
          style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}
        >
          <option value="">No package selected</option>
          {packageOptions.map((pkg) => <option key={pkg.id} value={pkg.id}>{pkg.name} — {formatCurrency(pkg.price)}</option>)}
        </select>
        <p className="text-xs" style={{ color: C.charcoal }}>
This is only an admin-side quote starting point. The public inquiry should capture session type, preferred date, location, vision, and notes before any official package choice.
        </p>
        {selectedPackage && <p className="text-xs mt-2" style={{ color: C.taupe }}>{selectedPackage.description}</p>}
      </div>

      <div className="rounded-2xl p-4 mb-5" style={{ border: `1px solid ${C.line}` }}>
        <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Client notes / form answer</p>
        <p className="text-sm leading-7 whitespace-pre-wrap" style={{ color: C.ink }}>{inquiry.notes || "No notes submitted."}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={onStartQuote} className="px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
          {inquiry.clientId ? "Continue quote" : "Approve + draft quote"}
        </button>
        {inquiry.status === "new" && (
          <button onClick={() => actions.approveInquiry(inquiry.id)} className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: C.cream, color: C.ink }}>
            Approve only
          </button>
        )}
        {inquiry.clientId && (
          <button onClick={() => onOpenClient(inquiry.clientId)} className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            Open client record
          </button>
        )}
      </div>
    </Modal>
  );
}

function InfoBlock({ label, value }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: C.bg }}>
      <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{label}</p>
      <p className="text-sm mt-1 font-medium" style={{ color: C.ink }}>{value || "—"}</p>
    </div>
  );
}

function ClientsPage({ state, selectedBundle, filteredClients, actions, setPage }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(24);
  const [localQuery, setLocalQuery] = useState("");
  const [openInquiryId, setOpenInquiryId] = useState(null);

  const searchedClients = filteredClients.filter((client) => {
    const needle = localQuery.trim().toLowerCase();
    if (!needle) return true;
    return [client.name, client.email, client.phone, client.sessionType, client.city, ...(client.tags || [])]
      .some((value) => String(value || "").toLowerCase().includes(needle));
  });
  const withStage = searchedClients.map((client) => ({ client, bundle: getClientBundle(state, client.id) }));
  const scoped = withStage.filter(({ bundle }) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "booked") return bundle.booking.isBooked;
    if (statusFilter === "active") return !bundle.booking.isBooked && bundle.stage !== "lost" && bundle.stage !== "archived";
    if (statusFilter === "lost") return bundle.stage === "lost" || bundle.stage === "archived";
    return true;
  });
  const visible = scoped.slice(0, visibleCount);
  const openInquiry = state.inquiries.find((entry) => entry.id === openInquiryId);

  const filters = [
    { key: "all", label: `All (${withStage.length})` },
    { key: "active", label: "In progress" },
    { key: "booked", label: "Booked" },
    { key: "lost", label: "Lost / Archived" },
  ];

  if (!selectedBundle.client) {
    return (
      <>
        <ContactDirectoryView
          state={state}
          clients={state.clients}
          inquiries={state.inquiries}
          actions={actions}
          setPage={setPage}
          openInquiry={(id) => setOpenInquiryId(id)}
        />
        {openInquiry && (
          <InquiryDetailModal
            inquiry={openInquiry}
            packages={state.packages}
            actions={actions}
            onClose={() => setOpenInquiryId(null)}
            onOpenClient={(clientId) => { actions.selectClient(clientId); setOpenInquiryId(null); }}
            onStartQuote={() => { actions.startQuoteFromInquiry(openInquiry.id); setOpenInquiryId(null); setPage("quotes"); }}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={() => actions.selectClient(null)} className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: C.cream, color: C.ink }}>
        All Clients
      </button>
      <ClientDetailPanel selectedBundle={selectedBundle} setPage={setPage} />
    </div>
  );
}

function ContactDirectoryView({ state, clients, inquiries, actions, setPage, openInquiry }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const leads = inquiries.filter((entry) => !entry.clientId || entry.status === "new");
  const clientRows = clients.map((client) => ({ id: client.id, type: "client", name: client.name, email: client.email, subtitle: client.sessionType, initials: client.name, client }));
  const leadRows = leads.map((inquiry) => ({ id: inquiry.id, type: "lead", name: inquiry.name, email: inquiry.email, subtitle: inquiry.sessionType, initials: inquiry.name, inquiry }));
  const allRows = [...clientRows, ...leadRows]
    .filter((row) => tab === "all" || (tab === "clients" ? row.type === "client" : tab === "leads" ? row.type === "lead" : !row.email))
    .filter((row) => {
      const needle = query.trim().toLowerCase();
      if (!needle) return true;
      return [row.name, row.email, row.subtitle].some((value) => String(value || "").toLowerCase().includes(needle));
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  const groups = allRows.reduce((acc, row) => {
    const letter = (row.name?.[0] || "#").toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(row);
    return acc;
  }, {});
  const tabs = [
    ["all", "All", clientRows.length + leadRows.length],
    ["clients", "Clients", clientRows.length],
    ["leads", "New Clients", leadRows.length],
    ["other", "Other", allRows.filter((row) => !row.email).length],
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="ecc-display text-4xl" style={{ color: C.ink }}>Contacts</p>
          <p className="text-sm mt-1" style={{ color: C.charcoal }}>Client records and unconverted leads in one fast mobile-style directory.</p>
        </div>
        <button onClick={() => setPage("inquiries")} className="w-12 h-12 rounded-full flex items-center justify-center text-white" style={{ background: C.forest }}>
          <Plus size={22} />
        </button>
      </div>

      <Card className="p-4">
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl" style={{ background: C.bg }}>
          <Search size={18} color={C.taupe} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name or email" className="bg-transparent outline-none w-full text-sm" style={{ color: C.ink }} />
          {query && <button onClick={() => setQuery("")}><X size={14} color={C.taupe} /></button>}
        </div>
        <div className="flex gap-8 overflow-x-auto ecc-scrollbar px-1 pt-4">
          {tabs.map(([key, label, count]) => (
            <button key={key} onClick={() => setTab(key)} className="pb-3 text-sm font-medium shrink-0 relative" style={{ color: tab === key ? C.ink : C.charcoal }}>
              {label} <span style={{ color: C.taupe }}>({count})</span>
              {tab === key && <span className="absolute left-0 right-0 -bottom-px h-0.5" style={{ background: C.forest }} />}
            </button>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        {Object.keys(groups).length === 0 && <p className="p-5 text-sm" style={{ color: C.taupe }}>No contacts match.</p>}
        {Object.entries(groups).map(([letter, rows]) => (
          <div key={letter}>
            <p className="px-5 pt-5 pb-2 text-sm font-medium" style={{ color: C.taupe }}>{letter}</p>
            {rows.map((row) => (
              <button
                key={`${row.type}-${row.id}`}
                onClick={() => {
                  if (row.type === "client") actions.selectClient(row.id);
                  else openInquiry(row.id);
                }}
                className="w-full flex items-center gap-4 px-5 py-3 text-left"
                style={{ borderTop: `1px solid ${C.line}` }}
              >
                <Avatar name={row.initials} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{row.name}</p>
                  <p className="text-sm truncate" style={{ color: C.charcoal }}>{row.email || row.subtitle}</p>
                </div>
                <Pill tone={row.type === "client" ? "done" : "warn"}>{row.type === "lead" ? "new client" : row.type}</Pill>
              </button>
            ))}
          </div>
        ))}
      </Card>
    </div>
  );
}

function ClientDetailPanel({ selectedBundle, setPage }) {
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const portalUrl = selectedBundle.client ? `https://eccreativestudios.com/portal/${selectedBundle.client.id}` : "";
  const copyPortal = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) navigator.clipboard.writeText(portalUrl).catch(() => {});
  };
  return (
    <>
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <Avatar name={selectedBundle.client.name} size={56} />
            <div>
              <p className="ecc-display text-4xl leading-tight" style={{ color: C.ink }}>{selectedBundle.client.name}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.email} • {selectedBundle.client.phone}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.sessionType} • {selectedBundle.client.city}</p>
            </div>
          </div>
          <StatusLight tone={selectedBundle.booking.isBooked ? "green" : "yellow"} label={selectedBundle.booking.isBooked ? "Booked" : PIPELINE_LABELS[selectedBundle.stage]} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <SummaryChip label="Quotes" value={`${selectedBundle.quotes.length} record${selectedBundle.quotes.length === 1 ? "" : "s"}`} onClick={() => setPage("quotes")} />
          <SummaryChip label="Contracts" value={`${selectedBundle.contracts.length} record${selectedBundle.contracts.length === 1 ? "" : "s"}`} onClick={() => setPage("contracts")} />
          <SummaryChip label="Invoices" value={`${selectedBundle.invoices.length} record${selectedBundle.invoices.length === 1 ? "" : "s"}`} onClick={() => setPage("invoices")} />
          <SummaryChip label="Portal Access" value={selectedBundle.projectStatus.portalAccessSent ? "Sent" : selectedBundle.projectStatus.portalReady ? "Ready, not sent" : "Portal not available"} onClick={() => setPage("portal")} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-5">
          <ClientRecordList title="Quotes" empty="No quotes yet." items={selectedBundle.quotes.map((quote) => ({ id: quote.id, title: quote.number, meta: `${formatCurrency(quote.total)} · ${quote.status}`, page: "quotes" }))} setPage={setPage} actionLabel="Start New Quote" actionPage="quotes" />
          <ClientRecordList title="Contracts" empty="No contracts yet." items={selectedBundle.contracts.map((contract) => ({ id: contract.id, title: contract.number, meta: `${contract.templateName} · ${contract.status}`, page: "contracts" }))} setPage={setPage} actionLabel="New Contract" actionPage="contracts" />
          <ClientRecordList title="Invoices" empty="No invoices yet." items={selectedBundle.invoices.map((invoice) => ({ id: invoice.id, title: invoice.number, meta: `${invoice.kind} · ${formatCurrency(invoice.balanceDue)} due · ${invoice.status}`, page: "invoices" }))} setPage={setPage} actionLabel="New Invoice" actionPage="invoices" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <div className="rounded-3xl p-4" style={{ background: C.bg }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Original inquiry</p>
              {selectedBundle.inquiry ? <Pill tone="info">source of truth</Pill> : <Pill tone="neutral">none</Pill>}
            </div>
            {selectedBundle.inquiry ? (
              <>
                <p className="text-sm" style={{ color: C.ink }}>{selectedBundle.inquiry.notes}</p>
                <p className="text-xs mt-2" style={{ color: C.charcoal }}>{selectedBundle.inquiry.desiredDate || "TBD"} • {selectedBundle.inquiry.location || "No location"}</p>
                <button onClick={() => setInquiryOpen(true)} className="mt-3 text-xs underline" style={{ color: C.forest }}>Open inquiry popup</button>
              </>
            ) : <p className="text-sm" style={{ color: C.taupe }}>No inquiry attached. This client was created manually.</p>}
          </div>

          <div className="rounded-3xl p-4" style={{ background: C.bg }}>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Portal access</p>
              <Pill tone={selectedBundle.projectStatus.portalAccessSent ? "done" : "warn"}>{selectedBundle.projectStatus.portalAccessSent ? "sent" : "not sent"}</Pill>
            </div>
            {selectedBundle.projectStatus.portalReady ? (
              <>
                <p className="text-sm break-all" style={{ color: C.ink }}>{portalUrl}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={copyPortal} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>Copy link</button>
                  <button onClick={() => setPage("portal")} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>Open portal</button>
                </div>
              </>
            ) : <p className="text-sm" style={{ color: C.taupe }}>Portal not available until quote, contract, and deposit are complete.</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ActionCard title="Build quote" body="Start from the inquiry reference or create a manual quote." actionLabel="Open quotes" onClick={() => setPage("quotes")} />
          <ActionCard title="Projects" body="Advanced Booking is now Projects. Manage prep, props, portal, gallery, and date selection here." actionLabel="Open projects" onClick={() => setPage("projects")} />
          <ActionCard title="Payments and calendar" body="Track invoices, deposit, final balance, session date, and calendar invite." actionLabel="Open sessions" onClick={() => setPage("sessions")} />
          <ActionCard title="Client messages" body="Read and reply to the client from inside the CRM." actionLabel="Open messages" onClick={() => setPage("clientMessages")} />
        </div>
      </Card>
      {inquiryOpen && selectedBundle.inquiry && (
        <Modal title="Original Inquiry" onClose={() => setInquiryOpen(false)}>
          <InquiryModalContent inquiry={selectedBundle.inquiry} />
        </Modal>
      )}
    </>
  );
}

function ClientRecordList({ title, empty, items, setPage, actionLabel, actionPage }) {
  return (
    <div className="rounded-3xl p-4" style={{ background: C.bg }}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium" style={{ color: C.ink }}>{title}</p>
        <button onClick={() => setPage(actionPage)} className="text-xs underline" style={{ color: C.forest }}>{actionLabel}</button>
      </div>
      <div className="space-y-2">
        {items.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>{empty}</p>}
        {items.map((item) => (
          <button key={item.id} onClick={() => setPage(item.page)} className="w-full text-left rounded-2xl px-3 py-2.5" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <p className="text-sm font-medium" style={{ color: C.ink }}>{item.title}</p>
            <p className="text-xs mt-1" style={{ color: C.charcoal }}>{item.meta}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

function InquiryModalContent({ inquiry }) {
  return (
    <div className="space-y-3 mt-4">
      <InfoBlock label="Name" value={inquiry.name} />
      <InfoBlock label="Session Type" value={inquiry.sessionType} />
      <InfoBlock label="Preferred Date" value={inquiry.desiredDate || "TBD"} />
      <InfoBlock label="Location" value={inquiry.location || "TBD"} />
      <div className="rounded-2xl p-3" style={{ background: C.bg }}>
        <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Inquiry Notes</p>
        <p className="text-sm leading-6" style={{ color: C.ink }}>{inquiry.notes || "No notes."}</p>
      </div>
    </div>
  );
}


function ProjectsPage({ state, selectedBundle, actions, setPage }) {
  const [query, setQuery] = useState("");
  const [bookedOnly, setBookedOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(9);

  const folders = state.clients
    .map((client) => ({ client, bundle: getClientBundle(state, client.id) }))
    .filter(({ client }) => !query.trim() || client.name.toLowerCase().includes(query.trim().toLowerCase()))
    .filter(({ bundle }) => !bookedOnly || bundle.projectStatus.projectCreated);

  const visible = folders.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <SectionLabel icon={FolderKanban}>Project Folders</SectionLabel>
          <Pill tone="info">One folder per client</Pill>
        </div>
        <p className="text-sm px-5 pb-3" style={{ color: C.charcoal }}>
          Every client gets a folder. A project only lands inside it once they're actually booked — quote accepted, contract
          signed, payment received. Click a folder to open that client's workspace below.
        </p>
        <div className="flex flex-wrap items-center gap-2 px-5 pb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-full flex-1 min-w-[180px]" style={{ background: C.bg }}>
            <Search size={14} color={C.taupe} />
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(9); }} placeholder="Search folders by client name..." className="bg-transparent outline-none text-sm w-full" style={{ color: C.ink }} />
          </div>
          <button
            onClick={() => { setBookedOnly((value) => !value); setVisibleCount(9); }}
            className="text-xs px-3 py-2 rounded-full font-medium shrink-0"
            style={{ background: bookedOnly ? C.forest : C.bg, color: bookedOnly ? "#fff" : C.charcoal }}
          >
            Booked projects only
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-5 pb-3">
          {visible.map(({ client, bundle }) => {
            const isOpen = client.id === state.selectedClientId;
            return (
              <button key={client.id} onClick={() => actions.selectClient(client.id)} className="text-left">
                <Card className="p-4" style={{ borderColor: isOpen ? C.taupe : C.line }}>
                  <div className="flex items-center justify-between mb-2">
                    <FolderKanban size={20} color={bundle.projectStatus.projectCreated ? C.forest : C.taupe} />
                    {bundle.projectStatus.projectCreated && <Pill tone="done">1 project</Pill>}
                  </div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{client.name}</p>
                  <p className="text-xs mt-1" style={{ color: C.taupe }}>
                    {bundle.projectStatus.projectCreated ? bundle.client.sessionType : "No project yet"}
                  </p>
                </Card>
              </button>
            );
          })}
          {folders.length === 0 && <p className="text-sm px-1" style={{ color: C.taupe }}>No folders match this search.</p>}
        </div>
        {visibleCount < folders.length && (
          <button onClick={() => setVisibleCount((count) => count + 9)} className="mx-5 mb-5 px-4 py-2 rounded-full text-xs font-medium" style={{ background: C.bg, color: C.charcoal }}>
            Show more ({folders.length - visibleCount} remaining)
          </button>
        )}
      </Card>

      <ProjectWorkspaceCard selectedBundle={selectedBundle} actions={actions} setPage={setPage} />
    </div>
  );
}

function ProjectWorkspaceCard({ selectedBundle, actions, setPage }) {
  if (!selectedBundle.client) {
    return <EmptyState title="No client selected" body="Open a folder above to view the booking gate and project handoff." />;
  }

  const { booking, projectStatus, session, portal } = selectedBundle;
  const canSendPortal = projectStatus.projectCreated && !projectStatus.portalAccessSent;
  const canSendAvailability = projectStatus.projectCreated && !session?.sessionDate;
  const canSendCalendarInvite = Boolean(session?.sessionDate) && !projectStatus.calendarInviteSent;
  const canDeliverGallery = session?.status === "completed" && session?.galleryStatus !== "delivered";
  const { requestSend, modal } = useEmailGate(actions, selectedBundle.client.id);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5">
      <div className="space-y-5">
        <BookingChecklistCard selectedBundle={selectedBundle} setPage={setPage} />
        <Card className="p-5">
          <SectionLabel icon={ClipboardList}>Project Creation Gate</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryChip label="Booked" value={booking.isBooked ? "Yes" : "No"} />
            <SummaryChip label="Project record" value={projectStatus.projectCreated ? "Created" : "Locked"} />
            <SummaryChip label="Portal ready" value={projectStatus.portalReady ? "Ready" : "Locked"} />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button disabled={!canSendPortal} onClick={() => { const d = buildEmailDraft("portal", selectedBundle); requestSend(d.subject, d.body, () => actions.sendPortalAccess(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.forest, color: "#fff" }}>
              Send portal access
            </button>
            <button disabled={!canSendAvailability} onClick={() => { const d = buildEmailDraft("availability", selectedBundle); requestSend(d.subject, d.body, () => actions.sendAvailability(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.cream, color: C.ink }}>
              Send date selection email
            </button>
            <button disabled={!canSendCalendarInvite} onClick={() => { const d = buildEmailDraft("calendar", selectedBundle); requestSend(d.subject, d.body, () => actions.sendCalendarInvite(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#edf2f5", color: C.blue }}>
              Send calendar invite
            </button>
            <button disabled={booking.isBooked} onClick={() => { const d = buildEmailDraft("reminder", selectedBundle); requestSend(d.subject, d.body, () => actions.sendBookingReminder(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#f8ece8", color: C.red }}>
              Send not-booked reminder
            </button>
            <button disabled={!canDeliverGallery} onClick={() => actions.deliverGallery(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#eef0e3", color: C.forest }}>
              Deliver gallery
            </button>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <p className="ecc-display text-3xl" style={{ color: C.ink }}>Project Workspace</p>
            <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.name}</p>
          </div>
          <button onClick={() => setPage("portal")} className="text-sm underline" style={{ color: C.forest }}>
            Edit portal
          </button>
        </div>
        {!projectStatus.projectCreated ? (
          <EmptyState
            title="No project has been created for this client yet"
            body="A project lands here automatically once the quote is accepted, the contract is signed, and payment is received."
            action={<button onClick={() => setPage(nextActionPage(selectedBundle))} className="mt-3 px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>{nextActionText(selectedBundle)}</button>}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              <SummaryChip label="Portal access" value={projectStatus.portalAccessSent ? "Sent" : "Pending"} />
              <SummaryChip label="Availability email" value={projectStatus.availabilitySent ? "Sent" : "Pending"} />
              <SummaryChip label="ICS invite" value={projectStatus.calendarInviteSent ? "Sent" : "Pending"} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              <div className="rounded-2xl p-4" style={{ background: C.bg }}>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Session Vision</p>
                <p className="text-sm mt-3 leading-7" style={{ color: C.ink }}>{portal?.sessionVision || "Portal vision not written yet."}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ background: C.bg }}>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Session Notes</p>
                <p className="text-sm mt-3 leading-7" style={{ color: C.ink }}>{portal?.sessionNotes || "Portal notes not written yet."}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <SummaryChip label="Date" value={session?.sessionDate || "Awaiting selection"} />
              <SummaryChip label="Time" value={session?.sessionTime || "Awaiting selection"} />
              <SummaryChip label="Props" value={portal?.propList?.length ? `${portal.propList.length} listed` : "Not started"} />
              <SummaryChip label="Gallery" value={session?.galleryStatus === "delivered" ? "Delivered" : session?.galleryStatus === "ready_for_delivery" ? "Ready" : "Not ready"} />
            </div>
            <div className="mt-5 rounded-2xl p-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
              <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Manual date / time / location override</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="date" value={toInputDate(session?.sessionDate)} onChange={(event) => actions.scheduleSession(selectedBundle.client.id, { date: fromInputDate(event.target.value), time: session?.sessionTime || "", locationId: session?.locationId, locationName: portal?.customLocation || selectedBundle.client.city })} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
                <input type="time" value={toInputTime(session?.sessionTime)} onChange={(event) => actions.scheduleSession(selectedBundle.client.id, { date: session?.sessionDate || fromInputDate(new Date().toISOString().slice(0,10)), time: fromInputTime(event.target.value), locationId: session?.locationId, locationName: portal?.customLocation || selectedBundle.client.city })} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
                <input value={portal?.customLocation || selectedBundle.client.city || ""} onChange={(event) => actions.scheduleSession(selectedBundle.client.id, { date: session?.sessionDate || "", time: session?.sessionTime || "", locationId: session?.locationId, locationName: event.target.value })} placeholder="Location or address" className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
              </div>
              {(portal?.customLocation || selectedBundle.client.city) && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(portal?.customLocation || selectedBundle.client.city)}`} target="_blank" rel="noreferrer" className="inline-block text-xs underline mt-3" style={{ color: C.forest }}>Open in Maps</a>}
            </div>
          </>
        )}
      </Card>
      {modal}
    </div>
  );
}

function RecordTrail({ selectedBundle, current, setPage }) {
  if (!selectedBundle.client) return null;
  const items = [
    { key: "inquiries", label: "Inquiry", exists: Boolean(selectedBundle.inquiry) },
    { key: "quotes", label: "Quote", exists: Boolean(selectedBundle.primaryQuote) },
    { key: "contracts", label: "Contract", exists: Boolean(selectedBundle.primaryContract) },
    { key: "invoices", label: "Invoice", exists: Boolean(selectedBundle.primaryInvoice) },
    { key: "sessions", label: "Session", exists: Boolean(selectedBundle.session) },
  ];
  return (
    <div className="flex items-center gap-1.5 flex-wrap mb-4">
      {items.map((item, index) => (
        <React.Fragment key={item.key}>
          {index > 0 && <ChevronRight size={12} color={C.taupe} />}
          <button
            disabled={item.key === current || !item.exists}
            onClick={() => setPage(item.key)}
            className="text-xs px-2.5 py-1 rounded-full font-medium disabled:opacity-100"
            style={{
              background: item.key === current ? C.forest : item.exists ? C.cream : "transparent",
              color: item.key === current ? "#fff" : item.exists ? C.ink : C.taupe,
              cursor: item.key === current || !item.exists ? "default" : "pointer",
            }}
          >
            {item.label}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
}

const QUOTE_TABS = [
  { key: "all", label: "All Quotes" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "accepted", label: "Accepted" },
  { key: "declined", label: "Declined" },
];

function QuotesDashboard({ state, actions }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const rows = state.quotes
    .map((entry) => ({ entry, bundle: getClientBundle(state, entry.clientId) }))
    .filter(({ entry }) => tab === "all" || (tab === "sent" ? ["sent", "viewed"].includes(entry.status) : entry.status === tab))
    .filter(({ bundle }) => !query.trim() || bundle.client?.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => String(b.entry.createdAt).localeCompare(String(a.entry.createdAt)));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Quotes</p>
      </div>
      <p className="text-sm" style={{ color: C.charcoal }}>Quotes are the decision layer. Open a client, build the offer, add required package choices, then send it for approval.</p>

      <Card className="p-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto ecc-scrollbar">
          {QUOTE_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0" style={{ background: tab === t.key ? C.charcoal : C.bg, color: tab === t.key ? "#fff" : C.charcoal }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-3 py-2 rounded-full min-w-[180px]" style={{ background: C.bg }}>
          <Search size={14} color={C.taupe} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client..." className="bg-transparent outline-none text-sm w-full" style={{ color: C.ink }} />
        </div>
      </Card>

      <Card>
        {rows.length === 0 && <p className="text-sm p-5" style={{ color: C.taupe }}>No quotes match.</p>}
        {rows.map(({ entry, bundle }, index) => (
          <button
            key={entry.id}
            onClick={() => actions.selectClient(entry.clientId)}
            className="w-full flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-left"
            style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}
          >
            <div className="flex items-center gap-3">
              <Avatar name={bundle.client?.name || "?"} />
              <div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number} — {bundle.client?.name}</p>
                <p className="text-xs mt-0.5" style={{ color: C.charcoal }}>{formatCurrency(entry.total)} · created {entry.createdAt}{entry.sentAt ? ` · sent ${entry.sentAt}` : ""}{entry.acceptedAt ? ` · accepted ${entry.acceptedAt}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
              <ChevronRight size={14} color={C.taupe} />
            </div>
          </button>
        ))}
      </Card>
    </div>
  );
}

function getQuoteSelectedPackage(quote, packages = []) {
  const option = (quote?.optionGroups || []).flatMap((group) => {
    const selectedIds = new Set(group.selectedOptionIds || []);
    return (group.options || []).filter((entry) => selectedIds.has(entry.id));
  })[0];
  if (!option) return null;
  return packages.find((pkg) => pkg.id === option.packageId) || {
    id: option.packageId || option.id,
    name: option.name,
    description: option.description,
    price: option.unitPrice,
  };
}

function getInquiryPackage(inquiry, packages = []) {
  if (!inquiry?.packageId) return null;
  return packages.find((pkg) => pkg.id === inquiry.packageId) || null;
}

function QuotesPage({ state, selectedBundle, actions, setPage }) {
  const quote = selectedBundle.primaryQuote;
  const [previewOpen, setPreviewOpen] = useState(false);
  const { requestSend, modal: emailModal } = useEmailGate(actions, selectedBundle.client?.id);
  const inquiryPackage = getInquiryPackage(selectedBundle.inquiry, state.packages);
  const quotePackage = getQuoteSelectedPackage(quote, state.packages);
  const sourcePackage = inquiryPackage || quotePackage;
  const quoteLocked = Boolean(quote && (quote.locked || ["sent", "viewed", "accepted", "declined"].includes(quote.status)));

  if (!selectedBundle.client) {
    return <QuotesDashboard state={state} actions={actions} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => actions.selectClient(null)} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> All quotes</button>
        {!quote && (
          <button onClick={() => actions.createQuote(selectedBundle.client.id)} className="px-3.5 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
            Create quote
          </button>
        )}
      </div>

      {!quote && (
        <EmptyState title="No quote yet" body="Draft the first connected quote from their inquiry and package." />
      )}
      {quote && (
        <Card className="p-6 sm:p-8">
          <RecordTrail selectedBundle={selectedBundle} current="quotes" setPage={setPage} />
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <p className="ecc-display text-4xl" style={{ color: C.ink }}>{quote.number}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {selectedBundle.client?.sessionType}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Pill tone={statusTone(quote.status)}>{quote.status}</Pill>
              {quoteLocked && <Pill tone="warn">locked</Pill>}
              {quoteLocked && quote.status !== "accepted" && quote.status !== "declined" && (
                <button onClick={() => actions.patchQuote(quote.id, { locked: false })} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>
                  Unlock edit
                </button>
              )}
              <button onClick={() => setPreviewOpen(true)} className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Eye size={13} /> {quoteLocked ? "View sent quote" : "Preview"}
              </button>
              <button onClick={() => window.confirm(`Delete ${quote.number}?`) && actions.deleteQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.red }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
          <p className="ecc-display text-2xl mt-4" style={{ color: C.ink }}>{formatCurrency(quote.total)}</p>

          {quoteLocked ? (
            <LockedDocumentPreview
              title="Quote is in preview mode"
              body="This quote has been sent or completed, so editing is locked. Use Unlock edit when you need to correct a sent quote. Accepted and declined quotes stay as records."
            >
              <QuotePreviewBody quote={quote} selectedBundle={selectedBundle} actions={actions} />
            </LockedDocumentPreview>
          ) : (
            <>
          <div className="rounded-3xl p-4 mt-5" style={{ background: C.bg }}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Inquiry Reference</p>
                <p className="text-sm mt-1" style={{ color: C.charcoal }}>Inquiry context feeds the quote. Manual quotes can stay blank here.</p>
              </div>
              {sourcePackage && <Pill tone="info">Default: {sourcePackage.name}</Pill>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <InfoBlock label="Inquiry package" value={inquiryPackage?.name || "No package selected"} />
              <InfoBlock label="Budget / date" value={`${selectedBundle.inquiry?.budgetRange || "No budget"} • ${selectedBundle.inquiry?.desiredDate || "TBD"}`} />
              <InfoBlock label="Location" value={selectedBundle.inquiry?.location || quote.location || "TBD"} />
            </div>
            {selectedBundle.inquiry?.notes && (
              <div className="mt-3 rounded-2xl p-3" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Client inquiry notes</p>
                <p className="text-sm leading-6" style={{ color: C.ink }}>{selectedBundle.inquiry.notes}</p>
              </div>
            )}
          </div>

          <div className="h-px my-6" style={{ background: C.line }} />

          <div className="rounded-3xl p-4 mb-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Choose template</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => actions.addQuotePackageGroup(quote.id, null)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#fff", color: C.ink, border: `1px solid ${C.line}` }}>Blank Quote</button>
              {state.packages.map((pkg) => (
                <button key={pkg.id} onClick={() => actions.addQuotePackageGroup(quote.id, pkg.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#fff", color: C.ink, border: `1px solid ${C.line}` }}>{pkg.quoteTemplateName || pkg.name}</button>
              ))}
            </div>
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Quote Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Field label="Quote date" value={quote.createdAt || ""} onChange={(value) => actions.patchQuote(quote.id, { createdAt: value })} />
            <Field label="Location" value={quote.location} onChange={(value) => actions.patchQuote(quote.id, { location: value })} />
            <Field label="Expiration date" type="date" value={toInputDate(quote.expirationDate)} onChange={(value) => actions.patchQuote(quote.id, { expirationDate: fromInputDate(value) })} />
            <Field label="Discount" type="number" value={quote.discount} onChange={(value) => actions.patchQuote(quote.id, { discount: Number(value || 0) })} />
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Internal Client Notes</p>
          <textarea rows={3} value={quote.notes || ""} onChange={(event) => actions.patchQuote(quote.id, { notes: event.target.value })} className="w-full rounded-2xl p-4 text-sm outline-none mb-6" style={{ border: `1px solid ${C.line}`, color: C.ink }} />

          <div className="rounded-3xl p-4 mb-6" style={{ background: C.bg }}>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Packages</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>These are the package boxes the client chooses from before accepting the quote.</p>
              </div>
              <button onClick={() => actions.addQuotePackageGroup(quote.id, selectedBundle.client?.packageId)} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>+ Pick-one group</button>
            </div>
            <div className="space-y-3">
              {(quote.optionGroups || []).length === 0 && <p className="text-sm rounded-2xl p-4" style={{ background: "#fff", color: C.taupe }}>No package choice group yet. Add one when the client needs to choose between packages.</p>}
              {(quote.optionGroups || []).map((group) => (
                <QuoteOptionGroupEditor key={group.id} quote={quote} group={group} actions={actions} />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Included line items and optional add-ons</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>Included items count now. Optional add-ons only count when selected.</p>
            </div>
          </div>
          <div className="space-y-4 mb-4">
            {quote.lineItems.map((item) => (
              <div key={item.id} className="rounded-2xl p-4" style={{ border: `1px solid ${C.line}` }}>
                <Field label="Item" value={item.name} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { name: value })} />
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Description</p>
                  <DescriptionEditor value={item.description} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { description: value })} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 max-w-xs">
                  <Field compact label="Qty" type="number" value={item.quantity} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { quantity: Number(value || 0) })} />
                  <Field compact label="Unit Price ($)" type="number" value={item.unitPrice} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { unitPrice: Number(value || 0) })} />
                </div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => actions.patchQuoteItem(quote.id, item.id, { optional: !item.optional, selected: item.optional ? false : item.selected })}
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={{ background: item.optional ? "#fbf1e6" : C.bg, color: item.optional ? "#9a6b2f" : C.taupe }}
                    >
                      {item.optional ? "Optional add-on" : "Mark optional"}
                    </button>
                    {item.optional && (
                      <button
                        onClick={() => actions.patchQuoteItem(quote.id, item.id, { selected: !item.selected })}
                        className="text-xs px-2.5 py-1 rounded-full font-medium"
                        style={{ background: item.selected ? "#eaf1ee" : C.bg, color: item.selected ? C.forest : C.charcoal }}
                      >
                        {item.selected ? "Selected in total" : "Not in total"}
                      </button>
                    )}
                  </div>
                  <button onClick={() => actions.removeQuoteItem(quote.id, item.id)} className="text-xs" style={{ color: C.red }}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-1">
            <button onClick={() => actions.addQuoteItem(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>+ Blank item</button>
            <CatalogPicker label="+ Add package" options={state.packages} onPick={(pkg) => actions.addQuoteCatalogItem(quote.id, { name: pkg.name, description: pkg.description, unitPrice: pkg.price })} />
            <CatalogPicker label="+ Add addon" options={state.addons} onPick={(addon) => actions.addQuoteCatalogItem(quote.id, { name: addon.name, description: addon.description, unitPrice: addon.price, optional: true })} />
            <button onClick={() => setPage("addons")} className="text-xs underline" style={{ color: C.forest }}>Manage add-ons →</button>
          </div>
          <p className="text-xs mb-6" style={{ color: C.taupe }}>Quote total is recalculated from included items, selected optional add-ons, and selected package options.</p>

          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Actions</p>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { const d = buildEmailDraft("quote", selectedBundle); requestSend(d.subject, d.body, () => actions.sendQuote(quote.id)); }} className="px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>Send quote</button>
            <button onClick={() => actions.viewQuote(quote.id)} className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: "#edf2f5", color: C.blue }}>Mark viewed</button>
            <button disabled={quote.status === "accepted"} onClick={() => actions.acceptQuote(quote.id)} className="px-4 py-2.5 rounded-full text-sm font-medium disabled:opacity-100" style={{ background: quote.status === "accepted" ? C.forest : "#eaf1ee", color: quote.status === "accepted" ? "#fff" : C.forest }}>{quote.status === "accepted" ? "Accepted" : "Accept"}</button>
            <button disabled={quote.status === "accepted"} onClick={() => actions.declineQuote(quote.id)} className="px-4 py-2.5 rounded-full text-sm font-medium disabled:opacity-40" style={{ background: "#f8ece8", color: C.red }}>Decline</button>
            {quote.status === "accepted" && (
              <button onClick={() => setPage("contracts")} className="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-1" style={{ background: C.charcoal, color: "#fff" }}>
                {selectedBundle.primaryContract ? "View contract" : "Generate contract"} <ChevronRight size={12} />
              </button>
            )}
          </div>
            </>
          )}
        </Card>
      )}

      {previewOpen && quote && (
        <Modal onClose={() => setPreviewOpen(false)} title="Quote Preview">
          <QuotePreviewBody quote={quote} selectedBundle={selectedBundle} actions={actions} />
        </Modal>
      )}
      {emailModal}
    </div>
  );
}


function LockedDocumentPreview({ title, body, children }) {
  return (
    <div className="rounded-3xl p-4 mt-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <div className="rounded-2xl p-4 mb-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
        <div className="flex items-start gap-3">
          <Eye size={18} color={C.forest} />
          <div>
            <p className="text-sm font-medium" style={{ color: C.ink }}>{title}</p>
            <p className="text-xs mt-1 leading-5" style={{ color: C.charcoal }}>{body}</p>
          </div>
        </div>
      </div>
      <div className="rounded-3xl p-5" style={{ background: "#fff" }}>
        {children}
      </div>
    </div>
  );
}

function QuotePreviewBody({ quote, selectedBundle, actions }) {
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>{selectedBundle.client?.name}</p>
      <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{quote.number}</p>
      <p className="text-sm mt-2" style={{ color: C.charcoal }}>{quote.eventType}</p>
      <div className="mt-6 space-y-3">
        {(quote.optionGroups || []).map((group) => <QuoteOptionGroupPreview key={group.id} group={group} quote={quote} actions={actions} readOnly />)}
        {quote.lineItems.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{item.name} {item.optional && <span className="text-xs" style={{ color: C.taupe }}>(optional)</span>}</p>
              <RichText text={item.description} className="text-xs mt-1" style={{ color: C.charcoal }} />
            </div>
            <p className="text-sm shrink-0" style={{ color: C.ink }}>{formatCurrency(item.quantity * item.unitPrice)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-6 text-sm">
        <PriceRow label="Subtotal" value={formatCurrency(quote.subtotal)} />
        {quote.discount > 0 && <PriceRow label="Discount" value={formatCurrency(quote.discount)} />}
        <PriceRow label="Tax" value={formatCurrency(quote.tax)} />
        <PriceRow strong label="Total" value={formatCurrency(quote.total)} />
      </div>
    </>
  );
}

function InvoicePreviewBody({ invoice, selectedBundle }) {
  return (
    <>
      <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>{selectedBundle.client?.name}</p>
      <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{invoice.number}</p>
      <p className="text-sm mt-2" style={{ color: C.charcoal }}>{invoice.kind} invoice · Due {invoice.dueDate || "TBD"}</p>
      <div className="mt-6 space-y-3">
        {invoice.lineItems.map((item) => (
          <div key={item.id} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{item.name}</p>
              <RichText text={item.description} className="text-xs mt-1" style={{ color: C.charcoal }} />
            </div>
            <p className="text-sm shrink-0" style={{ color: C.ink }}>{formatCurrency(item.quantity * item.unitPrice)}</p>
          </div>
        ))}
      </div>
      <div className="space-y-2 mt-6 text-sm">
        <PriceRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
        <PriceRow label="Tax" value={formatCurrency(invoice.tax)} />
        <PriceRow strong label="Total" value={formatCurrency(invoice.total)} />
        <PriceRow strong label="Balance Due" value={formatCurrency(invoice.balanceDue)} />
      </div>
    </>
  );
}

function useEmailGate(actions, clientId) {
  const [pending, setPending] = useState(null); // { subject, body, onSend }

  const requestSend = (subject, body, onSend) => setPending({ subject, body, onSend });

  const modal = pending ? (
    <EmailGateModal
      subject={pending.subject}
      body={pending.body}
      onClose={() => setPending(null)}
      onSendNow={(subject, body) => { pending.onSend(subject, body); setPending(null); }}
      onSchedule={(subject, body, sendAt) => { actions.scheduleEmail(clientId, subject, body, sendAt); setPending(null); }}
    />
  ) : null;

  return { requestSend, modal };
}

function EmailGateModal({ subject, body, onClose, onSendNow, onSchedule }) {
  const [editedSubject, setEditedSubject] = useState(subject);
  const [editedBody, setEditedBody] = useState(body);
  const [scheduling, setScheduling] = useState(false);
  const [sendAt, setSendAt] = useState("");

  return (
    <Modal onClose={onClose} title="Review before sending">
      <p className="text-xs mb-4" style={{ color: C.charcoal }}>Nothing important goes out blind. Review, edit if needed, then send or schedule.</p>
      <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Subject</p>
      <input value={editedSubject} onChange={(event) => setEditedSubject(event.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm mb-4" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
      <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Message</p>
      <textarea rows={7} value={editedBody} onChange={(event) => setEditedBody(event.target.value)} className="w-full px-3 py-2.5 rounded-2xl text-sm mb-4 outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />

      {scheduling ? (
        <div className="flex flex-wrap items-end gap-2 mb-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Send at</p>
            <input type="datetime-local" value={sendAt} onChange={(event) => setSendAt(event.target.value)} className="px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          </div>
          <button onClick={() => sendAt && onSchedule(editedSubject, editedBody, sendAt)} className="px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: C.charcoal }}>Confirm schedule</button>
          <button onClick={() => setScheduling(false)} className="px-3 py-2.5 text-sm" style={{ color: C.taupe }}>Cancel</button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onSendNow(editedSubject, editedBody)} className="px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>Send now</button>
          <button onClick={() => setScheduling(true)} className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: C.cream, color: C.ink }}>Schedule send</button>
        </div>
      )}
    </Modal>
  );
}

function buildEmailDraft(kind, bundle) {
  const name = bundle.client?.name?.split(" ")[0] || "there";
  const sessionType = bundle.client?.sessionType || "session";
  const quoteOption = bundle.primaryQuote?.optionGroups?.[0]?.options?.find((option) => (bundle.primaryQuote.optionGroups[0].selectedOptionIds || []).includes(option.id));
  const packageName = quoteOption?.name || "the package we built for you";
  const sessionKey = sessionType.toLowerCase();
  const quoteIntro = sessionKey.includes("maternity")
    ? `I built this around your maternity inquiry, the timing you shared, and ${packageName}.`
    : sessionKey.includes("newborn")
      ? `I built this around your newborn inquiry, the session pace, and ${packageName}.`
      : sessionKey.includes("wedding")
        ? `I built this around your wedding inquiry, your coverage needs, and ${packageName}.`
        : sessionKey.includes("family")
          ? `I built this around your family inquiry, the location notes, and ${packageName}.`
          : `I built this from your inquiry details and ${packageName}.`;
  switch (kind) {
    case "portal":
      return { subject: `Your EC Creative Studios portal is ready, ${name}!`, body: `Hi ${name},

Your private planning portal is live. You'll find your documents, vision board, and a direct line to message us, all for your ${sessionType} in one place.

Talk soon,
EC Creative Studios` };
    case "availability":
      return { subject: `Pick your session date, ${name}`, body: `Hi ${name},

Your deposit is in and your contract is signed. Head to your portal to choose your session date and time from our open availability.

EC Creative Studios` };
    case "calendar":
      return { subject: `Calendar invite: your ${sessionType}`, body: `Hi ${name},

Attached is a calendar invite for your upcoming ${sessionType}. Add it to your calendar so you do not miss it.

EC Creative Studios` };
    case "reminder":
      return { subject: `Your session is not booked yet, ${name}`, body: `Hi ${name},

Your session is not officially booked until your contract is signed and your invoice is paid. Please finish those steps so we can secure your date.

EC Creative Studios` };
    case "quote":
      return { subject: `${packageName} quote from EC Creative Studios`, body: `Hi ${name},

${quoteIntro}

Your current quote total is ${formatCurrency(bundle.primaryQuote?.total || 0)}. You can review the package, optional add-ons, and next steps from your client portal before accepting.

Once the quote is accepted, we will move into contract and invoice so your date can be secured.

EC Creative Studios` };
    case "contract":
      return { subject: `Please review and sign your contract, ${name}`, body: `Hi ${name},

Your contract for ${sessionType} is ready for signature. Please review the terms and sign so we can keep your booking moving.

EC Creative Studios` };
    case "invoice":
      return { subject: `Invoice ready, ${name}`, body: `Hi ${name},

Your invoice for ${formatCurrency(bundle.primaryInvoice?.balanceDue || 0)} is ready. You can pay directly from your portal.

EC Creative Studios` };
    default:
      return { subject: `A message from EC Creative Studios`, body: `Hi ${name},

` };
  }
}


function Modal({ onClose, title, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }} onClick={onClose}>
      <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto ecc-scrollbar rounded-2xl p-6" style={{ background: "#fff" }} onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{title}</p>
          <button onClick={onClose}><X size={18} color={C.charcoal} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AddOnsPage({ state, actions }) {
  const [draft, setDraft] = useState({ name: "", description: "", price: "" });

  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Add-Ons</p>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>
        These show up in the "+ Add addon" picker on every quote and invoice. Studio Rental lives here too — it's just an add-on like any other.
      </p>

      <Card className="p-4">
        <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>New Add-On</p>
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1.6fr_120px_100px] gap-2 items-end">
          <Field compact label="Name" value={draft.name} onChange={(value) => setDraft({ ...draft, name: value })} />
          <Field compact label="Description" value={draft.description} onChange={(value) => setDraft({ ...draft, description: value })} />
          <Field compact label="Price" type="number" value={draft.price} onChange={(value) => setDraft({ ...draft, price: value })} />
          <button
            onClick={() => {
              if (!draft.name.trim()) return;
              actions.addAddon({ name: draft.name, description: draft.description, price: Number(draft.price || 0) });
              setDraft({ name: "", description: "", price: "" });
            }}
            className="h-10 rounded-xl text-sm font-medium text-white"
            style={{ background: C.forest }}
          >
            Add
          </button>
        </div>
      </Card>

      <Card>
        {state.addons.map((addon, index) => (
          <div key={addon.id} className="grid grid-cols-1 md:grid-cols-[1.2fr_1.6fr_120px_60px] gap-2 items-center px-5 py-3.5" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
            <input value={addon.name} onChange={(event) => actions.updateAddon(addon.id, { name: event.target.value })} className="text-sm font-medium bg-transparent outline-none" style={{ color: C.ink }} />
            <input value={addon.description} onChange={(event) => actions.updateAddon(addon.id, { description: event.target.value })} className="text-sm bg-transparent outline-none" style={{ color: C.charcoal }} />
            <input type="number" value={addon.price} onChange={(event) => actions.updateAddon(addon.id, { price: Number(event.target.value || 0) })} className="text-sm bg-transparent outline-none px-2 py-1 rounded-lg" style={{ color: C.ink, border: `1px solid ${C.line}` }} />
            <button onClick={() => actions.removeAddon(addon.id)} className="text-xs justify-self-end" style={{ color: C.red }}>Remove</button>
          </div>
        ))}
      </Card>
    </div>
  );
}

function escapeHtml(value) {
  return (value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inlineFormat(value) {
  return value.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/(?<!\*)\*(.+?)\*(?!\*)/g, "<em>$1</em>");
}

function renderRichText(text) {
  if (/<(p|ul|ol|li|strong|em|br)\b/i.test(text || "")) return text;
  const lines = escapeHtml(text).split("\n");
  let html = "";
  let listType = null;
  lines.forEach((line) => {
    const bullet = line.match(/^-\s+(.*)/);
    const numbered = line.match(/^\d+\.\s+(.*)/);
    if (bullet) {
      if (listType !== "ul") { if (listType) html += `</${listType}>`; html += "<ul style='margin:4px 0;padding-left:18px;'>"; listType = "ul"; }
      html += `<li>${inlineFormat(bullet[1])}</li>`;
    } else if (numbered) {
      if (listType !== "ol") { if (listType) html += `</${listType}>`; html += "<ol style='margin:4px 0;padding-left:18px;'>"; listType = "ol"; }
      html += `<li>${inlineFormat(numbered[1])}</li>`;
    } else {
      if (listType) { html += `</${listType}>`; listType = null; }
      html += line ? `<p style='margin:0 0 4px 0;'>${inlineFormat(line)}</p>` : "<br/>";
    }
  });
  if (listType) html += `</${listType}>`;
  return html;
}

const RichText = ({ text, className, style }) => (
  <div className={className} style={style} dangerouslySetInnerHTML={{ __html: renderRichText(text || "") }} />
);

function DescriptionEditor({ value, onChange }) {
  const ref = useRef(null);
  const html = renderRichText(value || "");

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== html) ref.current.innerHTML = html;
  }, [html]);

  const command = (cmd) => {
    if (typeof document === "undefined") return;
    ref.current?.focus();
    document.execCommand(cmd, false, null);
    onChange(ref.current?.innerHTML || "");
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-1 px-2 py-1.5" style={{ background: C.bg, borderBottom: `1px solid ${C.line}` }}>
        <button type="button" onClick={() => command("bold")} className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs" style={{ color: C.ink }}>B</button>
        <button type="button" onClick={() => command("italic")} className="w-7 h-7 rounded-lg flex items-center justify-center italic text-xs" style={{ color: C.ink }}>I</button>
        <button type="button" onClick={() => command("insertUnorderedList")} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ color: C.ink }}><ListChecks size={13} /></button>
        <button type="button" onClick={() => command("insertOrderedList")} className="w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ color: C.ink }}>1.</button>
        <span className="text-[10px] ml-1" style={{ color: C.taupe }}>Formatted editor. No markdown symbols needed.</span>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={() => onChange(ref.current?.innerHTML || "")}
        className="w-full min-h-[96px] px-3 py-2.5 text-sm outline-none"
        style={{ color: C.ink, background: "#fff" }}
      />
    </div>
  );
}


function QuoteOptionGroupEditor({ quote, group, actions }) {
  const selected = new Set(group.selectedOptionIds || []);
  return (
    <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_80px] gap-2 items-end mb-3">
        <Field compact label="Group title" value={group.title || ""} onChange={(value) => actions.patchQuoteOptionGroup(quote.id, group.id, { title: value })} />
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Mode</p>
          <select value={group.selectionMode || "single"} onChange={(event) => actions.patchQuoteOptionGroup(quote.id, group.id, { selectionMode: event.target.value, selectedOptionIds: event.target.value === "single" ? (group.selectedOptionIds || []).slice(0, 1) : group.selectedOptionIds || [] })} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
            <option value="single">Pick one</option>
            <option value="multiple">Pick many</option>
          </select>
        </div>
        <button onClick={() => actions.removeQuoteOptionGroup(quote.id, group.id)} className="text-xs justify-self-end" style={{ color: C.red }}>Remove</button>
      </div>
      <textarea value={group.description || ""} onChange={(event) => actions.patchQuoteOptionGroup(quote.id, group.id, { description: event.target.value })} rows={2} className="w-full rounded-xl p-3 text-sm outline-none mb-3" style={{ border: `1px solid ${C.line}`, color: C.ink }} placeholder="Explain how the client should choose." />

      <div className="space-y-3">
        {(group.options || []).map((option) => (
          <div key={option.id} className="rounded-2xl p-3" style={{ background: C.bg }}>
            <div className="flex items-center gap-2 mb-2">
              <button onClick={() => actions.selectQuoteOption(quote.id, group.id, option.id, !selected.has(option.id))} className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center" style={{ border: `1px solid ${selected.has(option.id) ? C.forest : C.taupe}`, background: selected.has(option.id) ? C.forest : "#fff" }}>
                {selected.has(option.id) && <Check size={12} color="#fff" />}
              </button>
              <p className="text-xs" style={{ color: C.charcoal }}>Selected option affects the quote total</p>
              <div className="flex-1" />
              <button onClick={() => actions.removeQuoteOption(quote.id, group.id, option.id)} className="text-xs" style={{ color: C.red }}>Remove option</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-[1fr_110px_110px] gap-2 mb-2">
              <Field compact label="Package name" value={option.name || ""} onChange={(value) => actions.patchQuoteOption(quote.id, group.id, option.id, { name: value })} />
              <Field compact label="Badge" value={option.badge || ""} onChange={(value) => actions.patchQuoteOption(quote.id, group.id, option.id, { badge: value })} />
              <Field compact label="Price ($)" type="number" value={option.unitPrice || 0} onChange={(value) => actions.patchQuoteOption(quote.id, group.id, option.id, { unitPrice: Number(value || 0) })} />
            </div>
            <DescriptionEditor value={option.description || ""} onChange={(value) => actions.patchQuoteOption(quote.id, group.id, option.id, { description: value })} />
          </div>
        ))}
      </div>
      <button onClick={() => actions.addQuoteOption(quote.id, group.id)} className="mt-3 px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>+ Add custom option</button>
    </div>
  );
}

function QuoteOptionGroupPreview({ group, quote, actions, readOnly = false }) {
  const selected = new Set(group.selectedOptionIds || []);
  return (
    <div className="rounded-2xl p-4" style={{ border: `1px solid ${C.line}`, background: C.bg }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-medium" style={{ color: C.ink }}>{group.title || "Package choices"}</p>
          {group.description && <p className="text-xs mt-1" style={{ color: C.charcoal }}>{group.description}</p>}
        </div>
        <Pill tone={group.required ? "warn" : "neutral"}>{group.selectionMode === "multiple" ? "choose options" : "choose one"}</Pill>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
        {(group.options || []).map((option) => {
          const isSelected = selected.has(option.id);
          return (
            <button
              key={option.id}
              disabled={readOnly}
              onClick={() => !readOnly && actions?.selectQuoteOption(quote.id, group.id, option.id, !isSelected)}
              className="w-full text-left rounded-2xl p-3"
              style={{ background: isSelected ? "#fff" : "rgba(255,255,255,0.55)", border: `1px solid ${isSelected ? C.forest : C.line}` }}
            >
              <div className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-md mt-0.5 shrink-0 flex items-center justify-center" style={{ border: `1px solid ${isSelected ? C.forest : C.taupe}`, background: isSelected ? C.forest : "#fff" }}>
                  {isSelected && <Check size={12} color="#fff" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {option.badge && <Pill tone="done">{option.badge}</Pill>}
                      <p className="text-sm font-medium mt-1" style={{ color: C.ink }}>{option.name}</p>
                    </div>
                    <p className="text-sm shrink-0" style={{ color: C.ink }}>{formatCurrency((option.quantity || 1) * (option.unitPrice || 0))}</p>
                  </div>
                  <RichText text={option.description} className="text-xs mt-1" style={{ color: C.charcoal }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CatalogPicker({ label, options, onPick }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((value) => !value)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>
        {label}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 w-64 rounded-2xl shadow-lg z-40 py-1" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => { onPick(option); setOpen(false); }}
                className="w-full text-left px-3 py-2.5 text-sm"
              >
                <p style={{ color: C.ink }}>{option.name}</p>
                <p className="text-xs" style={{ color: C.taupe }}>{formatCurrency(option.price)}</p>
              </button>
            ))}
            {options.length === 0 && <p className="px-3 py-2 text-xs" style={{ color: C.taupe }}>None set up yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}

const CONTRACT_TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "signed", label: "Signed" },
];

function ContractsDashboard({ state, actions }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const rows = state.contracts
    .map((entry) => ({ entry, bundle: getClientBundle(state, entry.clientId) }))
    .filter(({ entry }) => tab === "all" || entry.status === tab)
    .filter(({ bundle }) => !query.trim() || bundle.client?.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => String(b.entry.createdAt).localeCompare(String(a.entry.createdAt)));

  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Contracts</p>
      <p className="text-sm" style={{ color: C.charcoal }}>Every contract across every client. Click one to open it.</p>
      <Card className="p-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1">
          {CONTRACT_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: tab === t.key ? C.charcoal : C.bg, color: tab === t.key ? "#fff" : C.charcoal }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-3 py-2 rounded-full min-w-[180px]" style={{ background: C.bg }}>
          <Search size={14} color={C.taupe} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client..." className="bg-transparent outline-none text-sm w-full" style={{ color: C.ink }} />
        </div>
      </Card>
      <Card>
        {rows.length === 0 && <p className="text-sm p-5" style={{ color: C.taupe }}>No contracts match.</p>}
        {rows.map(({ entry, bundle }, index) => (
          <button key={entry.id} onClick={() => actions.selectClient(entry.clientId)} className="w-full flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-left" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
            <div className="flex items-center gap-3">
              <Avatar name={bundle.client?.name || "?"} />
              <div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number} — {bundle.client?.name}</p>
                <p className="text-xs mt-0.5" style={{ color: C.charcoal }}>{entry.templateName} · session {bundle.session?.sessionDate || "TBD"}{entry.sentAt ? ` · sent ${entry.sentAt}` : ""}{entry.signedAt ? ` · signed ${entry.signedAt}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
              <ChevronRight size={14} color={C.taupe} />
            </div>
          </button>
        ))}
      </Card>
    </div>
  );
}

function ContractsPage({ state, selectedBundle, actions, setPage }) {
  const contract = selectedBundle.primaryContract;
  const { requestSend, modal: emailModal } = useEmailGate(actions, selectedBundle.client?.id);

  if (!selectedBundle.client) {
    return <ContractsDashboard state={state} actions={actions} />;
  }

  return (
    <div className="space-y-4">
      <button onClick={() => actions.selectClient(null)} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> All contracts</button>
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
      <Card className="p-5">
        <SectionLabel icon={FileSignature}>Contract Controls</SectionLabel>
        <p className="text-sm mb-4" style={{ color: C.charcoal }}>
          Contracts only unlock after a quote is accepted. Signing the contract still does not create a project until payment is in.
        </p>
        {selectedBundle.primaryQuote && (
          <button onClick={() => setPage("quotes")} className="text-xs underline mb-3 inline-block" style={{ color: C.forest }}>
            ← View source quote {selectedBundle.primaryQuote.number}
          </button>
        )}
        <button onClick={() => selectedBundle.client && actions.createContract(selectedBundle.client.id)} className="px-4 py-3 rounded-xl text-sm font-medium text-white block" style={{ background: C.forest }}>
          Generate contract
        </button>
        {contract && (
          <div className="mt-5 space-y-3">
            <SummaryChip label="Contract No." value={contract.number} />
            <div className="rounded-2xl p-4" style={{ background: C.bg }}>
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Template</p>
              <select value={contract.templateName} onChange={(event) => actions.patchContract(contract.id, { templateName: event.target.value })} className="mt-2 w-full px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                {["Standard Photography Agreement", "Wedding Agreement", "Branding Agreement", "Event Agreement", "Milestone Package Agreement"].map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </div>
            <SummaryChip label="Status" value={contract.status} />
            <SummaryChip label="Drafted" value={contract.createdAt} />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => { const d = buildEmailDraft("contract", selectedBundle); requestSend(d.subject, d.body, () => actions.sendContract(contract.id)); }} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>
                Send for signature
              </button>
              <button onClick={() => actions.signContract(contract.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#eaf1ee", color: C.forest }}>
                Mark signed
              </button>
              {contract.status === "signed" && (
                <button onClick={() => setPage("invoices")} className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: C.charcoal, color: "#fff" }}>
                  {selectedBundle.primaryInvoice ? "View invoice" : "Create invoice"} <ChevronRight size={12} />
                </button>
              )}
              <button onClick={() => window.confirm(`Delete ${contract.number}?`) && actions.deleteContract(contract.id)} className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1" style={{ background: "#fff", color: C.red, border: `1px solid ${C.line}` }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        )}
      </Card>

      {!contract ? (
        <EmptyState title="No contract yet" body="Approve the quote first, then generate a contract tied to that accepted proposal." />
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="px-6 pt-5">
            <RecordTrail selectedBundle={selectedBundle} current="contracts" setPage={setPage} />
          </div>
          <div className="px-8 sm:px-14 pt-2 pb-12" style={{ background: "#fffdf9" }}>
            <div className="text-center mb-10">
              <p className="text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: C.taupe }}>EC Creative Studios</p>
              <p className="ecc-display text-4xl" style={{ color: C.ink }}>{contract.templateName}</p>
              <p className="text-xs mt-2" style={{ color: C.charcoal }}>Contract No. {contract.number} · Drafted {contract.createdAt}</p>
              <span className="inline-block mt-3">
                <Pill tone={statusTone(contract.status)}>{contract.status}</Pill>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 pb-8" style={{ borderBottom: `1px solid ${C.line}` }}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Photographer</p>
                <p className="ecc-display text-xl" style={{ color: C.ink }}>EC Creative Studios</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>Dallas–Fort Worth, TX</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Client</p>
                <p className="ecc-display text-xl" style={{ color: C.ink }}>{selectedBundle.client?.name}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.email} · {selectedBundle.client?.sessionType}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => actions.patchContract(contract.id, { clauses: [...(contract.clauses || []), { id: `clause_${Date.now()}`, title: `${(contract.clauses || []).length + 1}. New Section`, body: "Write clause text here." }] })} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>+ Add section</button>
            </div>
            <div className="space-y-7">
              {(contract.clauses || []).map((clause) => (
                <div key={clause.id}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <input value={clause.title} onChange={(event) => actions.patchContract(contract.id, { clauses: contract.clauses.map((entry) => (entry.id === clause.id ? { ...entry, title: event.target.value } : entry)) })} className="ecc-display text-lg flex-1 bg-transparent outline-none" style={{ color: C.ink }} />
                    <button onClick={() => actions.patchContract(contract.id, { clauses: contract.clauses.filter((entry) => entry.id !== clause.id) })} className="text-xs" style={{ color: C.red }}>Remove</button>
                  </div>
                  <textarea
                    rows={3}
                    value={clause.body}
                    onChange={(event) => actions.patchContract(contract.id, { clauses: contract.clauses.map((entry) => (entry.id === clause.id ? { ...entry, body: event.target.value } : entry)) })}
                    className="w-full text-sm leading-7 outline-none resize-none bg-transparent"
                    style={{ color: C.charcoal, fontFamily: "inherit" }}
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mt-14 pt-10" style={{ borderTop: `1px solid ${C.line}` }}>
              <div>
                <div className="h-10 flex items-end" style={{ borderBottom: `1px solid ${C.ink}` }}>
                  <p className="ecc-display text-2xl italic" style={{ color: contract.status === "signed" ? C.ink : C.line }}>
                    {contract.signerName || ""}
                  </p>
                </div>
                <p className="text-xs mt-2" style={{ color: C.taupe }}>Client signature box · mouse, finger, or trackpad · {contract.signedAt || "Awaiting signature"}</p>
              </div>
              <div>
                <div className="h-10 flex items-end" style={{ borderBottom: `1px solid ${C.ink}` }}>
                  <p className="ecc-display text-2xl italic" style={{ color: C.ink }}>EC Creative Studios</p>
                </div>
                <p className="text-xs mt-2" style={{ color: C.taupe }}>Photographer · {contract.createdAt}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
      {emailModal}
      </div>
    </div>
  );
}

const INVOICE_TABS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "sent", label: "Sent" },
  { key: "partially_paid", label: "Partially Paid" },
  { key: "paid", label: "Paid" },
];

function InvoicesDashboard({ state, actions }) {
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");

  const rows = state.invoices
    .map((entry) => ({ entry, bundle: getClientBundle(state, entry.clientId) }))
    .filter(({ entry }) => tab === "all" || entry.status === tab)
    .filter(({ bundle }) => !query.trim() || bundle.client?.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => String(b.entry.createdAt).localeCompare(String(a.entry.createdAt)));

  const totals = {
    unpaid: state.invoices.reduce((sum, entry) => sum + entry.balanceDue, 0),
    pastDue: state.invoices.filter((entry) => entry.dueDate && entry.balanceDue > 0).reduce((sum, entry) => sum + entry.balanceDue, 0),
    paid: state.invoices.reduce((sum, entry) => sum + entry.amountPaid, 0),
  };

  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Invoices</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Total Unpaid</p><p className="ecc-display text-2xl mt-1" style={{ color: C.ink }}>{formatCurrency(totals.unpaid)}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Past Due</p><p className="ecc-display text-2xl mt-1" style={{ color: C.red }}>{formatCurrency(totals.pastDue)}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Collected</p><p className="ecc-display text-2xl mt-1" style={{ color: C.forest }}>{formatCurrency(totals.paid)}</p></Card>
      </div>
      <Card className="p-4 flex flex-wrap items-center gap-2">
        <div className="flex gap-1 overflow-x-auto ecc-scrollbar">
          {INVOICE_TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className="px-3 py-1.5 rounded-full text-xs font-medium shrink-0" style={{ background: tab === t.key ? C.charcoal : C.bg, color: tab === t.key ? "#fff" : C.charcoal }}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 px-3 py-2 rounded-full min-w-[180px]" style={{ background: C.bg }}>
          <Search size={14} color={C.taupe} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by client..." className="bg-transparent outline-none text-sm w-full" style={{ color: C.ink }} />
        </div>
      </Card>
      <Card>
        {rows.length === 0 && <p className="text-sm p-5" style={{ color: C.taupe }}>No invoices match.</p>}
        {rows.map(({ entry, bundle }, index) => (
          <button key={entry.id} onClick={() => actions.selectClient(entry.clientId)} className="w-full flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-left" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
            <div className="flex items-center gap-3">
              <Avatar name={bundle.client?.name || "?"} />
              <div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number} — {bundle.client?.name}</p>
                <p className="text-xs mt-0.5" style={{ color: C.charcoal }}>{formatCurrency(entry.total)} total · {formatCurrency(entry.amountPaid)} paid · {formatCurrency(entry.balanceDue)} due{entry.dueDate ? ` by ${entry.dueDate}` : ""}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
              <ChevronRight size={14} color={C.taupe} />
            </div>
          </button>
        ))}
      </Card>
    </div>
  );
}

function InvoicesPage({ state, selectedBundle, actions, setPage }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Card");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const invoice = selectedBundle.invoices.find((entry) => entry.id === selectedInvoiceId) || selectedBundle.primaryInvoice;
  const invoiceLocked = Boolean(invoice?.status === "paid" || invoice?.locked);
  const { requestSend, modal: emailModal } = useEmailGate(actions, selectedBundle.client?.id);

  if (!selectedBundle.client) {
    return <InvoicesDashboard state={state} actions={actions} />;
  }

  return (
    <div className="space-y-4">
      <button onClick={() => actions.selectClient(null)} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> All invoices</button>
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-5">
      <Card className="p-4">
        <SectionLabel icon={Receipt}>Invoices</SectionLabel>
        <div className="flex flex-col gap-2 mb-4">
          <button onClick={() => selectedBundle.client && actions.createInvoice(selectedBundle.client.id, "deposit")} className="px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
            Create deposit invoice
          </button>
          <button onClick={() => selectedBundle.client && actions.createInvoice(selectedBundle.client.id, "final")} className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: C.cream, color: C.ink }}>
            Create final invoice
          </button>
          <button onClick={() => selectedBundle.client && actions.createInvoice(selectedBundle.client.id, "full")} className="px-4 py-3 rounded-xl text-sm font-medium" style={{ background: "#edf2f5", color: C.blue }}>
            Create full-payment invoice
          </button>
        </div>
        <div className="space-y-2">
          {selectedBundle.invoices.map((entry) => (
            <button key={entry.id} onClick={() => setSelectedInvoiceId(entry.id)} className="w-full p-3 rounded-xl text-left" style={{ background: invoice?.id === entry.id ? C.cream : "#fff", border: `1px solid ${invoice?.id === entry.id ? C.forest : C.line}` }}>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number}</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>{entry.kind} • {formatCurrency(entry.total)}</p>
              <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
            </button>
          ))}
        </div>
      </Card>

      {!invoice ? (
        <EmptyState title="No invoice selected" body="Create the next invoice from the signed contract or select an existing invoice to track payment." />
      ) : (
        <Card className="p-6 sm:p-8">
          <RecordTrail selectedBundle={selectedBundle} current="invoices" setPage={setPage} />
          <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
            <div>
              <p className="ecc-display text-4xl" style={{ color: C.ink }}>{invoice.number}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {invoice.kind}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Pill tone={statusTone(invoice.status)}>{invoice.status}</Pill>
              {invoiceLocked && <Pill tone="warn">locked</Pill>}
              {invoice?.locked && invoice.status !== "paid" && <button onClick={() => actions.patchInvoice(invoice.id, { locked: false })} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>Unlock edit</button>}
              <button onClick={() => setPreviewOpen(true)} className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <Eye size={13} /> {invoiceLocked ? "View sent invoice" : "Preview"}
              </button>
              <button onClick={() => window.confirm(`Delete ${invoice.number}?`) && actions.deleteInvoice(invoice.id)} className="px-3 py-2 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.red }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>

          <div className="h-px my-6" style={{ background: C.line }} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
            <SummaryChip label="Total" value={formatCurrency(invoice.total)} />
            <SummaryChip label="Paid" value={formatCurrency(invoice.amountPaid)} onClick={() => setPage("payments")} />
            <SummaryChip label="Balance" value={formatCurrency(invoice.balanceDue)} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Due date</p>
              <input disabled={invoiceLocked} type="date" value={toInputDate(invoice.dueDate)} onChange={(event) => actions.patchInvoice(invoice.id, { dueDate: fromInputDate(event.target.value) })} className="w-full rounded-2xl px-3 py-2.5 text-sm disabled:opacity-60" style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }} />
            </div>
          </div>

          {invoiceLocked ? (
            <LockedDocumentPreview
              title="Invoice is in preview mode"
              body="Sent invoices are locked so the amount the client received does not silently change. Unlock edit if you need to correct an unpaid invoice. Paid invoices stay locked."
            >
              <InvoicePreviewBody invoice={invoice} selectedBundle={selectedBundle} />
            </LockedDocumentPreview>
          ) : (
            <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Line Items</p>
          </div>
          <div className="space-y-4 mb-4">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="rounded-2xl p-4" style={{ border: `1px solid ${C.line}` }}>
                <Field label="Item" value={item.name} onChange={(value) => actions.patchInvoiceItem(invoice.id, item.id, { name: value })} />
                <div className="mt-3">
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Description</p>
                  <DescriptionEditor value={item.description} onChange={(value) => actions.patchInvoiceItem(invoice.id, item.id, { description: value })} />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3 max-w-xs">
                  <Field compact label="Qty" type="number" value={item.quantity} onChange={(value) => actions.patchInvoiceItem(invoice.id, item.id, { quantity: Number(value || 0) })} />
                  <Field compact label="Unit Price ($)" type="number" value={item.unitPrice} onChange={(value) => actions.patchInvoiceItem(invoice.id, item.id, { unitPrice: Number(value || 0) })} />
                </div>
                <div className="flex items-center justify-end mt-3 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
                  <button onClick={() => actions.removeInvoiceItem(invoice.id, item.id)} className="text-xs" style={{ color: C.red }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-7">
            <button onClick={() => actions.addInvoiceItem(invoice.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>+ Blank item</button>
            <CatalogPicker label="+ Add package" options={state.packages} onPick={(pkg) => actions.addInvoiceCatalogItem(invoice.id, { name: pkg.name, description: pkg.description, unitPrice: pkg.price })} />
            {invoice.kind === "final" && <CatalogPicker label="+ Rush delivery" options={state.addons.filter((addon) => addon.name.toLowerCase().includes("rush"))} onPick={(addon) => actions.addInvoiceCatalogItem(invoice.id, { name: addon.name, description: addon.description, unitPrice: addon.price })} />}
            <span className="text-xs" style={{ color: C.taupe }}>Packages add as a new item below — edit the price to match what was actually billed.</span>
          </div>
            </>
          )}

          <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Send &amp; Collect</p>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <button disabled={invoice.status === "paid"} onClick={() => { const d = buildEmailDraft("invoice", selectedBundle); requestSend(d.subject, d.body, () => actions.sendInvoice(invoice.id)); }} className="px-4 py-2.5 rounded-full text-sm font-medium text-white disabled:opacity-40" style={{ background: C.forest }}>
              Send invoice
            </button>
            <button onClick={() => { const d = buildEmailDraft("reminder", selectedBundle); requestSend(d.subject, d.body, () => actions.sendBookingReminder(selectedBundle.client.id)); }} className="px-4 py-2.5 rounded-full text-sm font-medium" style={{ background: "#f8ece8", color: C.red }}>
              Send not-booked reminder
            </button>
            {invoice.balanceDue <= 0 && (
              <button onClick={() => setPage("projects")} className="px-4 py-2.5 rounded-full text-sm font-medium flex items-center gap-1" style={{ background: C.charcoal, color: "#fff" }}>
                Paid — open project <ChevronRight size={12} />
              </button>
            )}
          </div>

          <div className="rounded-2xl p-4 flex flex-wrap items-end gap-3" style={{ background: C.bg }}>
            <Field compact label="Payment amount" type="number" value={paymentAmount} onChange={setPaymentAmount} />
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Method</p>
              <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                {["Card", "Zelle", "Cash", "Check", "Stripe"].map((method) => <option key={method}>{method}</option>)}
              </select>
            </div>
            <button onClick={() => { actions.recordPayment(invoice.id, Number(paymentAmount || 0), paymentMethod); setPaymentAmount(""); }} className="px-4 py-2.5 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
              Apply payment
            </button>
          </div>

          <p className="text-[10px] uppercase tracking-[0.25em] mt-6 mb-2" style={{ color: C.taupe }}>Internal notes</p>
          <textarea rows={3} value={invoice.internalNotes || ""} onChange={(event) => actions.patchInvoice(invoice.id, { internalNotes: event.target.value })} className="w-full rounded-2xl p-3 text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
        </Card>
      )}

      {previewOpen && invoice && (
        <Modal onClose={() => setPreviewOpen(false)} title="Invoice Preview">
          <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>{selectedBundle.client?.name}</p>
          <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{invoice.number}</p>
          <p className="text-sm mt-2" style={{ color: C.charcoal }}>{invoice.kind} invoice · Due {invoice.dueDate || "TBD"}</p>
          <div className="mt-6 space-y-3">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{item.name}</p>
                  <RichText text={item.description} className="text-xs mt-1" style={{ color: C.charcoal }} />
                </div>
                <p className="text-sm shrink-0" style={{ color: C.ink }}>{formatCurrency(item.quantity * item.unitPrice)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 mt-6 text-sm">
            <PriceRow label="Subtotal" value={formatCurrency(invoice.subtotal)} />
            <PriceRow label="Tax" value={formatCurrency(invoice.tax)} />
            <PriceRow label="Paid" value={formatCurrency(invoice.amountPaid)} />
            <PriceRow strong label="Balance due" value={formatCurrency(invoice.balanceDue)} />
          </div>
        </Modal>
      )}
      {emailModal}
      </div>
    </div>
  );
}

function PaymentsPage({ state, selectedBundle, actions, setPage }) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Card");
  const [targetInvoiceId, setTargetInvoiceId] = useState("");
  const [receipt, setReceipt] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const { requestSend, modal: emailModal } = useEmailGate(actions, selectedBundle.client?.id);

  const methodTotals = useMemo(() => {
    const totals = {};
    state.payments.forEach((payment) => { totals[payment.method] = (totals[payment.method] || 0) + payment.amount; });
    return Object.entries(totals);
  }, [state.payments]);

  const unpaidInvoices = selectedBundle.invoices.filter((invoice) => invoice.balanceDue > 0);
  const effectiveInvoiceId = targetInvoiceId || unpaidInvoices[0]?.id || "";

  const outstanding = state.invoices
    .filter((entry) => entry.balanceDue > 0)
    .map((entry) => ({ entry, bundle: getClientBundle(state, entry.clientId) }))
    .sort((a, b) => b.entry.balanceDue - a.entry.balanceDue);

  const overview = {
    unpaid: outstanding.reduce((sum, { entry }) => sum + entry.balanceDue, 0),
    depositsPending: state.invoices.filter((e) => e.kind === "deposit" && e.balanceDue > 0).reduce((s, e) => s + e.balanceDue, 0),
    finalPending: state.invoices.filter((e) => e.kind !== "deposit" && e.balanceDue > 0).reduce((s, e) => s + e.balanceDue, 0),
    pastDue: outstanding.filter(({ entry }) => entry.dueDate).reduce((s, { entry }) => s + entry.balanceDue, 0),
  };

  const copyLink = (invoiceId) => {
    const url = `https://eccreativestudios.com/pay/${invoiceId}`;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(url).catch(() => {});
    }
    setCopiedId(invoiceId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="space-y-5">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Payments</p>
      <p className="text-sm" style={{ color: C.charcoal }}>Who owes money, who's paid a deposit, what's past due, and what reminders need to go out.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.taupe }}>Total Unpaid</p><p className="ecc-display text-2xl mt-1" style={{ color: C.ink }}>{formatCurrency(overview.unpaid)}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.taupe }}>Deposits Pending</p><p className="ecc-display text-2xl mt-1" style={{ color: C.ink }}>{formatCurrency(overview.depositsPending)}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.taupe }}>Final Pending</p><p className="ecc-display text-2xl mt-1" style={{ color: C.ink }}>{formatCurrency(overview.finalPending)}</p></Card>
        <Card className="p-4"><p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: C.taupe }}>Past Due</p><p className="ecc-display text-2xl mt-1" style={{ color: C.red }}>{formatCurrency(overview.pastDue)}</p></Card>
      </div>

      <Card className="p-5">
        <SectionLabel icon={AlertTriangle}>Outstanding Payments</SectionLabel>
        <div className="px-5 pb-5">
          {outstanding.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>Nothing outstanding right now.</p>}
          {outstanding.map(({ entry, bundle }, index) => (
            <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 py-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
              <button onClick={() => actions.selectClient(entry.clientId)} className="flex items-center gap-3 text-left">
                <Avatar name={bundle.client?.name || "?"} />
                <div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{bundle.client?.name} — {bundle.client?.sessionType}</p>
                  <p className="text-xs mt-0.5" style={{ color: C.charcoal }}>{entry.number} · {formatCurrency(entry.total)} total · {formatCurrency(entry.amountPaid)} paid · <strong>{formatCurrency(entry.balanceDue)} due</strong>{entry.dueDate ? ` by ${entry.dueDate}` : ""}</p>
                </div>
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { actions.selectClient(entry.clientId); const d = buildEmailDraft("reminder", bundle); requestSend(d.subject, d.body, () => actions.sendBookingReminder(entry.clientId)); }}
                  className="text-xs px-2.5 py-1.5 rounded-full font-medium"
                  style={{ background: "#f8ece8", color: C.red }}
                >
                  Send reminder
                </button>
                <button onClick={() => copyLink(entry.id)} className="text-xs px-2.5 py-1.5 rounded-full font-medium" style={{ background: C.bg, color: C.charcoal }}>
                  {copiedId === entry.id ? "Copied!" : "Copy payment link"}
                </button>
                <button onClick={() => actions.recordPayment(entry.id, entry.balanceDue, "Manual")} className="text-xs px-2.5 py-1.5 rounded-full font-medium" style={{ background: "#eaf1ee", color: C.forest }}>
                  Mark paid
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
      <div className="space-y-5">
        <Card className="p-5">
          <SectionLabel icon={CreditCard}>By Method</SectionLabel>
          <div className="grid grid-cols-2 gap-3 px-5 pb-5">
            {methodTotals.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No payments logged yet.</p>}
            {methodTotals.map(([m, total]) => (
              <div key={m} className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
                <p className="ecc-display text-2xl" style={{ color: C.ink }}>{formatCurrency(total)}</p>
                <p className="text-xs" style={{ color: C.charcoal }}>{m}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={CreditCard}>Payment Ledger</SectionLabel>
          <div className="space-y-2 px-5 pb-5">
            {state.payments.map((payment) => (
              <button key={payment.id} onClick={() => setReceipt(payment)} className="w-full text-left flex items-center justify-between rounded-xl p-3" style={{ background: C.bg }}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: payment.amount < 0 ? C.red : C.ink }}>{formatCurrency(payment.amount)}</p>
                    {payment.status === "refunded" && <Pill tone="warn">refunded</Pill>}
                    {payment.amount < 0 && <Pill tone="warn">refund</Pill>}
                  </div>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>{getClientBundle(state, payment.clientId).client?.name} • {payment.method}</p>
                </div>
                <p className="text-xs" style={{ color: C.taupe }}>{payment.paidAt}</p>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <SectionLabel icon={ClipboardList}>Client Balance Snapshot</SectionLabel>
            {selectedBundle.client && <button onClick={() => actions.selectClient(null)} className="text-xs underline" style={{ color: C.charcoal }}>Clear</button>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4 px-5">
            <SummaryChip label="Client" value={selectedBundle.client?.name || "—"} onClick={() => setPage && setPage("clients")} />
            <SummaryChip label="Outstanding" value={formatCurrency(selectedBundle.invoices.reduce((sum, entry) => sum + entry.balanceDue, 0))} onClick={() => setPage && setPage("invoices")} />
            <SummaryChip label="Payments logged" value={String(selectedBundle.payments.length)} />
            <SummaryChip label="Booked" value={selectedBundle.booking.isBooked ? "Yes" : "No"} onClick={() => setPage && setPage("projects")} />
          </div>

          {!selectedBundle.client ? (
            <p className="text-sm px-5" style={{ color: C.taupe }}>Select a client to record a payment.</p>
          ) : unpaidInvoices.length === 0 ? (
            <p className="text-sm px-5" style={{ color: C.taupe }}>Nothing outstanding for this client.</p>
          ) : (
            <div className="px-5 pb-2 space-y-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Invoice</p>
                <select value={effectiveInvoiceId} onChange={(event) => setTargetInvoiceId(event.target.value)} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  {unpaidInvoices.map((invoice) => <option key={invoice.id} value={invoice.id}>{invoice.number} — {formatCurrency(invoice.balanceDue)} due</option>)}
                </select>
              </div>
              <div className="flex flex-wrap items-end gap-2">
                <Field compact label="Amount" type="number" value={amount} onChange={setAmount} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Method</p>
                  <select value={method} onChange={(event) => setMethod(event.target.value)} className="px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                    {["Card", "Zelle", "Cash", "Check", "Stripe"].map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <button
                  onClick={() => {
                    const invoice = unpaidInvoices.find((entry) => entry.id === effectiveInvoiceId);
                    if (!invoice) return;
                    actions.recordPayment(invoice.id, Number(amount || invoice.balanceDue), method);
                    setAmount("");
                  }}
                  className="px-4 py-2.5 rounded-full text-sm font-medium text-white"
                  style={{ background: C.forest }}
                >
                  Record payment
                </button>
              </div>
              <p className="text-xs" style={{ color: C.taupe }}>Leave amount blank to apply the full remaining balance.</p>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel icon={Receipt}>Open Invoices</SectionLabel>
          <div className="space-y-2 px-5 pb-5">
            {selectedBundle.invoices.map((invoice) => (
              <button key={invoice.id} onClick={() => actions.recordPayment(invoice.id, invoice.balanceDue, "Manual")} className="w-full flex items-center justify-between p-3 rounded-xl text-left" style={{ border: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{invoice.number}</p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>{invoice.status}</p>
                </div>
                <span className="text-sm" style={{ color: C.forest }}>{invoice.balanceDue > 0 ? `Apply ${formatCurrency(invoice.balanceDue)}` : "Paid"}</span>
              </button>
            ))}
            {selectedBundle.invoices.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No invoices for this client yet.</p>}
          </div>
        </Card>
      </div>

      {receipt && (
        <Modal onClose={() => setReceipt(null)} title="Payment Receipt">
          <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{formatCurrency(receipt.amount)}</p>
          <p className="text-sm mt-2" style={{ color: C.charcoal }}>{getClientBundle(state, receipt.clientId).client?.name}</p>
          <div className="space-y-2 mt-6 text-sm">
            <PriceRow label="Method" value={receipt.method} />
            <PriceRow label="Date" value={receipt.paidAt} />
            <PriceRow label="Invoice" value={state.invoices.find((i) => i.id === receipt.invoiceId)?.number || "—"} />
            {receipt.status === "refunded" && <PriceRow label="Status" value={`Refunded ${receipt.refundedAt || ""}`} />}
            {receipt.note && <PriceRow label="Note" value={receipt.note} />}
          </div>
          <div className="flex flex-wrap gap-2 mt-6 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
            {receipt.amount > 0 && receipt.status !== "refunded" && (
              <button onClick={() => { actions.refundPayment(receipt.id, receipt.amount, "Refund recorded from payment receipt."); setReceipt(null); }} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#f8ece8", color: C.red }}>
                Refund payment
              </button>
            )}
            <button onClick={() => { actions.deletePayment(receipt.id); setReceipt(null); }} className="px-3 py-2 rounded-full text-xs font-medium" style={{ border: `1px solid ${C.line}`, color: C.red }}>
              Delete payment
            </button>
            <p className="text-xs w-full" style={{ color: C.taupe }}>Refunding or deleting rebalances the invoice. If payment was the booking gate, the project unlock is removed.</p>
          </div>
        </Modal>
      )}
      {emailModal}
      </div>
    </div>
  );
}

function SessionsPage({ state, selectedBundle, actions, setPage }) {
  const session = selectedBundle.session;
  const { requestSend, modal: emailModal } = useEmailGate(actions, selectedBundle.client?.id);
  const openDates = (state.availability || []).filter((entry) => entry.times.length > 0);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
      <Card className="p-4">
        <SectionLabel icon={CalendarDays}>Session Pipeline</SectionLabel>
        <div className="space-y-2">
          {state.sessions.map((entry) => {
            const bundle = getClientBundle(state, entry.clientId);
            return (
              <button key={entry.id} onClick={() => actions.selectClient(entry.clientId)} className="w-full p-3 rounded-xl text-left" style={{ background: entry.clientId === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{bundle.client?.name}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{entry.status}</p>
              </button>
            );
          })}
        </div>
      </Card>
      {!session ? (
        <EmptyState title="No session record" body="A session record appears as the lead becomes a real project." />
      ) : (
        <Card className="p-5">
          <RecordTrail selectedBundle={selectedBundle} current="sessions" setPage={setPage} />
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="ecc-display text-4xl" style={{ color: C.ink }}>{selectedBundle.client?.sessionType}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name}</p>
            </div>
            <Pill tone={session.status === "scheduled" || session.status === "completed" ? "done" : "info"}>{session.status}</Pill>
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => setPage("calendar")} className="text-xs underline" style={{ color: C.forest }}>View on calendar</button>
            <span style={{ color: C.line }}>·</span>
            <button onClick={() => setPage("projects")} className="text-xs underline" style={{ color: C.forest }}>Open project workspace</button>
            <span style={{ color: C.line }}>·</span>
            <button onClick={() => setPage("quotes")} className="text-xs underline" style={{ color: C.forest }}>View related quote</button>
            <span style={{ color: C.line }}>·</span>
            <button onClick={() => setPage("contracts")} className="text-xs underline" style={{ color: C.forest }}>View related contract</button>
            <span style={{ color: C.line }}>·</span>
            <button onClick={() => setPage("invoices")} className="text-xs underline" style={{ color: C.forest }}>View related invoice</button>
            <span style={{ color: C.line }}>·</span>
            <button onClick={() => setPage("portal")} className="text-xs underline" style={{ color: C.forest }}>View client portal</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <SummaryChip label="Date" value={session.sessionDate || "Not set"} />
            <SummaryChip label="Time" value={session.sessionTime || "Not set"} />
            <SummaryChip label="Availability Email" value={selectedBundle.projectStatus.availabilitySent ? "Sent" : "Pending"} />
            <SummaryChip label="ICS Invite" value={selectedBundle.projectStatus.calendarInviteSent ? "Sent" : "Pending"} />
          </div>

          <div className="rounded-3xl p-4 mb-5" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Edit session date, time, and location</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <input type="date" value={toInputDate(session.sessionDate)} onChange={(event) => actions.patchSession(session.id, { sessionDate: fromInputDate(event.target.value), status: "scheduled", prepStatus: "scheduled" })} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
              <input type="time" value={toInputTime(session.sessionTime)} onChange={(event) => actions.patchSession(session.id, { sessionTime: fromInputTime(event.target.value), status: "scheduled", prepStatus: "scheduled" })} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
              <select value={session.locationId || "custom"} onChange={(event) => actions.patchSession(session.id, { locationId: event.target.value, locationName: state.locations.find((location) => location.id === event.target.value)?.name })} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                <option value="custom">Custom location</option>
                {state.locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}
              </select>
              <Field compact value={selectedBundle.portal?.customLocation || selectedBundle.client?.city || ""} onChange={(value) => actions.patchSession(session.id, { locationName: value })} />
            </div>
            {(selectedBundle.portal?.customLocation || selectedBundle.client?.city) && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedBundle.portal?.customLocation || selectedBundle.client?.city)}`} target="_blank" rel="noreferrer" className="inline-block text-xs underline mt-3" style={{ color: C.forest }}>Open in Maps</a>}
          </div>
          {session.status === "awaiting_schedule" && (
            <div className="mb-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => { const d = buildEmailDraft("availability", selectedBundle); requestSend(d.subject, d.body, () => actions.sendAvailability(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
                  Send date selection email
                </button>
              </div>
              <p className="text-xs mb-2" style={{ color: C.taupe }}>Or pick directly from open availability:</p>
              {openDates.length === 0 ? (
                <p className="text-sm" style={{ color: C.taupe }}>No availability set yet — add some in Calendar → Edit Availability.</p>
              ) : (
                <div className="space-y-3">
                  {openDates.map((entry) => (
                    <div key={entry.date}>
                      <p className="text-xs font-medium mb-1.5" style={{ color: C.ink }}>{entry.date}</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {entry.times.map((time) => (
                          <button key={time} onClick={() => actions.scheduleSession(selectedBundle.client.id, { date: entry.date, time })} className="p-3 rounded-xl text-left" style={{ border: `1px solid ${C.line}` }}>
                            <p className="text-sm font-medium" style={{ color: C.ink }}>{time}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {session.sessionDate && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => { const d = buildEmailDraft("calendar", selectedBundle); requestSend(d.subject, d.body, () => actions.sendCalendarInvite(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>
                Send ICS invite
              </button>
            </div>
          )}
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Internal Notes</p>
          <textarea rows={4} value={session.notes || ""} onChange={(event) => actions.patchSession(session.id, { notes: event.target.value })} className="w-full rounded-2xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          <button onClick={() => actions.completeSession(session.id)} className="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.charcoal }}>
            Mark session complete
          </button>
        </Card>
      )}
      {emailModal}
    </div>
  );
}

function PortalPage({ selectedBundle, actions, setApp, setPage }) {
  const portal = selectedBundle.portal;
  if (!selectedBundle.client || !portal) {
    return <EmptyState title="No portal selected" body="Pick a client with a portal profile to edit." />;
  }

  if (!selectedBundle.projectStatus.projectCreated) {
    return <EmptyState title="Portal locked" body="The portal editor stays unavailable until the client is truly booked: quote accepted, contract signed, and payment received." />;
  }

  const update = (patch) => actions.updatePortal(selectedBundle.client.id, patch);
  const addProp = () => update({ propList: [...(portal.propList || []), ""] });
  const removeProp = (index) => update({ propList: portal.propList.filter((_, itemIndex) => itemIndex !== index) });
  const planSteps = portal.planPrepSteps || [];
  const addPlanStep = () => update({ planPrepSteps: [...planSteps, { id: `step_${Date.now()}`, title: "New prep step", body: "Write what the client needs to know.", status: "pending" }] });
  const patchPlanStep = (id, patch) => update({ planPrepSteps: planSteps.map((step) => step.id === id ? { ...step, ...patch } : step) });
  const removePlanStep = (id) => update({ planPrepSteps: planSteps.filter((step) => step.id !== id) });

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <p className="ecc-display text-3xl" style={{ color: C.ink }}>Client Portal Editor</p>
            <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.name}</p>
          </div>
          <button onClick={() => setApp("client")} className="text-sm underline" style={{ color: C.forest }}>Preview client view</button>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          <button onClick={() => setPage("projects")} className="text-xs underline" style={{ color: C.forest }}>← Back to project workspace</button>
          <span style={{ color: C.line }}>·</span>
          <button onClick={() => setPage("sessions")} className="text-xs underline" style={{ color: C.forest }}>Session record</button>
        </div>

        <div className="flex gap-4 mb-3 text-sm">
          <label className="flex items-center gap-2" style={{ color: C.ink }}>
            <input type="radio" checked={portal.useProjectDetails} onChange={() => update({ useProjectDetails: true })} /> Use project details
          </label>
          <label className="flex items-center gap-2" style={{ color: C.ink }}>
            <input type="radio" checked={!portal.useProjectDetails} onChange={() => update({ useProjectDetails: false })} /> Custom override
          </label>
        </div>
        {portal.useProjectDetails ? (
          <p className="text-sm px-3 py-2.5 rounded-xl" style={{ background: C.bg, color: C.ink }}>
            {selectedBundle.session?.sessionDate || "Awaiting date"} · {selectedBundle.session?.sessionTime || "—"} ·{" "}
            {selectedBundle.client.city} <span style={{ color: C.taupe }}>— pulled from the session record</span>
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Custom date" value={portal.customDate || ""} onChange={(value) => update({ customDate: value })} />
            <Field label="Custom time" value={portal.customTime || ""} onChange={(value) => update({ customTime: value })} />
            <Field label="Custom location" value={portal.customLocation || ""} onChange={(value) => update({ customLocation: value })} />
          </div>
        )}
      </Card>

      <Card className="p-5">
        <SectionLabel icon={Sparkles}>Session Vision &amp; Notes</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-5 pb-5 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Session vision</p>
            <textarea rows={4} value={portal.sessionVision || ""} onChange={(event) => update({ sessionVision: event.target.value })} className="w-full rounded-2xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Session notes</p>
            <textarea rows={4} value={portal.sessionNotes || ""} onChange={(event) => update({ sessionNotes: event.target.value })} className="w-full rounded-2xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          </div>
        </div>
        <div className="px-5 pb-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Prop list</p>
            <button onClick={addProp} className="text-xs font-medium flex items-center gap-1" style={{ color: C.forest }}><Plus size={12} /> Add prop</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-2">
            {(portal.propList || []).map((prop, index) => (
              <div key={index} className="flex items-center gap-2">
                <Field compact value={prop} onChange={(value) => update({ propList: portal.propList.map((item, itemIndex) => (itemIndex === index ? value : item)) })} />
                <button onClick={() => removeProp(index)}><X size={14} color={C.taupe} /></button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <SectionLabel icon={CheckCircle2}>Editable Plan &amp; Prep Page</SectionLabel>
        <p className="text-sm px-5 pb-4" style={{ color: C.charcoal }}>This controls what the client sees under Plan & Prep. Use it for milestone packages, awaiting date selection, prep notes, and delivery steps.</p>
        <div className="px-5 pb-5 space-y-3">
          {planSteps.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No plan steps yet.</p>}
          {planSteps.map((step) => (
            <div key={step.id} className="rounded-2xl p-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
              <div className="grid grid-cols-1 md:grid-cols-[1fr_150px_auto] gap-2 mb-2">
                <Field compact value={step.title || ""} onChange={(value) => patchPlanStep(step.id, { title: value })} />
                <select value={step.status || "pending"} onChange={(event) => patchPlanStep(step.id, { status: event.target.value })} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  <option value="complete">Complete</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
                <button onClick={() => removePlanStep(step.id)} className="text-xs" style={{ color: C.red }}>Remove</button>
              </div>
              <textarea rows={2} value={step.body || ""} onChange={(event) => patchPlanStep(step.id, { body: event.target.value })} className="w-full rounded-xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
            </div>
          ))}
          <button onClick={addPlanStep} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>+ Add Plan & Prep step</button>
        </div>
      </Card>

      <ImageManager
        title="Vision Board Images"
        description="Drives the slideshow + Pinterest-style grid the client sees on Vision Board."
        images={portal.visionImages || []}
        onChange={(images) => update({ visionImages: images })}
      />

      <Card className="p-5">
        <SectionLabel icon={ImageIcon}>Gallery Link</SectionLabel>
        <p className="text-sm px-5" style={{ color: C.charcoal }}>
          Not an image upload — this is the Pixieset (or any) gallery link, shown to the client as a link-preview card once delivered.
        </p>
        <div className="px-5 pt-4 space-y-3">
          <Field label="Gallery title" value={portal.galleryLink?.title || ""} onChange={(value) => update({ galleryLink: { ...portal.galleryLink, title: value } })} />
          <Field label="Gallery URL (Pixieset link)" value={portal.galleryLink?.url || ""} onChange={(value) => update({ galleryLink: { ...portal.galleryLink, url: value } })} />
          <Field label="Print Store Link (Pixieset store)" value={portal.printStoreLink || ""} onChange={(value) => update({ printStoreLink: value })} />
        </div>
        <div className="px-5 pt-2">
          <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Preview image (optional)</p>
          {portal.galleryLink?.previewImage && (
            <div className="relative w-32 aspect-square rounded-xl overflow-hidden mb-2" style={{ background: C.bg }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={portal.galleryLink.previewImage} alt="" className="w-full h-full object-cover" />
              <button onClick={() => update({ galleryLink: { ...portal.galleryLink, previewImage: "" } })} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                <X size={12} color="#fff" />
              </button>
            </div>
          )}
          <GalleryPreviewImagePicker onPick={(url) => update({ galleryLink: { ...portal.galleryLink, previewImage: url } })} />
        </div>

        {portal.galleryLink?.url && (
          <div className="px-5 pt-4">
            <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Preview — this is what the client will see</p>
            <GalleryLinkCard galleryLink={portal.galleryLink} />
          </div>
        )}
        {portal.printStoreLink && (
          <div className="px-5 pt-4">
            <a href={portal.printStoreLink} target="_blank" rel="noreferrer" className="block rounded-2xl p-4" style={{ background: C.cream, color: C.ink, border: `1px solid ${C.line}` }}>
              <p className="text-sm font-medium">Print Your Album</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>Order prints and shop the Pixieset store link.</p>
            </a>
          </div>
        )}

        <div className="px-5 pt-4 pb-1">
          <button
            disabled={selectedBundle.session?.status !== "completed" || selectedBundle.session?.galleryStatus === "delivered"}
            onClick={() => actions.deliverGallery(selectedBundle.client.id)}
            className="px-3 py-2 rounded-full text-xs font-medium text-white disabled:opacity-40"
            style={{ background: C.forest }}
          >
            {selectedBundle.session?.galleryStatus === "delivered" ? "Gallery delivered" : "Deliver gallery to client"}
          </button>
        </div>
        <div className="h-4" />
      </Card>
    </div>
  );
}

function GalleryPreviewImagePicker({ onPick }) {
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef(null);
  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onPick(reader.result);
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  return (
    <div className="flex gap-2">
      <input value={urlDraft} onChange={(event) => setUrlDraft(event.target.value)} placeholder="Paste a preview image URL..." className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
      <button onClick={() => { if (urlDraft.trim()) { onPick(urlDraft.trim()); setUrlDraft(""); } }} className="px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>Add</button>
      <button onClick={() => fileInputRef.current?.click()} className="px-3 py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }}>Upload</button>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
    </div>
  );
}

function GalleryLinkCard({ galleryLink }) {
  return (
    <LinkPreviewCard
      link={galleryLink}
      fallbackTitle="Pixieset Gallery"
      helperText="Preview image not found yet. The link still opens normally."
    />
  );
}


function ImageManager({ title, description, images, onChange, footer }) {
  const [urlDraft, setUrlDraft] = useState("");
  const fileInputRef = useRef(null);

  const addUrl = () => {
    if (!urlDraft.trim()) return;
    onChange([...images, { id: `img_${Date.now()}`, url: urlDraft.trim() }]);
    setUrlDraft("");
  };

  const handleUpload = (event) => {
    const files = Array.from(event.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => onChange([...images, { id: `img_${Date.now()}_${Math.random()}`, url: reader.result }]);
      reader.readAsDataURL(file);
    });
    event.target.value = "";
  };

  const removeImage = (id) => onChange(images.filter((img) => img.id !== id));

  return (
    <Card className="p-5">
      <SectionLabel icon={ImageIcon}>{title}</SectionLabel>
      <p className="text-sm px-5" style={{ color: C.charcoal }}>{description}</p>

      <div className="px-5 pt-4">
        {images.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
            {images.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden" style={{ background: C.bg }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" onError={(event) => { event.currentTarget.style.opacity = 0.15; }} />
                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <X size={12} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex gap-2 sm:col-span-2">
            <input
              value={urlDraft}
              onChange={(event) => setUrlDraft(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && addUrl()}
              placeholder="Paste an image URL..."
              className="flex-1 px-3 py-2 rounded-xl text-sm"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            />
            <button onClick={addUrl} className="px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>Add</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <ChevronsRight size={14} style={{ transform: "rotate(-90deg)" }} /> Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </div>
        </div>
        <button disabled className="mt-2 w-full px-3 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5" style={{ border: `1px dashed ${C.line}`, color: C.taupe }}>
          Import from Google Drive — connect in Settings, not wired in this build
        </button>
        {footer}
      </div>
      <div className="h-4" />
    </Card>
  );
}

function BrandingPage({ state, actions }) {
  const settings = state.studioSettings || {};
  const heroImages = settings.heroImageUrl ? [{ id: "hero", url: settings.heroImageUrl }] : [];
  const swatches = [
    { name: "Charcoal", value: C.charcoal }, { name: "Ink", value: C.ink }, { name: "Cream", value: C.cream },
    { name: "Taupe", value: C.taupe }, { name: "Blue", value: C.blue }, { name: "Forest", value: C.forest },
  ];

  return (
    <div className="space-y-5">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Branding</p>
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Dashboard Headline</p>
        <input
          value={settings.heroHeadline || ""}
          onChange={(event) => actions.updateStudioSettings({ heroHeadline: event.target.value })}
          className="w-full px-3 py-2.5 rounded-xl text-sm"
          style={{ border: `1px solid ${C.line}`, color: C.ink }}
        />
      </Card>

      <ImageManager
        title="Dashboard Hero Photo"
        description="Shows on the Studio Admin dashboard. Paste a URL or upload from your device — the most recent image you add becomes the hero."
        images={heroImages}
        onChange={(images) => actions.updateStudioSettings({ heroImageUrl: images.length ? images[images.length - 1].url : "" })}
      />

      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Color System</p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {swatches.map((swatch) => (
            <div key={swatch.name} className="text-center">
              <div className="w-full aspect-square rounded-xl mb-1.5" style={{ background: swatch.value, border: `1px solid ${C.line}` }} />
              <p className="text-xs" style={{ color: C.charcoal }}>{swatch.name}</p>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: C.taupe }}>Cormorant Garamond (display) + Jost (body). This is the real system the whole app already runs on, not a preview.</p>
      </Card>
    </div>
  );
}

function ClientMessagesPage({ state, selectedBundle, actions, setPage }) {
  const [draft, setDraft] = useState("");
  const conversations = state.clients
    .map((client) => {
      const messages = (state.messages || []).filter((message) => message.clientId === client.id);
      const latest = messages[0];
      const unread = messages.filter((message) => message.from === "client" && !message.readAt).length;
      return { client, messages, latest, unread };
    })
    .filter((row) => row.messages.length > 0 || row.client.id === state.selectedClientId)
    .sort((a, b) => String(b.latest?.createdAt || "").localeCompare(String(a.latest?.createdAt || "")));

  const thread = selectedBundle.client ? (state.messages || []).filter((message) => message.clientId === selectedBundle.client.id) : [];
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
      <Card className="p-4">
        <SectionLabel icon={MessageCircle}>Client Messages</SectionLabel>
        <div className="space-y-2">
          {conversations.length === 0 && <p className="text-sm px-5 pb-5" style={{ color: C.taupe }}>No client conversations yet.</p>}
          {conversations.map(({ client, latest, unread, messages }) => (
            <button key={client.id} onClick={() => actions.selectClient(client.id)} className="w-full p-3 rounded-2xl text-left" style={{ background: client.id === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: unread ? C.forest : C.line }} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{client.name}</p>
                  <p className="text-xs truncate mt-0.5" style={{ color: C.charcoal }}>{latest?.text || "No messages yet."}</p>
                </div>
                <Pill tone={unread ? "done" : "neutral"}>{unread || messages.length}</Pill>
              </div>
              <p className="text-[11px] mt-2" style={{ color: C.taupe }}>{latest?.createdAt || "New thread"}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        {!selectedBundle.client ? (
          <EmptyState title="Select a conversation" body="Pick a client thread to read and reply." />
        ) : (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>{selectedBundle.client.name}</p>
                <p className="text-sm" style={{ color: C.charcoal }}>{selectedBundle.client.sessionType}</p>
              </div>
              <button onClick={() => setPage("clients")} className="text-xs underline" style={{ color: C.forest }}>Open client record</button>
            </div>
            <div className="space-y-3 mb-4 max-h-[520px] overflow-y-auto ecc-scrollbar pr-1">
              {thread.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No messages in this thread yet.</p>}
              {thread.slice().reverse().map((message) => (
                <div key={message.id} className="max-w-[82%] rounded-2xl px-4 py-3" style={{ marginLeft: message.from === "studio" ? "auto" : 0, background: message.from === "studio" ? C.forest : C.bg, color: message.from === "studio" ? "#fff" : C.ink }}>
                  <p className="text-sm leading-6">{message.text}</p>
                  <p className="text-[11px] mt-2" style={{ color: message.from === "studio" ? "rgba(255,255,255,0.75)" : C.taupe }}>{message.createdAt}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && draft.trim()) { actions.sendMessage(selectedBundle.client.id, draft, "studio"); setDraft(""); } }} placeholder="Reply to client..." className="flex-1 px-4 py-3 rounded-full text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
              <button onClick={() => { actions.sendMessage(selectedBundle.client.id, draft, "studio"); setDraft(""); }} className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: C.forest }}><Send size={16} /></button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}


function ActivityPage({ state, selectedBundle, actions, setPage }) {
  const [filter, setFilter] = useState("all");
  const safeClients = Array.isArray(state.clients) ? state.clients : [];
  const safeActivity = Array.isArray(state.activity) ? state.activity : [];
  const safeMessages = Array.isArray(state.messages) ? state.messages : [];
  const safeEmailLogs = Array.isArray(state.emailLogs) ? state.emailLogs : [];
  const safeInvoices = Array.isArray(state.invoices) ? state.invoices : [];
  const safeContracts = Array.isArray(state.contracts) ? state.contracts : [];
  const safeQuotes = Array.isArray(state.quotes) ? state.quotes : [];
  const selectedClientId = selectedBundle?.client?.id || state.selectedClientId;

  const clientById = useMemo(() => {
    return Object.fromEntries(safeClients.map((client) => [client.id, client]));
  }, [safeClients]);

  const findClientName = (clientId) => clientById[clientId]?.name || "System";

  const activityRows = safeActivity.map((entry) => ({
    id: entry.id,
    kind: "Activity",
    tone: "neutral",
    icon: Bell,
    clientId: entry.clientId,
    title: findClientName(entry.clientId),
    body: entry.text || "Activity recorded.",
    timestamp: entry.createdAt || "No timestamp",
    page: entry.clientId ? "clients" : "activity",
  }));

  const messageRows = safeMessages.map((message) => ({
    id: message.id,
    kind: message.from === "client" ? "Client message" : "Studio message",
    tone: message.from === "client" && !message.readAt ? "done" : "info",
    icon: MessageCircle,
    clientId: message.clientId,
    title: findClientName(message.clientId),
    body: message.text || "Message logged.",
    timestamp: message.createdAt || "No timestamp",
    page: "clientMessages",
  }));

  const emailRows = safeEmailLogs.map((email) => ({
    id: email.id,
    kind: "Email",
    tone: "info",
    icon: Mail,
    clientId: email.clientId,
    title: findClientName(email.clientId),
    body: email.subject || `${email.kind || "Email"} sent`,
    timestamp: email.sentAt || email.createdAt || "No timestamp",
    page: "emails",
  }));

  const notificationRows = [
    ...safeMessages
      .filter((message) => message.from === "client" && !message.readAt)
      .map((message) => ({
        id: `notif-message-${message.id}`,
        kind: "Unread message",
        tone: "done",
        icon: MessageCircle,
        clientId: message.clientId,
        title: findClientName(message.clientId),
        body: message.text || "Client sent a message.",
        timestamp: message.createdAt || "No timestamp",
        page: "clientMessages",
      })),
    ...safeInvoices
      .filter((invoice) => ["sent", "partially_paid"].includes(invoice.status) && Number(invoice.balanceDue || 0) > 0)
      .map((invoice) => ({
        id: `notif-invoice-${invoice.id}`,
        kind: "Open invoice",
        tone: "warn",
        icon: Receipt,
        clientId: invoice.clientId,
        title: findClientName(invoice.clientId),
        body: `${invoice.number || "Invoice"} has ${formatCurrency(invoice.balanceDue || 0)} due${invoice.dueDate ? ` · due ${invoice.dueDate}` : ""}.`,
        timestamp: invoice.sentAt || invoice.createdAt || "No timestamp",
        page: "invoices",
      })),
    ...safeContracts
      .filter((contract) => contract.status === "sent")
      .map((contract) => ({
        id: `notif-contract-${contract.id}`,
        kind: "Contract pending",
        tone: "info",
        icon: FileSignature,
        clientId: contract.clientId,
        title: findClientName(contract.clientId),
        body: `${contract.number || "Contract"} is waiting for signature.`,
        timestamp: contract.sentAt || contract.createdAt || "No timestamp",
        page: "contracts",
      })),
    ...safeQuotes
      .filter((quote) => quote.status === "sent" || quote.status === "viewed")
      .map((quote) => ({
        id: `notif-quote-${quote.id}`,
        kind: quote.status === "viewed" ? "Quote viewed" : "Quote sent",
        tone: quote.status === "viewed" ? "done" : "info",
        icon: FileText,
        clientId: quote.clientId,
        title: findClientName(quote.clientId),
        body: `${quote.number || "Quote"} · ${formatCurrency(quote.total || 0)} · ${quote.status}.`,
        timestamp: quote.viewedAt || quote.sentAt || quote.createdAt || "No timestamp",
        page: "quotes",
      })),
  ];

  const allRows = [...notificationRows, ...messageRows, ...emailRows, ...activityRows];
  const rows = allRows.filter((row) => {
    if (filter === "client") return Boolean(selectedClientId) && row.clientId === selectedClientId;
    if (filter === "messages") return row.page === "clientMessages" || row.kind.toLowerCase().includes("message");
    if (filter === "notifications") return row.id.startsWith("notif-");
    return true;
  });

  const openRow = (row) => {
    if (row.clientId) actions.selectClient(row.clientId);
    setPage(row.page || "clients");
  };

  const unreadCount = safeMessages.filter((message) => message.from === "client" && !message.readAt).length;
  const openInvoiceCount = safeInvoices.filter((invoice) => ["sent", "partially_paid"].includes(invoice.status) && Number(invoice.balanceDue || 0) > 0).length;
  const pendingContractCount = safeContracts.filter((contract) => contract.status === "sent").length;

  const filters = [
    { key: "all", label: "All Activity", count: allRows.length },
    { key: "client", label: selectedBundle?.client ? `${selectedBundle.client.name}` : "Client Activity", count: selectedClientId ? allRows.filter((row) => row.clientId === selectedClientId).length : 0 },
    { key: "messages", label: "Messages", count: messageRows.length },
    { key: "notifications", label: "Notifications", count: notificationRows.length },
  ];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Unread messages</p>
          <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{unreadCount}</p>
          <button onClick={() => setFilter("messages")} className="text-xs underline mt-2" style={{ color: C.forest }}>View message activity</button>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Open invoices</p>
          <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{openInvoiceCount}</p>
          <button onClick={() => setPage("invoices")} className="text-xs underline mt-2" style={{ color: C.forest }}>Go to invoices</button>
        </Card>
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Pending contracts</p>
          <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{pendingContractCount}</p>
          <button onClick={() => setPage("contracts")} className="text-xs underline mt-2" style={{ color: C.forest }}>Go to contracts</button>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-5 pt-5 pb-2">
          <div>
            <SectionLabel icon={Bell}>Activity & Notifications</SectionLabel>
            <p className="text-sm px-5" style={{ color: C.charcoal }}>One safe feed for CRM events, messages, emails, and items that need attention.</p>
          </div>
          <div className="flex flex-wrap gap-2 px-5 md:px-0">
            {filters.map((item) => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className="px-3 py-2 rounded-full text-xs font-medium"
                style={{ background: filter === item.key ? C.forest : C.bg, color: filter === item.key ? "#fff" : C.ink, border: `1px solid ${filter === item.key ? C.forest : C.line}` }}
              >
                {item.label} <span style={{ opacity: 0.7 }}>({item.count})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-5 pb-5 mt-2">
          {rows.length === 0 ? (
            <EmptyState title="No activity here" body="This filter is empty right now. Switch to All Activity or select another client." />
          ) : (
            <div className="divide-y" style={{ borderColor: C.line }}>
              {rows.map((row) => {
                const Icon = row.icon || Bell;
                return (
                  <button key={row.id} onClick={() => openRow(row)} className="w-full text-left py-4 flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: C.bg }}>
                      <Icon size={16} color={C.forest} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: C.ink }}>{row.title}</p>
                        <Pill tone={row.tone}>{row.kind}</Pill>
                      </div>
                      <p className="text-sm mt-1" style={{ color: C.charcoal }}>{row.body}</p>
                      <p className="text-xs mt-1" style={{ color: C.taupe }}>{row.timestamp}</p>
                    </div>
                    <ChevronRight size={15} color={C.taupe} />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function EmailsPage({ selectedBundle, actions, setPage }) {
  const { requestSend, modal: emailModal } = useEmailGate(actions, selectedBundle.client?.id);

  if (!selectedBundle.client) {
    return <EmptyState title="No client selected" body="Choose a client to view milestone emails." />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
      <Card className="p-5">
        <SectionLabel icon={Mail}>Milestone Emails</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-4">
          <button disabled={!selectedBundle.projectStatus.projectCreated} onClick={() => { const d = buildEmailDraft("portal", selectedBundle); requestSend(d.subject, d.body, () => actions.sendPortalAccess(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.forest, color: "#fff" }}>
            Portal access
          </button>
          <button disabled={!selectedBundle.projectStatus.projectCreated} onClick={() => { const d = buildEmailDraft("availability", selectedBundle); requestSend(d.subject, d.body, () => actions.sendAvailability(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.cream, color: C.ink }}>
            Date selection
          </button>
          <button disabled={!selectedBundle.session?.sessionDate} onClick={() => { const d = buildEmailDraft("calendar", selectedBundle); requestSend(d.subject, d.body, () => actions.sendCalendarInvite(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#edf2f5", color: C.blue }}>
            Calendar invite
          </button>
          <button disabled={selectedBundle.booking.isBooked} onClick={() => { const d = buildEmailDraft("reminder", selectedBundle); requestSend(d.subject, d.body, () => actions.sendBookingReminder(selectedBundle.client.id)); }} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#f8ece8", color: C.red }}>
            Not-booked reminder
          </button>
        </div>
        <p className="text-sm mb-3" style={{ color: C.charcoal }}>
          These actions make the handoff visible inside admin instead of relying on implied status changes.
        </p>
        <button onClick={() => setPage("projects")} className="text-xs underline" style={{ color: C.forest }}>View this client's project workspace →</button>
      </Card>

      <div className="space-y-5">
        <Card className="p-5">
          <SectionLabel icon={Bell}>Email Log</SectionLabel>
          <div className="space-y-3">
            {selectedBundle.emailLogs.length === 0 && <p className="text-sm" style={{ color: C.charcoal }}>No emails logged yet.</p>}
            {selectedBundle.emailLogs.map((entry) => (
              <div key={entry.id} className="rounded-xl p-3" style={{ background: C.bg }}>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.subject}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{entry.kind}</p>
                <p className="text-xs mt-1" style={{ color: C.taupe }}>{entry.sentAt}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={CalendarDays}>Scheduled Sends</SectionLabel>
          <div className="space-y-3">
            {(selectedBundle.scheduledEmails || []).length === 0 ? (
              <p className="text-sm" style={{ color: C.charcoal }}>Nothing scheduled for this client.</p>
            ) : (
              selectedBundle.scheduledEmails.map((entry) => (
                <div key={entry.id} className="rounded-xl p-3" style={{ background: C.bg }}>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.subject}</p>
                  <p className="text-xs mt-1" style={{ color: C.taupe }}>Scheduled for {entry.sendAt}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => actions.sendScheduledEmailNow(entry.id)} className="text-xs px-2.5 py-1 rounded-full font-medium text-white" style={{ background: C.forest }}>Send now</button>
                    <button onClick={() => actions.cancelScheduledEmail(entry.id)} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ color: C.red }}>Cancel</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      {emailModal}
    </div>
  );
}

function PlaceholderPage({ title, body }) {
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>{title}</p>
      <EmptyState title="Nothing here yet" body={body} />
    </div>
  );
}

const TIME_PRESETS = ["9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "4:30 PM", "5:00 PM"];

function CalendarPage({ state, selectedBundle, actions, setPage }) {
  const TODAY_DAY = 22;
  const [selected, setSelected] = useState(TODAY_DAY);
  const [view, setView] = useState("today");
  const [editingAvailability, setEditingAvailability] = useState(false);
  const [customTime, setCustomTime] = useState("");
  const days = Array.from({ length: 30 }, (_, index) => index + 1);
  const dateLabel = (day) => `Jul ${day}, 2026`;
  const extractDay = (value = "") => {
    const july = String(value).match(/Jul\s+(\d{1,2})/i);
    if (july) return Number(july[1]);
    const iso = String(value).match(/2026-07-(\d{2})/);
    if (iso) return Number(iso[1]);
    const match = String(value).match(/\b(\d{1,2})\b/);
    return match ? Number(match[1]) : null;
  };
  const timeSort = (value = "") => {
    const match = String(value).match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (!match) return 9999;
    let hour = Number(match[1]);
    const minute = Number(match[2] || 0);
    const meridian = (match[3] || "").toUpperCase();
    if (meridian === "PM" && hour !== 12) hour += 12;
    if (meridian === "AM" && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  const eventsByDay = useMemo(() => {
    const map = {};
    state.sessions
      .filter((session) => session.sessionDate)
      .forEach((session) => {
        const day = extractDay(session.sessionDate);
        if (!day) return;
        const bundle = getClientBundle(state, session.clientId);
        map[day] = map[day] || [];
        map[day].push({
          title: `${bundle.client?.sessionType || "Session"} — ${bundle.client?.name || "Client"}`,
          time: session.sessionTime || "Time TBD",
          clientId: session.clientId,
          status: session.status,
          location: session.location || bundle.client?.city || "Location TBD",
        });
      });
    Object.keys(map).forEach((day) => map[day].sort((a, b) => timeSort(a.time) - timeSort(b.time)));
    return map;
  }, [state]);

  const upcoming = useMemo(() => {
    return state.sessions
      .filter((session) => session.sessionDate)
      .map((session) => ({ session, bundle: getClientBundle(state, session.clientId) }))
      .sort((a, b) => String(a.session.sessionDate).localeCompare(String(b.session.sessionDate)) || timeSort(a.session.sessionTime) - timeSort(b.session.sessionTime));
  }, [state]);

  const slotsForDay = (day) => (state.availability.find((entry) => entry.date === dateLabel(day))?.times || []).slice().sort((a, b) => timeSort(a) - timeSort(b));
  const dayEvents = eventsByDay[selected] || [];
  const openSlots = slotsForDay(selected);
  const weekStart = Math.max(1, Math.min(24, selected - ((selected - 1) % 7)));
  const weekDays = Array.from({ length: 7 }, (_, index) => weekStart + index).filter((day) => day >= 1 && day <= 30);

  const addCustomSlot = () => {
    if (!customTime.trim()) return;
    actions.addAvailabilitySlot(dateLabel(selected), customTime.trim());
    setCustomTime("");
  };

  const goToday = () => {
    setSelected(TODAY_DAY);
    setView("today");
  };

  const DayAgenda = ({ day, compact = false }) => {
    const events = eventsByDay[day] || [];
    const slots = slotsForDay(day);
    const combined = [
      ...events.map((event) => ({ ...event, kind: "booked", sort: timeSort(event.time) })),
      ...slots.map((time) => ({ kind: "open", time, title: "Open slot", sort: timeSort(time) })),
    ].sort((a, b) => a.sort - b.sort);
    if (combined.length === 0) return <p className="text-xs" style={{ color: C.taupe }}>No events or open slots.</p>;
    return (
      <div className="space-y-2">
        {combined.map((item, index) => (
          item.kind === "booked" ? (
            <button key={`${item.kind}-${index}`} onClick={() => { actions.selectClient(item.clientId); setPage("sessions"); }} className="w-full text-left rounded-2xl px-3 py-2 flex gap-3" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <div className="w-14 shrink-0 text-xs font-medium" style={{ color: C.forest }}>{item.time}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate" style={{ color: C.ink }}>{item.title}</p>
                {!compact && <p className="text-xs mt-0.5 truncate" style={{ color: C.taupe }}>{item.location}</p>}
              </div>
            </button>
          ) : (
            <div key={`${item.kind}-${index}`} className="rounded-2xl px-3 py-2 flex gap-3" style={{ background: C.bg, border: `1px dashed ${C.line}` }}>
              <div className="w-14 shrink-0 text-xs font-medium" style={{ color: C.taupe }}>{item.time}</div>
              <p className="text-sm" style={{ color: C.charcoal }}>Open slot</p>
            </div>
          )
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 flex flex-wrap items-center gap-2">
        <button onClick={goToday} className="px-3 py-1.5 rounded-full text-xs font-medium" style={{ background: view === "today" ? C.forest : C.cream, color: view === "today" ? "#fff" : C.forest }}>Today</button>
        {["week", "month", "list"].map((key) => (
          <button key={key} onClick={() => setView(key)} className="px-3 py-1.5 rounded-full text-xs font-medium capitalize" style={{ background: view === key ? C.charcoal : C.bg, color: view === key ? "#fff" : C.charcoal }}>
            {key}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={() => setEditingAvailability((value) => !value)} className="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5" style={{ background: editingAvailability ? C.forest : C.cream, color: editingAvailability ? "#fff" : C.ink }}>
          <CalendarDays size={13} /> {editingAvailability ? "Done editing availability" : "Edit Availability"}
        </button>
        <p className="text-[11px]" style={{ color: C.taupe }}>Last edited: {state.availabilityLastEditedAt || "Not yet"}</p>
      </Card>

      {view === "list" ? (
        <Card className="p-5">
          <SectionLabel icon={CalendarDays}>Upcoming Sessions</SectionLabel>
          <div className="px-5 pb-5">
            {upcoming.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>Nothing scheduled yet.</p>}
            {upcoming.map(({ session, bundle }, index) => (
              <button key={session.id} onClick={() => { actions.selectClient(session.clientId); setPage("sessions"); }} className="w-full text-left flex flex-wrap items-center justify-between gap-2 py-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
                <div className="flex items-center gap-3">
                  <Avatar name={bundle.client?.name || "?"} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.ink }}>{bundle.client?.name} — {bundle.client?.sessionType}</p>
                    <p className="text-xs mt-0.5" style={{ color: C.charcoal }}>{session.sessionDate} · {session.sessionTime || "TBD"} · {session.location || bundle.client?.city || "Location TBD"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2"><Pill tone={statusTone(session.status)}>{session.status}</Pill><ChevronRight size={14} color={C.taupe} /></div>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-5">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <button className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: C.cream, color: C.forest }} onClick={goToday}>Today</button>
              <p className="ecc-display text-2xl" style={{ color: C.ink }}>{view === "week" ? `Week of ${dateLabel(weekStart)}` : view === "today" ? dateLabel(TODAY_DAY) : "July 2026"}</p>
              <div className="flex gap-3"><ChevronLeft size={18} color={C.charcoal} /><ChevronRight size={18} color={C.charcoal} /></div>
            </div>

            {view === "today" ? (
              <div className="rounded-3xl p-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Today calendar</p>
                <DayAgenda day={TODAY_DAY} />
              </div>
            ) : view === "week" ? (
              <div className="grid grid-cols-1 md:grid-cols-7 gap-2 mt-2">
                {weekDays.map((day) => {
                  const isSelected = day === selected;
                  return (
                    <div key={day} className="rounded-2xl p-3 min-h-[220px]" style={{ background: isSelected ? C.cream : C.bg, border: `1px solid ${isSelected ? C.forest : C.line}` }}>
                      <button onClick={() => setSelected(day)} className="w-full text-left mb-3">
                        <p className="ecc-display text-xl" style={{ color: C.ink }}>{day}</p>
                        <p className="text-[10px]" style={{ color: C.taupe }}>{(eventsByDay[day] || []).length} booked · {slotsForDay(day).length} open</p>
                      </button>
                      <DayAgenda day={day} compact />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="w-full">
                <div className="grid grid-cols-7 gap-1 text-xs mt-4 mb-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => <div key={index} className="text-center font-medium pb-1" style={{ color: C.taupe }}>{label}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map((day) => {
                    const has = eventsByDay[day];
                    const slots = slotsForDay(day).length;
                    const isSelected = day === selected;
                    return (
                      <button key={day} onClick={() => setSelected(day)} className="min-h-24 rounded-2xl p-2 text-left text-sm relative" style={{ background: isSelected ? C.forest : has ? C.cream : slots > 0 ? "#eef0e3" : "#fff", color: isSelected ? "#fff" : C.ink, border: `1px solid ${C.line}` }}>
                        <p className="font-medium">{day}</p>
                        {has && has.slice(0, 2).map((event, index) => <p key={index} className="text-[10px] mt-1 truncate" style={{ color: isSelected ? C.cream : C.forest }}>{event.time} · {event.title}</p>)}
                        {slots > 0 && <p className="text-[10px] mt-1" style={{ color: isSelected ? C.cream : C.taupe }}>{slots} open slot{slots === 1 ? "" : "s"}</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 lg:self-start">
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>{dateLabel(selected)}</p>
            {editingAvailability ? (
              <>
                <p className="text-xs mb-3" style={{ color: C.charcoal }}>These times become selectable for clients on the date-selection email.</p>
                <div className="space-y-1.5 mb-3">
                  {openSlots.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No availability set for this date.</p>}
                  {openSlots.map((time) => (
                    <div key={time} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: C.bg }}>
                      <span className="text-sm" style={{ color: C.ink }}>{time}</span>
                      <button onClick={() => actions.removeAvailabilitySlot(dateLabel(selected), time)}><X size={14} color={C.red} /></button>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {TIME_PRESETS.filter((time) => !openSlots.includes(time)).map((time) => <button key={time} onClick={() => actions.addAvailabilitySlot(dateLabel(selected), time)} className="text-xs px-2.5 py-1.5 rounded-full" style={{ border: `1px solid ${C.line}`, color: C.charcoal }}>+ {time}</button>)}
                </div>
                <div className="flex gap-2">
                  <input value={customTime} onChange={(event) => setCustomTime(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addCustomSlot()} placeholder="Custom time, e.g. 6:00 PM" className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
                  <button onClick={addCustomSlot} className="px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>Add</button>
                </div>
              </>
            ) : (
              <>
                <DayAgenda day={selected} />
                {selectedBundle.session?.sessionDate && <p className="text-[11px] mt-3" style={{ color: C.taupe }}>Selected client's session: {selectedBundle.session.sessionDate} at {selectedBundle.session.sessionTime || "TBD"}.</p>}
              </>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

function MarketingPage({ state, actions, setPage }) {
  const segments = useMemo(() => {
    const counts = {};
    state.clients.forEach((client) => (client.tags || []).forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; }));
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [state.clients]);

  const campaigns = state.marketingCampaigns || [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Email Marketing</p>
        <button onClick={() => actions.addMarketingCampaign({ name: "Untitled Campaign", segment: segments[0]?.name || "All clients" })} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
          <Plus size={14} /> New campaign
        </button>
      </div>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>
        Built on Resend Audiences. Client tags drive segments automatically — the counts below are real, pulled from the tags
        already on your client records, not placeholder numbers.
      </p>
      <Card className="p-5">
        <SectionLabel icon={Users}>Segments</SectionLabel>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pb-5">
          {segments.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No tags yet.</p>}
          {segments.map((segment) => (
            <button key={segment.name} onClick={() => setPage("clients")} className="text-left rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
              <p className="ecc-display text-2xl" style={{ color: C.ink }}>{segment.count}</p>
              <p className="text-xs" style={{ color: C.charcoal }}>{segment.name}</p>
            </button>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionLabel icon={Mail}>Campaigns</SectionLabel>
        <div className="px-5 pb-5">
          {campaigns.map((campaign, index) => (
            <div key={campaign.id || campaign.name} className="flex items-center justify-between py-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
              <div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{campaign.name}</p>
                <p className="text-xs" style={{ color: C.taupe }}>{campaign.segment} · {campaign.stats}</p>
              </div>
              <Pill tone={campaign.status === "Sent" ? "done" : campaign.status === "Automated" ? "info" : "neutral"}>{campaign.status}</Pill>
            </div>
          ))}
        </div>
      </Card>
      <EmptyState title="Not wired up" body="Composer, Resend webhook logging, and unsubscribe handling are real build work — this is the shape, not the wiring." />
    </div>
  );
}

const DM_RULES = [
  { keyword: "MINIS", reply: "Mini-session info + booking link", count: 38 },
  { keyword: "MATERNITY", reply: "Maternity package PDF + inquiry link", count: 21 },
  { keyword: "BOOK", reply: "Direct link to the inquiry form", count: 64 },
];

function SocialPage({ state, actions }) {
  const rules = state.socialRules || DM_RULES;
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Social Messaging</p>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>
        Comment-to-DM keyword automation on Instagram. Cold-DMing isn't possible under Meta's rules — this only fires on a
        user-initiated comment or story reply, then logs the lead straight into Inquiries.
      </p>
      <Card className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: C.cream }}><MessageCircle size={18} color={C.forest} /></div>
          <div>
            <p className="text-sm font-medium" style={{ color: C.ink }}>@eccreativeweddings</p>
            <p className="text-xs" style={{ color: C.taupe }}>Connected · Meta App Review pending</p>
          </div>
        </div>
        <Pill tone="info">Pending Review</Pill>
      </Card>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Keyword Rules</p>
          <button onClick={() => actions.addSocialRule({ keyword: "NEW", reply: "Send booking link" })} className="flex items-center gap-1 text-xs font-medium" style={{ color: C.forest }}><Plus size={12} /> Add rule</button>
        </div>
        {rules.map((rule, index) => (
          <div key={rule.id || rule.keyword} className="flex items-center justify-between py-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>"{rule.keyword}"</p>
              <p className="text-xs" style={{ color: C.charcoal }}>{rule.reply}</p>
            </div>
            <Pill>{rule.count} triggered</Pill>
          </div>
        ))}
      </Card>
      <EmptyState title="Webhook not connected" body="Needs a Meta Developer App with instagram_business_manage_messages, approved through App Review — weeks to months. Start that early; this page is ready for it." />
    </div>
  );
}

const FORM_FIELD_TYPES = [
  { key: "short", label: "Short Text", icon: PenLine },
  { key: "long", label: "Long Text", icon: ClipboardList },
  { key: "choice", label: "Multiple Choice", icon: CheckCircle2 },
  { key: "checkbox", label: "Checkboxes", icon: Check },
  { key: "email", label: "Email", icon: Mail },
  { key: "date", label: "Date", icon: CalendarDays },
];

const SEED_FORMS = [
  { id: "f1", name: "Let's Get Started — Tell Us About You!", status: "Published", platforms: ["Website"], fields: [{ id: 1, type: "short", label: "Full Name" }, { id: 2, type: "email", label: "Email Address" }, { id: 3, type: "choice", label: "Session Type" }] },
  { id: "f2", name: "Wedding Inquiry", status: "Published", platforms: ["Website", "Instagram Bio"], fields: [{ id: 1, type: "short", label: "Couple's Names" }, { id: 2, type: "date", label: "Wedding Date" }] },
  { id: "f3", name: "Mini Session Signup", status: "Draft", platforms: [], fields: [{ id: 1, type: "short", label: "Full Name" }] },
];

const PLATFORM_OPTIONS = ["Website", "Instagram Bio", "Inquiry Page", "Email Signature"];

function FormsPage() {
  const [forms, setForms] = useState(SEED_FORMS);
  const [openId, setOpenId] = useState(null);
  const current = forms.find((form) => form.id === openId);

  const update = (fn) => setForms((list) => list.map((form) => (form.id === openId ? fn(form) : form)));
  const addField = (type) => update((form) => ({ ...form, fields: [...form.fields, { id: Date.now(), type, label: FORM_FIELD_TYPES.find((entry) => entry.key === type).label }] }));
  const removeField = (id) => update((form) => ({ ...form, fields: form.fields.filter((field) => field.id !== id) }));
  const updateLabel = (id, label) => update((form) => ({ ...form, fields: form.fields.map((field) => (field.id === id ? { ...field, label } : field)) }));
  const togglePlatform = (platform) => update((form) => ({ ...form, platforms: form.platforms.includes(platform) ? form.platforms.filter((entry) => entry !== platform) : [...form.platforms, platform] }));

  const newForm = () => {
    const id = `f_${Date.now()}`;
    setForms((list) => [{ id, name: "Untitled Form", status: "Draft", platforms: [], fields: [] }, ...list]);
    setOpenId(id);
  };

  useEffect(() => {
    window.addEventListener("eccs:create-form", newForm);
    return () => window.removeEventListener("eccs:create-form", newForm);
  }, []);

  if (current) {
    const slug = current.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setOpenId(null)} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> All Forms</button>
          <Pill tone={current.status === "Published" ? "done" : "neutral"}>{current.status}</Pill>
        </div>
        <input value={current.name} onChange={(event) => update((form) => ({ ...form, name: event.target.value }))} className="ecc-display text-2xl bg-transparent outline-none w-full" style={{ color: C.ink }} />

        <Card className="p-4">
          <p className="text-xs uppercase tracking-[0.25em] mb-2" style={{ color: C.taupe }}>Usable on</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((platform) => {
              const active = current.platforms.includes(platform);
              return (
                <button key={platform} onClick={() => togglePlatform(platform)} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: active ? C.forest : C.cream, color: active ? "#fff" : C.ink }}>
                  {platform}
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: C.taupe }}>eccreative.com/forms/{slug || "untitled"}</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Fields</p>
            {current.fields.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No fields yet. Add one from the right.</p>}
            <div className="space-y-2">
              {current.fields.map((field) => {
                const Icon = FORM_FIELD_TYPES.find((entry) => entry.key === field.type)?.icon || PenLine;
                return (
                  <div key={field.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: `1px solid ${C.line}` }}>
                    <Icon size={14} color={C.taupe} />
                    <input value={field.label} onChange={(event) => updateLabel(field.id, event.target.value)} className="flex-1 text-sm bg-transparent outline-none" style={{ color: C.ink }} />
                    <button onClick={() => removeField(field.id)}><X size={14} color={C.taupe} /></button>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-4 h-fit">
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Add a field</p>
            <div className="grid grid-cols-2 gap-2">
              {FORM_FIELD_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button key={type.key} onClick={() => addField(type.key)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center" style={{ border: `1px solid ${C.line}` }}>
                    <Icon size={16} color={C.forest} />
                    <span className="text-[11px]" style={{ color: C.ink }}>{type.label}</span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Contact Forms</p>
        <button onClick={newForm} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
          <Plus size={14} /> New Contact Form
        </button>
      </div>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>Build a form once, drop it anywhere — website, Instagram bio link, inquiry page. Submissions land in Inquiries.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {forms.map((form) => (
          <Card key={form.id} className="p-4">
            <div className="aspect-[16/9] rounded-xl mb-3 flex items-center justify-center" style={{ background: C.bg }}>
              <ClipboardList size={20} color={C.taupe} />
            </div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium" style={{ color: C.ink }}>{form.name}</p>
              {form.status === "Draft" && <Pill>Draft</Pill>}
            </div>
            <p className="text-xs mb-3" style={{ color: C.taupe }}>{form.platforms.length ? form.platforms.join(" · ") : "Not placed anywhere yet"}</p>
            <button onClick={() => setOpenId(form.id)} className="w-full py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              {form.status === "Draft" ? "Edit Draft" : "View Form"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

const Toggle = ({ checked, onChange }) => (
  <button onClick={() => onChange(!checked)} className="w-9 h-5 rounded-full relative shrink-0 transition" style={{ background: checked ? C.forest : C.line }}>
    <span className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition" style={{ left: checked ? 18 : 2 }} />
  </button>
);

const TEMPLATE_TABS = [
  { key: "contracts", label: "Contracts" },
  { key: "invoices", label: "Invoices" },
  { key: "quotes", label: "Quotes" },
  { key: "questionnaires", label: "Questionnaires" },
  { key: "emails", label: "Emails" },
];

const SEED_TEMPLATES = {
  contracts: [
    {
      id: "c1",
      name: "Maternity Session Contract",
      description: "Standard portrait agreement with payment, reschedule, image rights, and signature blocks.",
      created: "Jan 17, 2026",
      audience: "Booked maternity clients",
      trigger: "After quote acceptance",
      sessionType: "Maternity Session",
      status: "Active",
      body: `This agreement is between EC Creative Studios and {{client_name}} for {{session_type}} on {{session_date}} at {{location}}.`,
      modules: [
        { id: "c1m1", type: "scope", label: "Scope of work", body: `Services include planning, photography coverage, editing, and gallery delivery for {{session_type}}.`, required: true },
        { id: "c1m2", type: "payment", label: "Payment terms", body: `A deposit of {{deposit}} secures the booking. Remaining balance {{balance_due}} is due before the session.`, required: true },
        { id: "c1m3", type: "signature", label: "Signature block", body: `Client signature: ____________________\nEC Creative Studios: ____________________`, required: true },
      ],
      settings: { signatureRequired: true, documentExpiry: false, documentReminders: true },
    },
    {
      id: "c2",
      name: "Wedding Photography Contract",
      description: "Wedding agreement with coverage, delivery, payment schedule, cancellation, and usage rights.",
      created: "Jun 18, 2025",
      audience: "Wedding clients",
      trigger: "After accepted wedding quote",
      sessionType: "Wedding",
      status: "Active",
      body: `Photography services agreement between EC Creative Studios and {{client_name}} for {{session_type}}.`,
      modules: [],
      settings: { signatureRequired: true, documentExpiry: false, documentReminders: true },
    },
  ],
  invoices: [
    {
      id: "i1",
      name: "Deposit Invoice",
      description: "Deposit invoice with payment methods, due date, and booking lock language.",
      created: "Feb 1, 2026",
      audience: "Clients after contract sent",
      trigger: "When booking deposit is needed",
      sessionType: "All sessions",
      status: "Active",
      body: `Deposit due to secure {{session_date}}. Amount due: {{deposit}}.`,
      modules: [],
      settings: { paymentDue: "Within 7 days" },
    },
    {
      id: "i2",
      name: "Final Balance Invoice",
      description: "Final payment invoice before session or delivery depending on package.",
      created: "Mar 4, 2026",
      audience: "Booked clients",
      trigger: "Before session date",
      sessionType: "All sessions",
      status: "Active",
      body: `Remaining balance due before session. Balance: {{balance_due}}.`,
      modules: [],
      settings: { paymentDue: "Within 30 days" },
    },
  ],
  quotes: [
    {
      id: "q1",
      name: "Maternity Portrait Quote",
      description: "Package-first quote with pick-one package group, add-ons, payment plan, and expiration.",
      created: "Jan 2, 2026",
      audience: "Maternity inquiries",
      trigger: "After inquiry approval",
      sessionType: "Maternity Session",
      status: "Active",
      body: `Hi {{client_name}}, this quote was built from your {{session_type}} inquiry. Requested package: {{package_name}}.`,
      modules: [
        { id: "q1m1", type: "package_group", label: "Pick-one package group", body: `Client must choose one package before accepting the quote.`, required: true },
        { id: "q1m2", type: "addons", label: "Optional add-ons", body: `Optional add-ons update the quote total only when selected.`, required: false },
      ],
      settings: { autoCreateInvoice: true, documentExpiry: false, documentReminders: false },
    },
  ],
  questionnaires: [
    {
      id: "qq1",
      name: "Session Prep Questionnaire",
      description: "Pre-session form for vibe, people, wardrobe, location, and special notes.",
      created: "Jan 10, 2026",
      audience: "Booked clients",
      trigger: "After deposit paid",
      sessionType: "All sessions",
      status: "Draft",
      body: `Help us prepare for your session. Answer these before {{session_date}}.`,
      modules: [],
      settings: { documentExpiry: false, documentReminders: true },
    },
  ],
  emails: [
    {
      id: "e1",
      name: "Maternity Quote Email",
      description: "Sends the right wording when the inquiry package defaults into a maternity quote.",
      created: "Jan 5, 2026",
      audience: "Maternity inquiries",
      trigger: "Send quote",
      sessionType: "Maternity Session",
      status: "Active",
      subject: "Your {{package_name}} quote from EC Creative Studios",
      body: `Hi {{client_name}},\n\nI built this around your maternity inquiry and {{package_name}}. Review your quote total of {{total}} in the portal, choose any add-ons, and accept when ready.\n\nEC Creative Studios`,
      modules: [],
    },
    {
      id: "e2",
      name: "Booking Confirmation",
      description: "Confirms a booking after contract and payment clear.",
      created: "Jan 5, 2026",
      audience: "Booked clients",
      trigger: "After deposit paid",
      sessionType: "All sessions",
      status: "Active",
      subject: "You're booked, {{client_name}}!",
      body: `Your {{session_type}} is confirmed for {{session_date}}.`,
      modules: [],
    },
  ],
};

const TEMPLATE_VARIABLES = ["{{client_name}}", "{{client_email}}", "{{phone}}", "{{session_type}}", "{{package_name}}", "{{session_date}}", "{{session_time}}", "{{location}}", "{{total}}", "{{deposit}}", "{{balance_due}}", "{{invoice_number}}", "{{gallery_link}}", "{{portal_link}}"];

const TEMPLATE_MODULE_PRESETS = {
  contracts: [
    { type: "parties", label: "Parties block", body: `Client: {{client_name}}\nStudio: EC Creative Studios\nSession: {{session_type}}` },
    { type: "scope", label: "Scope of work", body: `EC Creative Studios will provide planning, photography coverage, editing, and online gallery delivery for {{session_type}}.` },
    { type: "deliverables", label: "Deliverables", body: `Final edited images are delivered through an online gallery. Raw files are not included unless agreed in writing.` },
    { type: "payment", label: "Payment terms", body: `A deposit of {{deposit}} secures the date. Remaining balance {{balance_due}} is due before the session.` },
    { type: "reschedule", label: "Reschedule / cancellation", body: `Reschedules depend on availability. Cancelled sessions forfeit the deposit unless otherwise approved by EC Creative Studios.` },
    { type: "usage", label: "Usage rights", body: `Client receives personal-use rights. EC Creative Studios retains copyright and portfolio rights unless a privacy addendum is signed.` },
    { type: "model_release", label: "Model release", body: `Client grants permission for EC Creative Studios to use selected images for portfolio, website, social media, and promotional use unless opted out in writing.` },
    { type: "signature", label: "Client + studio signatures", body: `Client signature: ____________________\nEC Creative Studios: ____________________\nDate: ____________________` },
  ],
  invoices: [
    { type: "summary", label: "Invoice summary", body: `Invoice {{invoice_number}} for {{client_name}}. Amount due: {{balance_due}}.` },
    { type: "line_items", label: "Itemized charges", body: `List each package, add-on, travel fee, studio rental, rush fee, discount, and tax as separate rows.` },
    { type: "schedule", label: "Payment schedule", body: `Deposit: {{deposit}}\nFinal balance: {{balance_due}}\nDue date: {{session_date}}` },
    { type: "method", label: "Payment methods", body: `Accepted payment methods: Card, Zelle, or approved manual payment.` },
    { type: "refund", label: "Refund / cancellation note", body: `Refunds and cancellations follow the signed agreement. Manual refunds should be logged against the original payment.` },
    { type: "late", label: "Past-due note", body: `Past-due invoices may pause booking, delivery, or gallery access.` },
  ],
  quotes: [
    { type: "intro", label: "Inquiry-based intro", body: `This quote is built from the inquiry details provided by {{client_name}} for {{session_type}}.` },
    { type: "package_group", label: "Pick-one package group", body: `Client must choose one package option before accepting this quote. Default requested package: {{package_name}}.` },
    { type: "comparison", label: "Package comparison", body: `Show the package cards side by side with deliverables, session length, location notes, and total price.` },
    { type: "addons", label: "Optional add-ons", body: `Optional add-ons may be selected before acceptance and will update the quote total.` },
    { type: "payment_plan", label: "Payment plan", body: `Deposit due to secure the booking. Remaining balance due before the session.` },
    { type: "expiration", label: "Quote expiration", body: `This quote is valid until the expiration date listed above.` },
    { type: "next_steps", label: "Next steps", body: `Accept quote → sign contract → pay invoice → choose date/time → prepare session.` },
  ],
  questionnaires: [
    { type: "contact", label: "Contact confirmation", body: `Confirm name, email, phone, and preferred communication method.` },
    { type: "goals", label: "Session goals", body: `Question: What do you want these images to feel like or preserve?` },
    { type: "style", label: "Style preference", body: `Question: Which style fits you best?\nOptions: Editorial, Lifestyle, Classic, Documentary, Warm and candid` },
    { type: "wardrobe", label: "Wardrobe notes", body: `Question: What outfits, colors, or pieces are you considering?` },
    { type: "location", label: "Location notes", body: `Question: Do you have a location preference or accessibility needs?` },
    { type: "people", label: "People included", body: `Question: Who will be photographed? Include names and ages for children.` },
    { type: "upload", label: "Reference upload", body: `Prompt: Upload or paste inspiration images for your session.` },
  ],
  emails: [
    { type: "inquiry_reply", label: "Inquiry reply", body: `Hi {{client_name}},\n\nThank you for reaching out about {{session_type}}. I reviewed your inquiry and can help you shape this into a clear session plan.` },
    { type: "quote_delivery", label: "Quote delivery", body: `Your {{package_name}} quote is ready. Review the package, add-ons, total, and next steps in your portal.` },
    { type: "contract_nudge", label: "Contract nudge", body: `Your date is not fully secured until the contract is signed and invoice is paid.` },
    { type: "invoice_reminder", label: "Invoice reminder", body: `Your invoice balance of {{balance_due}} is still open. You can pay from the portal.` },
    { type: "session_prep", label: "Session prep", body: `Here are the final details for your {{session_type}}: date, time, location, wardrobe notes, and arrival instructions.` },
    { type: "gallery_delivery", label: "Gallery delivery", body: `Your gallery is ready: {{gallery_link}}` },
    { type: "footer", label: "Studio signature", body: `EC Creative Studios\nMiami, FL\n{{portal_link}}` },
  ],
};

function TemplatesPage() {
  const [tab, setTab] = useState("contracts");
  const [data, setData] = useState(SEED_TEMPLATES);
  const [editing, setEditing] = useState(null);

  const list = data[tab];
  const current = editing && data[editing.type].find((entry) => entry.id === editing.id);

  const updateField = (field, value) => setData((d) => ({ ...d, [editing.type]: d[editing.type].map((entry) => (entry.id === editing.id ? { ...entry, [field]: value } : entry)) }));
  const updateSetting = (key, value) => setData((d) => ({ ...d, [editing.type]: d[editing.type].map((entry) => (entry.id === editing.id ? { ...entry, settings: { ...entry.settings, [key]: value } } : entry)) }));
  const insertVariable = (variable) => updateField("body", `${current.body || ""} ${variable}`);
  const addModule = (module) => updateField("modules", [...(current.modules || []), { id: `mod_${Date.now()}_${Math.random()}`, ...module, required: false }]);
  const updateModule = (moduleId, patch) => updateField("modules", (current.modules || []).map((module) => (module.id === moduleId ? { ...module, ...patch } : module)));
  const removeModule = (moduleId) => updateField("modules", (current.modules || []).filter((module) => module.id !== moduleId));
  const insertModuleBody = (module) => updateField("body", `${current.body || ""}\n\n${module.body || ""}`.trim());

  const newTemplate = (type = tab) => {
    const id = `${type}_${Date.now()}`;
    const label = TEMPLATE_TABS.find((entry) => entry.key === type)?.label || "Template";
    const baseBlank = { id, created: "Just now", description: "", audience: "", trigger: "Manual", sessionType: "All sessions", status: "Draft", body: "", modules: [] };
    const blank = type === "emails"
      ? { ...baseBlank, name: "Untitled Email Template", subject: "" }
      : { ...baseBlank, name: `Untitled ${label.replace(/s$/, "")} Template`, settings: type === "invoices" ? { paymentDue: "Within 30 days" } : type === "quotes" ? { autoCreateInvoice: true, documentExpiry: false, documentReminders: false } : { documentExpiry: false, documentReminders: false, ...(type === "contracts" ? { signatureRequired: true } : {}) } };
    setTab(type);
    setData((d) => ({ ...d, [type]: [blank, ...d[type]] }));
    setEditing({ type, id });
  };

  useEffect(() => {
    const handler = (event) => newTemplate(event.detail?.type || tab);
    window.addEventListener("eccs:create-template", handler);
    return () => window.removeEventListener("eccs:create-template", handler);
  }, [tab]);

  if (editing && current) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(null)}><ChevronLeft size={16} color={C.charcoal} /></button>
            <input value={current.name} onChange={(event) => updateField("name", event.target.value)} className="ecc-display text-xl bg-transparent outline-none" style={{ color: C.ink }} />
          </div>
          <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>Done</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-4">
          <Card className="p-4 h-fit">
            <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Template Settings</p>
            <div className="space-y-3">
              <Field compact label="Description" value={current.description || ""} onChange={(value) => updateField("description", value)} />
              <Field compact label="Audience" value={current.audience || ""} onChange={(value) => updateField("audience", value)} />
              <Field compact label="Trigger" value={current.trigger || ""} onChange={(value) => updateField("trigger", value)} />
              <Field compact label="Default session" value={current.sessionType || ""} onChange={(value) => updateField("sessionType", value)} />
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Status</p>
                <select value={current.status || "Draft"} onChange={(event) => updateField("status", event.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
                  {["Draft", "Active", "Archived", "Automation"].map((option) => <option key={option}>{option}</option>)}
                </select>
              </div>
              {editing.type === "contracts" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.ink }}>Signature required</span>
                  <Toggle checked={!!current.settings?.signatureRequired} onChange={(value) => updateSetting("signatureRequired", value)} />
                </div>
              )}
              {editing.type === "quotes" && (
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: C.ink }}>Auto-create invoice</span>
                  <Toggle checked={!!current.settings?.autoCreateInvoice} onChange={(value) => updateSetting("autoCreateInvoice", value)} />
                </div>
              )}
              {editing.type === "invoices" ? (
                <div>
                  <p className="text-sm mb-1.5" style={{ color: C.ink }}>Payment due</p>
                  <select value={current.settings?.paymentDue || "Within 30 days"} onChange={(event) => updateSetting("paymentDue", event.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }}>
                    {["Within 7 days", "Within 14 days", "Within 30 days", "On receipt"].map((option) => <option key={option}>{option}</option>)}
                  </select>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.ink }}>Document expiry</span>
                    <Toggle checked={!!current.settings?.documentExpiry} onChange={(value) => updateSetting("documentExpiry", value)} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.ink }}>Document reminders</span>
                    <Toggle checked={!!current.settings?.documentReminders} onChange={(value) => updateSetting("documentReminders", value)} />
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card className="p-5">
            {editing.type === "emails" && (
              <input value={current.subject} onChange={(event) => updateField("subject", event.target.value)} placeholder="Subject" className="w-full mb-3 px-3 py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
            )}
            <div className="rounded-2xl p-3 mb-3" style={{ background: C.bg }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Template modules</p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>Add real document sections instead of one giant blank textarea.</p>
                </div>
                <select onChange={(event) => { const preset = (TEMPLATE_MODULE_PRESETS[editing.type] || []).find((entry) => entry.type === event.target.value); if (preset) { addModule(preset); insertModuleBody(preset); event.target.value = ""; } }} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.charcoal }}>
                  <option value="">Add module</option>
                  {(TEMPLATE_MODULE_PRESETS[editing.type] || []).map((module) => <option key={module.type} value={module.type}>{module.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                {(current.modules || []).length === 0 && <p className="text-xs" style={{ color: C.taupe }}>No modules yet. Add the sections this template needs.</p>}
                {(current.modules || []).map((module) => (
                  <div key={module.id} className="rounded-xl p-2" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
                    <div className="flex items-center gap-2">
                      <input value={module.label} onChange={(event) => updateModule(module.id, { label: event.target.value })} className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: C.ink }} />
                      <button onClick={() => updateModule(module.id, { required: !module.required })} className="text-xs px-2 py-1 rounded-full" style={{ background: module.required ? "#eaf1ee" : C.bg, color: module.required ? C.forest : C.taupe }}>{module.required ? "Required" : "Optional"}</button>
                      <button onClick={() => insertModuleBody(module)} className="text-xs" style={{ color: C.forest }}>Insert</button>
                      <button onClick={() => removeModule(module.id)} className="text-xs" style={{ color: C.red }}>Remove</button>
                    </div>
                    <p className="text-xs mt-1" style={{ color: C.taupe }}>{module.type}</p>
                    <textarea rows={3} value={module.body || ""} onChange={(event) => updateModule(module.id, { body: event.target.value })} className="w-full mt-2 rounded-xl p-2 text-xs outline-none resize-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-1 mb-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
              <div className="flex-1" />
              <select onChange={(event) => { if (event.target.value) { insertVariable(event.target.value); event.target.value = ""; } }} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.charcoal }}>
                <option value="">Insert Field</option>
                {TEMPLATE_VARIABLES.map((variable) => <option key={variable} value={variable}>{variable}</option>)}
              </select>
            </div>
            <textarea value={current.body} onChange={(event) => updateField("body", event.target.value)} rows={12} placeholder={`Start typing your ${editing.type === "emails" ? "email" : editing.type.replace(/s$/, "")} template...`} className="w-full text-sm outline-none resize-none" style={{ color: C.ink }} />
            {editing.type === "contracts" && (
              <div className="mt-4 pt-4 text-sm" style={{ borderTop: `1px solid ${C.line}`, color: C.charcoal }}>
                <p className="font-medium mb-2" style={{ color: C.ink }}>Signatures</p>
                <p>Your Client _______________________</p>
                <p className="mt-2">EC Creative Studios _______________________</p>
              </div>
            )}
          </Card>

          <Card className="p-4 h-fit sticky top-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <p className="text-xs uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Live Preview</p>
              <Pill tone={current.status === "Active" ? "done" : "info"}>{current.status || "Draft"}</Pill>
            </div>
            <p className="text-sm font-medium" style={{ color: C.ink }}>{current.name}</p>
            <p className="text-xs mt-1" style={{ color: C.taupe }}>{current.audience || "No audience"} • {current.trigger || "No trigger"}</p>
            {editing.type === "emails" && current.subject && (
              <div className="rounded-xl p-3 mt-3" style={{ background: C.bg }}>
                <p className="text-[10px] uppercase tracking-[0.25em] mb-1" style={{ color: C.taupe }}>Subject</p>
                <p className="text-sm" style={{ color: C.ink }}>{current.subject}</p>
              </div>
            )}
            <div className="rounded-xl p-3 mt-3 max-h-72 overflow-y-auto ecc-scrollbar" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <RichText text={current.body || "Template body is empty."} className="text-sm leading-6" style={{ color: C.ink }} />
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Modules</p>
              {(current.modules || []).length === 0 && <p className="text-xs" style={{ color: C.taupe }}>No modules attached.</p>}
              {(current.modules || []).map((module) => (
                <div key={module.id} className="flex items-center justify-between gap-2 rounded-xl px-3 py-2" style={{ background: C.bg }}>
                  <span className="text-xs truncate" style={{ color: C.ink }}>{module.label}</span>
                  <span className="text-[10px] uppercase" style={{ color: module.required ? C.forest : C.taupe }}>{module.required ? "Required" : "Optional"}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Templates</p>
        <button onClick={() => newTemplate()} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
          <Plus size={14} /> New Template
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto ecc-scrollbar">
        {TEMPLATE_TABS.map((tabOption) => (
          <button key={tabOption.key} onClick={() => setTab(tabOption.key)} className="px-3.5 py-2 rounded-full text-sm font-medium shrink-0" style={{ background: tab === tabOption.key ? C.charcoal : "transparent", color: tab === tabOption.key ? "#fff" : C.charcoal }}>
            {tabOption.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {list.map((template) => (
          <button key={template.id} onClick={() => setEditing({ type: tab, id: template.id })} className="rounded-3xl p-5 text-left" style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{template.name}</p>
                <p className="text-xs mt-1" style={{ color: C.taupe }}>{template.created}</p>
              </div>
              <Pill tone={template.status === "Active" ? "done" : "info"}>{template.status || "Draft"}</Pill>
            </div>
            <p className="text-sm leading-6 min-h-[48px]" style={{ color: C.charcoal }}>{template.description || "No description yet."}</p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <SummaryChip label="Trigger" value={template.trigger || "Manual"} />
              <SummaryChip label="Modules" value={String((template.modules || []).length)} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function SettingsPage({ state, actions }) {
  const [active, setActive] = useState("email");
  const [locationDraft, setLocationDraft] = useState({ name: "", city: "Miami, FL", address: "" });
  const mergeFields = ["{{client_name}}", "{{session_type}}", "{{quote_total}}", "{{quote_number}}", "{{invoice_number}}", "{{invoice_total}}", "{{contract_title}}", "{{portal_link}}", "{{session_date}}", "{{session_time}}", "{{location}}", "{{business_name}}", "{{gallery_link}}", "{{print_store_link}}"]; 
  const emailTemplates = state.emailTemplates || [];
  const tabs = [
    { key: "email", label: "Email", icon: Mail },
    { key: "locations", label: "Locations", icon: CalendarDays },
    { key: "templates", label: "Templates", icon: LayoutTemplate },
    { key: "portal", label: "Portal", icon: CheckCircle2 },
  ];
  const addLocation = () => {
    if (!locationDraft.name.trim()) return;
    actions.addLocation(locationDraft);
    setLocationDraft({ name: "", city: "Miami, FL", address: "" });
  };

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3 px-5 pb-4">
          <div>
            <SectionLabel icon={SettingsIcon}>Settings</SectionLabel>
            <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>Global defaults only. The messy setup cards were collapsed into tabs so this page feels like a control panel, not a junk drawer.</p>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 ecc-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.key} onClick={() => setActive(tab.key)} className="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-2 shrink-0" style={{ background: active === tab.key ? C.charcoal : C.bg, color: active === tab.key ? "#fff" : C.charcoal }}>
                <Icon size={14} /> {tab.label}
              </button>
            );
          })}
        </div>
      </Card>

      {active === "email" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <Card className="p-5">
            <SectionLabel icon={Mail}>Email Templates</SectionLabel>
            <div className="px-5 pb-5 space-y-3">
              {emailTemplates.map((template) => (
                <details key={template.key} className="rounded-2xl p-4" style={{ border: `1px solid ${C.line}`, background: "#fff" }}>
                  <summary className="cursor-pointer text-sm font-medium" style={{ color: C.ink }}>{template.name}</summary>
                  <div className="mt-4 space-y-3">
                    <Field label="Subject" value={template.subject || ""} onChange={(value) => actions.updateEmailTemplate(template.key, { subject: value })} />
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.25em] mb-1.5" style={{ color: C.taupe }}>Body</p>
                      <textarea rows={5} value={template.body || ""} onChange={(event) => actions.updateEmailTemplate(template.key, { body: event.target.value })} className="w-full rounded-xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </Card>
          <Card className="p-5 h-fit">
            <SectionLabel icon={Sparkles}>Merge Fields</SectionLabel>
            <div className="px-5 pb-5">
              <div className="flex flex-wrap gap-2">
                {mergeFields.map((field) => <Pill key={field} tone="info">{field}</Pill>)}
              </div>
              <p className="text-xs mt-4" style={{ color: C.charcoal }}>Use these in email templates. The send preview renders them before anything goes out.</p>
            </div>
          </Card>
        </div>
      )}

      {active === "locations" && (
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-5">
          <Card className="p-5">
            <SectionLabel icon={CalendarDays}>Saved Locations</SectionLabel>
            <div className="px-5 pb-5 space-y-2">
              {(state.locations || []).map((location) => (
                <div key={location.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-2 rounded-2xl p-3" style={{ background: C.bg }}>
                  <Field compact value={location.name} onChange={(value) => actions.updateLocation(location.id, { name: value })} />
                  <Field compact value={location.address || location.city || ""} onChange={(value) => actions.updateLocation(location.id, { address: value })} />
                  <button onClick={() => actions.removeLocation(location.id)} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "#fff", color: C.red, border: `1px solid ${C.line}` }}>Delete</button>
                </div>
              ))}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr_auto] gap-2 rounded-2xl p-3" style={{ border: `1px dashed ${C.line}` }}>
                <Field compact value={locationDraft.name} onChange={(value) => setLocationDraft((draft) => ({ ...draft, name: value }))} />
                <Field compact value={locationDraft.address} onChange={(value) => setLocationDraft((draft) => ({ ...draft, address: value }))} />
                <button onClick={addLocation} className="px-3 py-2 rounded-xl text-xs font-medium text-white" style={{ background: C.forest }}>Add</button>
              </div>
            </div>
          </Card>
          <Card className="p-5 h-fit">
            <SectionLabel icon={CalendarDays}>Calendar Connections</SectionLabel>
            <div className="px-5 pb-5 space-y-2">
              {[["google", "Google Calendar"], ["apple", "Apple Calendar"]].map(([key, label]) => (
                <button key={key} onClick={() => actions.updateCalendarConnection(key, !state.calendarConnections?.[key])} className="w-full text-left px-4 py-3 rounded-xl flex items-center justify-between" style={{ background: "#fff", border: `1px solid ${C.line}`, color: C.ink }}>
                  <span>{state.calendarConnections?.[key] ? "Connected" : "Connect"} {label}</span>
                  <Pill tone={state.calendarConnections?.[key] ? "done" : "neutral"}>{state.calendarConnections?.[key] ? "on" : "future"}</Pill>
                </button>
              ))}
              <p className="text-xs mt-3" style={{ color: C.charcoal }}>Frontend switches for now. OAuth belongs in the Supabase/Auth build.</p>
            </div>
          </Card>
        </div>
      )}

      {active === "templates" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <SectionLabel icon={FileText}>Quote Templates</SectionLabel>
            <div className="px-5 pb-5 space-y-2">
              {(state.quoteTemplates || []).map((name) => <div key={name} className="rounded-2xl p-3" style={{ background: C.bg }}><p className="text-sm" style={{ color: C.ink }}>{name}</p></div>)}
            </div>
          </Card>
          <Card className="p-5">
            <SectionLabel icon={FileSignature}>Contract Templates</SectionLabel>
            <div className="px-5 pb-5 space-y-2">
              {(state.contractTemplates || []).map((name) => <div key={name} className="rounded-2xl p-3" style={{ background: C.bg }}><p className="text-sm" style={{ color: C.ink }}>{name}</p></div>)}
            </div>
          </Card>
        </div>
      )}

      {active === "portal" && (
        <Card className="p-5">
          <SectionLabel icon={CheckCircle2}>Portal Defaults</SectionLabel>
          <div className="px-5 pb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(state.portalDefaults || []).map((step) => (
              <div key={step.id} className="rounded-2xl p-4" style={{ background: C.bg }}>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{step.title}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{step.body}</p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function ActionCard({ title, body, actionLabel, onClick }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: C.bg }}>
      <p className="text-sm font-medium" style={{ color: C.ink }}>{title}</p>
      <p className="text-sm mt-2" style={{ color: C.charcoal }}>{body}</p>
      <button onClick={onClick} className="mt-4 text-sm underline" style={{ color: C.forest }}>{actionLabel}</button>
    </div>
  );
}

function SummaryChip({ label, value, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`rounded-2xl px-3 py-2 text-left ${onClick ? "transition hover:-translate-y-0.5" : ""}`}
      style={{ background: C.bg, border: `1px solid ${C.line}` }}
    >
      <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: C.taupe }}>{label}</p>
      <p className="text-sm font-medium mt-1" style={{ color: C.ink }}>{value}</p>
    </Tag>
  );
}

function Field({ label, value, onChange, type = "text", compact = false }) {
  return (
    <div className={compact ? "" : "space-y-1"}>
      {label && <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{label}</p>}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }} />
    </div>
  );
}

function PriceRow({ label, value, strong = false }) {
  return (
    <div className="flex items-center justify-between">
      <span style={{ color: strong ? C.ink : C.charcoal, fontWeight: strong ? 600 : 400 }}>{label}</span>
      <span style={{ color: C.ink, fontWeight: strong ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function toInputDate(value = "") {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function fromInputDate(value = "") {
  if (!value) return "";
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function toInputTime(value = "") {
  const match = String(value).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!match) return "";
  let hour = Number(match[1]);
  const minute = match[2];
  const ampm = match[3]?.toUpperCase();
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${minute}`;
}

function fromInputTime(value = "") {
  if (!value) return "";
  const [hourRaw, minute] = value.split(":");
  let hour = Number(hourRaw);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function nextActionText(bundle) {
  if (!bundle.client) return "Select a client to continue.";
  if (!bundle.primaryQuote) return "Create the first quote from the approved inquiry.";
  if (bundle.primaryQuote.status !== "accepted") return "Get the quote accepted before generating a contract.";
  if (!bundle.primaryContract) return "Generate the contract from the accepted quote.";
  if (bundle.primaryContract.status !== "signed") return "Collect the client signature before invoicing.";
  if (!bundle.primaryInvoice) return "Create and send the first invoice.";
  if (!bundle.booking.isBooked) return "Record payment before creating the project or opening the portal.";
  if (!bundle.projectStatus.portalAccessSent) return "Send the portal access email now that the project is officially created.";
  if (!bundle.session?.sessionDate) return "Send availability and secure the session date.";
  if (!bundle.projectStatus.calendarInviteSent) return "Send the ICS calendar invite.";
  return "Project is booked, portal is active, and the session is ready to run.";
}

function nextActionPage(bundle) {
  if (!bundle.client) return "clients";
  if (!bundle.primaryQuote) return "quotes";
  if (bundle.primaryQuote.status !== "accepted") return "quotes";
  if (!bundle.primaryContract) return "contracts";
  if (bundle.primaryContract.status !== "signed") return "contracts";
  if (!bundle.primaryInvoice) return "invoices";
  if (!bundle.booking.isBooked) return "invoices";
  if (!bundle.projectStatus.portalAccessSent) return "emails";
  if (!bundle.session?.sessionDate) return "emails";
  if (!bundle.projectStatus.calendarInviteSent) return "emails";
  return "projects";
}

function statusTone(status) {
  if (["accepted", "signed", "paid"].includes(status)) return "done";
  if (["sent", "viewed", "partially_paid"].includes(status)) return "info";
  if (["declined", "cancelled", "refunded"].includes(status)) return "warn";
  return "neutral";
}
