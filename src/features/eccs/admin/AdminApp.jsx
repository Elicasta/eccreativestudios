"use client";

import React, { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  FolderKanban,
  Inbox,
  LayoutTemplate,
  MessageCircle,
  PenSquare,
  Plus,
  Receipt,
  Search,
  Send,
  Sparkles,
  Users,
} from "lucide-react";
import { C } from "../lib/brand";
import { formatCurrency, getClientBundle, PIPELINE_LABELS, PIPELINE_STAGES } from "../lib/crm";
import { Avatar, Card, EmptyState, Pill, SectionLabel, StatusLight } from "../components/ui";

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: FolderKanban },
  { key: "pipeline", label: "Pipeline", icon: Sparkles },
  { key: "inquiries", label: "Inquiries", icon: Inbox },
  { key: "clients", label: "Clients", icon: Users },
  { key: "quotes", label: "Quotes", icon: FileText },
  { key: "contracts", label: "Contracts", icon: FileSignature },
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "sessions", label: "Sessions", icon: CalendarDays },
  { key: "portal", label: "Portal Editor", icon: LayoutTemplate },
  { key: "activity", label: "Activity", icon: Bell },
];

const SLOT_OPTIONS = [
  { date: "Jul 18, 2026", time: "9:00 AM", locationName: "The Light Haus Studio" },
  { date: "Jul 20, 2026", time: "4:30 PM", locationName: "The Light Haus Studio" },
  { date: "Jul 22, 2026", time: "10:00 AM", locationName: "Dallas Arboretum" },
];

export default function AdminApp({ state, selectedBundle, actions, setApp }) {
  const [page, setPage] = useState("dashboard");
  const [query, setQuery] = useState("");

  const filteredClients = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return state.clients;
    return state.clients.filter((client) =>
      [client.name, client.email, client.sessionType].some((value) => value?.toLowerCase().includes(lower)),
    );
  }, [query, state.clients]);

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 44px)" }}>
      <aside className="hidden md:flex md:flex-col w-72 shrink-0 px-4 py-6" style={{ background: C.charcoal }}>
        <Sidebar page={page} setPage={setPage} />
      </aside>

      <main className="flex-1 min-w-0">
        <Topbar query={query} setQuery={setQuery} />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1500px] mx-auto space-y-5">
          {page === "dashboard" && (
            <DashboardPage
              state={state}
              selectedBundle={selectedBundle}
              filteredClients={filteredClients}
              actions={actions}
              setPage={setPage}
              setApp={setApp}
            />
          )}
          {page === "pipeline" && <PipelinePage state={state} actions={actions} />}
          {page === "inquiries" && <InquiriesPage state={state} actions={actions} />}
          {page === "clients" && (
            <ClientsPage state={state} selectedBundle={selectedBundle} filteredClients={filteredClients} actions={actions} setPage={setPage} />
          )}
          {page === "quotes" && <QuotesPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "contracts" && <ContractsPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "invoices" && <InvoicesPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "payments" && <PaymentsPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "sessions" && <SessionsPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "portal" && <PortalPage selectedBundle={selectedBundle} actions={actions} setApp={setApp} />}
          {page === "activity" && <ActivityPage state={state} />}
        </div>
      </main>
    </div>
  );
}

function Sidebar({ page, setPage }) {
  return (
    <>
      <div className="mb-8 px-1">
        <p className="ecc-display text-white text-2xl leading-none">EC</p>
        <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: C.taupe }}>
          Creative Studios
        </p>
      </div>
      <nav className="space-y-1 flex-1">
        {NAV.map((item) => {
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
      </nav>
      <div className="pt-4 mt-4 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: C.taupe }}>
        Local CRM mode
      </div>
    </>
  );
}

function Topbar({ query, setQuery }) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
      <p className="ecc-display text-2xl flex-1" style={{ color: C.ink }}>
        Studio CRM
      </p>
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full w-full max-w-md" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
        <Search size={14} color={C.taupe} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients, documents, sessions..."
          className="bg-transparent outline-none text-sm w-full"
          style={{ color: C.ink }}
        />
      </div>
      <button className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: C.forest }}>
        <Plus size={16} />
      </button>
    </div>
  );
}

function DashboardPage({ state, selectedBundle, filteredClients, actions, setPage, setApp }) {
  const metrics = [
    { label: "Open Inquiries", value: state.inquiries.filter((entry) => entry.status === "new").length },
    { label: "Quotes In Flight", value: state.quotes.filter((entry) => ["draft", "sent", "viewed"].includes(entry.status)).length },
    { label: "Contracts Pending", value: state.contracts.filter((entry) => entry.status === "sent").length },
    { label: "Invoices Outstanding", value: state.invoices.filter((entry) => ["sent", "partially_paid"].includes(entry.status)).length },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
      <div className="space-y-5">
        <Card className="p-8 sm:p-10" style={{ background: `linear-gradient(135deg, ${C.charcoal}, ${C.ink})`, borderColor: "transparent" }}>
          <p className="text-[10px] uppercase tracking-[0.35em] mb-3" style={{ color: C.taupe }}>
            EC Creative Studios
          </p>
          <p className="ecc-display text-4xl text-white max-w-xl leading-tight">
            A real studio workflow, not a visual mock.
          </p>
          <p className="text-sm mt-4 max-w-lg" style={{ color: C.cream }}>
            Quotes, contracts, invoices, payments, sessions, and the portal now share the same local source of truth.
          </p>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-4">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>
                {metric.label}
              </p>
              <p className="ecc-display text-3xl mt-2" style={{ color: C.ink }}>
                {metric.value}
              </p>
            </Card>
          ))}
        </div>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>
                Selected Client
              </p>
              <p className="ecc-display text-3xl" style={{ color: C.ink }}>
                {selectedBundle.client?.name}
              </p>
            </div>
            <button onClick={() => setApp("client")} className="text-sm underline" style={{ color: C.forest }}>
              Preview portal
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryChip label="Pipeline" value={PIPELINE_LABELS[selectedBundle.stage]} />
            <SummaryChip label="Quote" value={selectedBundle.primaryQuote?.status || "Not created"} />
            <SummaryChip label="Invoice Balance" value={formatCurrency(selectedBundle.invoices.reduce((total, invoice) => total + invoice.balanceDue, 0))} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <ActionCard
              title="Next operational step"
              body={nextActionText(selectedBundle)}
              actionLabel="Open client record"
              onClick={() => setPage("clients")}
            />
            <ActionCard
              title="Document control"
              body="Create the next required document only when the previous milestone is satisfied."
              actionLabel="Open invoices"
              onClick={() => setPage("invoices")}
            />
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={Users}>Active Clients</SectionLabel>
          <div className="space-y-2">
            {filteredClients.map((client) => {
              const bundle = getClientBundle(state, client.id);
              return (
                <button
                  key={client.id}
                  onClick={() => actions.selectClient(client.id)}
                  className="w-full flex items-center justify-between p-3 rounded-xl text-left"
                  style={{ background: client.id === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={client.name} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: C.ink }}>
                        {client.name}
                      </p>
                      <p className="text-xs truncate" style={{ color: C.charcoal }}>
                        {client.sessionType} • {PIPELINE_LABELS[bundle.stage]}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} color={C.taupe} />
                </button>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <SectionLabel icon={CheckCircle2}>Recent Activity</SectionLabel>
          <div className="space-y-3">
            {state.activity.slice(0, 8).map((entry) => (
              <div key={entry.id} className="pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                <p className="text-sm" style={{ color: C.ink }}>
                  {entry.text}
                </p>
                <p className="text-xs mt-1" style={{ color: C.taupe }}>
                  {entry.createdAt}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={Inbox}>New Inquiry Queue</SectionLabel>
          <div className="space-y-3">
            {state.inquiries
              .filter((entry) => entry.status === "new")
              .map((entry) => (
                <div key={entry.id} className="rounded-xl p-3" style={{ background: C.bg }}>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>
                    {entry.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                    {entry.sessionType} • {entry.budgetRange}
                  </p>
                  <button
                    onClick={() => actions.approveInquiry(entry.id)}
                    className="mt-3 px-3 py-2 rounded-full text-xs font-medium text-white"
                    style={{ background: C.forest }}
                  >
                    Approve and create client
                  </button>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function PipelinePage({ state, actions }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
      {PIPELINE_STAGES.slice(0, 10).map((stage) => {
        const items = state.clients.filter((client) => getClientBundle(state, client.id).stage === stage.key);
        return (
          <Card key={stage.key} className="p-4">
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>
              {stage.label}
            </p>
            <p className="ecc-display text-3xl mt-2 mb-4" style={{ color: C.ink }}>
              {items.length}
            </p>
            <div className="space-y-2">
              {items.length === 0 && <p className="text-xs" style={{ color: C.charcoal }}>No records here.</p>}
              {items.map((client) => (
                <button
                  key={client.id}
                  onClick={() => actions.selectClient(client.id)}
                  className="w-full p-3 rounded-xl text-left"
                  style={{ background: C.bg }}
                >
                  <p className="text-sm font-medium" style={{ color: C.ink }}>
                    {client.name}
                  </p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                    {client.sessionType}
                  </p>
                </button>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function InquiriesPage({ state, actions }) {
  return (
    <Card className="p-5">
      <SectionLabel icon={Inbox}>Incoming Leads</SectionLabel>
      <div className="space-y-3">
        {state.inquiries.map((inquiry) => (
          <div key={inquiry.id} className="rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3" style={{ background: inquiry.status === "new" ? "#fff8ef" : "#fff", border: `1px solid ${C.line}` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{inquiry.name}</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                {inquiry.sessionType} • {inquiry.budgetRange} • {inquiry.receivedAt}
              </p>
              <p className="text-xs mt-2" style={{ color: C.charcoal }}>{inquiry.notes}</p>
            </div>
            <div className="flex items-center gap-2">
              <Pill tone={inquiry.status === "new" ? "warn" : "info"}>{inquiry.status}</Pill>
              {inquiry.status === "new" && (
                <button onClick={() => actions.approveInquiry(inquiry.id)} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ClientsPage({ state, selectedBundle, filteredClients, actions, setPage }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
      <Card className="p-4">
        <SectionLabel icon={Users}>Client Records</SectionLabel>
        <div className="space-y-2">
          {filteredClients.map((client) => {
            const active = client.id === state.selectedClientId;
            const bundle = getClientBundle(state, client.id);
            return (
              <button
                key={client.id}
                onClick={() => actions.selectClient(client.id)}
                className="w-full p-3 rounded-xl text-left"
                style={{ background: active ? C.cream : "#fff", border: `1px solid ${active ? C.taupe : C.line}` }}
              >
                <p className="text-sm font-medium" style={{ color: C.ink }}>{client.name}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{client.sessionType}</p>
                <Pill tone="info">{PIPELINE_LABELS[bundle.stage]}</Pill>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        {!selectedBundle.client ? (
          <EmptyState title="No client selected" body="Pick a client to inspect their real linked records." />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>{selectedBundle.client.name}</p>
                <p className="text-sm mt-1" style={{ color: C.charcoal }}>
                  {selectedBundle.client.email} • {selectedBundle.client.phone}
                </p>
              </div>
              <StatusLight tone={selectedBundle.stage === "deposit_paid" || selectedBundle.stage === "session_scheduled" ? "green" : "yellow"} label={PIPELINE_LABELS[selectedBundle.stage]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              <SummaryChip label="Quotes" value={String(selectedBundle.quotes.length)} />
              <SummaryChip label="Contracts" value={String(selectedBundle.contracts.length)} />
              <SummaryChip label="Invoices" value={String(selectedBundle.invoices.length)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard title="Create quote" body="Start with a clean, editable estimate connected to the inquiry." actionLabel="Draft quote" onClick={() => { actions.createQuote(selectedBundle.client.id); setPage("quotes"); }} />
              <ActionCard title="Generate contract" body="Available once a quote has been accepted." actionLabel="Open contracts" onClick={() => { actions.createContract(selectedBundle.client.id); setPage("contracts"); }} />
              <ActionCard title="Create invoice" body="Deposit, final, and full-payment invoices are guarded against duplicates." actionLabel="Open invoices" onClick={() => setPage("invoices")} />
              <ActionCard title="Portal prep" body="Session notes, vision board, and location details stay linked to the same client record." actionLabel="Edit portal" onClick={() => setPage("portal")} />
            </div>
            <div className="mt-5">
              <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: C.taupe }}>Notes</p>
              <div className="space-y-2">
                {selectedBundle.notes.map((note) => (
                  <div key={note.id} className="rounded-xl p-3" style={{ background: C.bg }}>
                    <p className="text-sm" style={{ color: C.ink }}>{note.body}</p>
                    <p className="text-xs mt-1" style={{ color: C.taupe }}>{note.createdAt}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function QuotesPage({ state, selectedBundle, actions }) {
  const quote = selectedBundle.primaryQuote;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-5">
      <Card className="p-4">
        <SectionLabel icon={FileText}>Quotes</SectionLabel>
        <button onClick={() => selectedBundle.client && actions.createQuote(selectedBundle.client.id)} className="w-full mb-3 px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
          Create guarded quote
        </button>
        <div className="space-y-2">
          {state.quotes.map((entry) => (
            <button
              key={entry.id}
              onClick={() => actions.selectClient(entry.clientId)}
              className="w-full p-3 rounded-xl text-left"
              style={{ background: entry.clientId === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}
            >
              <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number}</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                {getClientBundle(state, entry.clientId).client?.name} • {formatCurrency(entry.total)}
              </p>
              <Pill tone={entry.status === "accepted" ? "done" : entry.status === "sent" || entry.status === "viewed" ? "info" : "neutral"}>
                {entry.status}
              </Pill>
            </button>
          ))}
        </div>
      </Card>

      {!quote ? (
        <EmptyState title="No quote yet" body="Select a client and draft the first connected quote from their inquiry and package." />
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-[1.1fr_0.9fr] gap-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>{quote.number}</p>
                <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {selectedBundle.client?.sessionType}</p>
              </div>
              <Pill tone={quote.status === "accepted" ? "done" : quote.status === "sent" || quote.status === "viewed" ? "info" : "neutral"}>
                {quote.status}
              </Pill>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Field label="Session date" value={quote.sessionDate} onChange={(value) => actions.patchQuote(quote.id, { sessionDate: value })} />
              <Field label="Location" value={quote.location} onChange={(value) => actions.patchQuote(quote.id, { location: value })} />
              <Field label="Expiration" value={quote.expirationDate} onChange={(value) => actions.patchQuote(quote.id, { expirationDate: value })} />
              <Field label="Discount" type="number" value={quote.discount} onChange={(value) => actions.patchQuote(quote.id, { discount: Number(value || 0) })} />
            </div>
            <textarea
              rows={3}
              value={quote.notes || ""}
              onChange={(event) => actions.patchQuote(quote.id, { notes: event.target.value })}
              className="w-full rounded-2xl p-3 text-sm outline-none"
              style={{ border: `1px solid ${C.line}`, color: C.ink }}
            />
            <div className="space-y-3 mt-5">
              {quote.lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_110px_130px_40px] gap-2 items-center">
                  <Field compact value={item.name} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { name: value })} />
                  <Field compact value={item.description} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { description: value })} />
                  <Field compact type="number" value={item.quantity} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { quantity: Number(value || 0) })} />
                  <Field compact type="number" value={item.unitPrice} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { unitPrice: Number(value || 0) })} />
                  <button onClick={() => actions.removeQuoteItem(quote.id, item.id)} className="h-10 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.red }}>
                    x
                  </button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => actions.addQuoteItem(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>
                Add line item
              </button>
              <button onClick={() => actions.sendQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
                Send quote
              </button>
              <button onClick={() => actions.viewQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>
                Mark viewed
              </button>
              <button onClick={() => actions.acceptQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#eaf1ee", color: C.forest }}>
                Accept
              </button>
              <button onClick={() => actions.declineQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#f8ece8", color: C.red }}>
                Decline
              </button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>Quote Preview</p>
            <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{quote.number}</p>
            <p className="text-sm mt-2" style={{ color: C.charcoal }}>
              {selectedBundle.client?.name} • {quote.eventType}
            </p>
            <div className="mt-6 space-y-3">
              {quote.lineItems.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: C.ink }}>{item.name}</p>
                    <p className="text-xs mt-1" style={{ color: C.charcoal }}>{item.description}</p>
                  </div>
                  <p className="text-sm" style={{ color: C.ink }}>{formatCurrency(item.quantity * item.unitPrice)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 mt-6 text-sm">
              <PriceRow label="Subtotal" value={formatCurrency(quote.subtotal)} />
              <PriceRow label="Discount" value={formatCurrency(quote.discount)} />
              <PriceRow label="Tax" value={formatCurrency(quote.tax)} />
              <PriceRow strong label="Total" value={formatCurrency(quote.total)} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function ContractsPage({ selectedBundle, actions }) {
  const contract = selectedBundle.primaryContract;
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
      <Card className="p-5">
        <SectionLabel icon={FileSignature}>Contract Controls</SectionLabel>
        <p className="text-sm mb-4" style={{ color: C.charcoal }}>
          Contracts can only be created after a quote is accepted, which keeps the workflow sequenced and guards against duplicate drafts.
        </p>
        <button onClick={() => selectedBundle.client && actions.createContract(selectedBundle.client.id)} className="px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
          Generate contract
        </button>
        {contract && (
          <div className="mt-5 space-y-3">
            <SummaryChip label="Contract" value={contract.number} />
            <SummaryChip label="Template" value={contract.templateName} />
            <SummaryChip label="Status" value={contract.status} />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => actions.sendContract(contract.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>
                Send
              </button>
              <button onClick={() => actions.signContract(contract.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#eaf1ee", color: C.forest }}>
                Mark signed
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card className="p-5">
        {!contract ? (
          <EmptyState title="No contract yet" body="Approve the quote first, then generate a contract tied to that accepted proposal." />
        ) : (
          <>
            <p className="ecc-display text-4xl" style={{ color: C.ink }}>{contract.number}</p>
            <p className="text-sm mt-2" style={{ color: C.charcoal }}>
              {selectedBundle.client?.name} • {contract.templateName}
            </p>
            <div className="mt-6 rounded-2xl p-5" style={{ background: C.bg }}>
              <p className="text-sm leading-7" style={{ color: C.ink }}>
                This contract confirms creative coverage, payment timing, rescheduling terms, usage rights, and delivery expectations for the selected session.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
                <SummaryChip label="Created" value={contract.createdAt} />
                <SummaryChip label="Signed" value={contract.signedAt || "Awaiting"} />
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function InvoicesPage({ state, selectedBundle, actions }) {
  const [paymentAmount, setPaymentAmount] = useState("");
  const invoice = selectedBundle.primaryInvoice;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[340px_1fr] gap-5">
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
          {state.invoices.map((entry) => (
            <button key={entry.id} onClick={() => actions.selectClient(entry.clientId)} className="w-full p-3 rounded-xl text-left" style={{ background: entry.clientId === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number}</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                {entry.kind} • {formatCurrency(entry.total)}
              </p>
              <Pill tone={entry.status === "paid" ? "done" : entry.status === "sent" || entry.status === "partially_paid" ? "info" : "neutral"}>
                {entry.status}
              </Pill>
            </button>
          ))}
        </div>
      </Card>

      {!invoice ? (
        <EmptyState title="No invoice selected" body="Create the next invoice from the signed contract or select an existing invoice to track payment." />
      ) : (
        <Card className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <p className="ecc-display text-4xl" style={{ color: C.ink }}>{invoice.number}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {invoice.kind}</p>
            </div>
            <Pill tone={invoice.status === "paid" ? "done" : invoice.status === "sent" || invoice.status === "partially_paid" ? "info" : "neutral"}>
              {invoice.status}
            </Pill>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <SummaryChip label="Total" value={formatCurrency(invoice.total)} />
            <SummaryChip label="Paid" value={formatCurrency(invoice.amountPaid)} />
            <SummaryChip label="Balance" value={formatCurrency(invoice.balanceDue)} />
            <SummaryChip label="Due" value={invoice.dueDate || "TBD"} />
          </div>
          <div className="space-y-3 mb-5">
            {invoice.lineItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{item.name}</p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>{item.description}</p>
                </div>
                <p className="text-sm" style={{ color: C.ink }}>{formatCurrency(item.quantity * item.unitPrice)}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            <button onClick={() => actions.sendInvoice(invoice.id)} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
              Send invoice
            </button>
            <Field compact label="Payment amount" type="number" value={paymentAmount} onChange={setPaymentAmount} />
            <button onClick={() => { actions.recordPayment(invoice.id, Number(paymentAmount || 0), "Manual"); setPaymentAmount(""); }} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#eaf1ee", color: C.forest }}>
              Apply payment
            </button>
          </div>
          <textarea
            rows={3}
            value={invoice.internalNotes || ""}
            onChange={(event) => actions.patchInvoice(invoice.id, { internalNotes: event.target.value })}
            className="w-full rounded-2xl p-3 text-sm outline-none"
            style={{ border: `1px solid ${C.line}`, color: C.ink }}
          />
        </Card>
      )}
    </div>
  );
}

function PaymentsPage({ state, selectedBundle, actions }) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
      <Card className="p-5">
        <SectionLabel icon={CreditCard}>Payment Ledger</SectionLabel>
        <div className="space-y-3">
          {state.payments.map((payment) => (
            <div key={payment.id} className="rounded-xl p-3" style={{ background: C.bg }}>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{formatCurrency(payment.amount)}</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                {getClientBundle(state, payment.clientId).client?.name} • {payment.method}
              </p>
              <p className="text-xs mt-1" style={{ color: C.taupe }}>{payment.paidAt}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionLabel icon={ClipboardList}>Client Balance Snapshot</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <SummaryChip label="Client" value={selectedBundle.client?.name || "—"} />
          <SummaryChip label="Outstanding" value={formatCurrency(selectedBundle.invoices.reduce((sum, entry) => sum + entry.balanceDue, 0))} />
          <SummaryChip label="Payments logged" value={String(selectedBundle.payments.length)} />
        </div>
        <div className="space-y-2">
          {selectedBundle.invoices.map((invoice) => (
            <button key={invoice.id} onClick={() => actions.recordPayment(invoice.id, invoice.balanceDue, "Manual")} className="w-full flex items-center justify-between p-3 rounded-xl text-left" style={{ border: `1px solid ${C.line}` }}>
              <div>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{invoice.number}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{invoice.status}</p>
              </div>
              <span className="text-sm" style={{ color: C.forest }}>Apply {formatCurrency(invoice.balanceDue)}</span>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

function SessionsPage({ state, selectedBundle, actions }) {
  const session = selectedBundle.session;
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
          <div className="flex items-start justify-between gap-3 mb-5">
            <div>
              <p className="ecc-display text-4xl" style={{ color: C.ink }}>{selectedBundle.client?.sessionType}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name}</p>
            </div>
            <Pill tone={session.status === "scheduled" || session.status === "completed" ? "done" : "info"}>{session.status}</Pill>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <SummaryChip label="Date" value={session.sessionDate || "Not set"} />
            <SummaryChip label="Time" value={session.sessionTime || "Not set"} />
            <SummaryChip label="Prep" value={session.prepStatus} />
          </div>
          {session.status === "awaiting_schedule" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
              {SLOT_OPTIONS.map((slot) => (
                <button
                  key={`${slot.date}-${slot.time}`}
                  onClick={() => actions.scheduleSession(selectedBundle.client.id, slot)}
                  className="p-3 rounded-xl text-left"
                  style={{ border: `1px solid ${C.line}` }}
                >
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{slot.date}</p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>{slot.time} • {slot.locationName}</p>
                </button>
              ))}
            </div>
          )}
          <textarea readOnly rows={4} value={session.notes || ""} className="w-full rounded-2xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
          <button onClick={() => actions.completeSession(session.id)} className="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.charcoal }}>
            Mark session complete
          </button>
        </Card>
      )}
    </div>
  );
}

function PortalPage({ selectedBundle, actions, setApp }) {
  const portal = selectedBundle.portal;
  if (!selectedBundle.client || !portal) {
    return <EmptyState title="No portal selected" body="Pick a client with a portal profile to edit." />;
  }

  const update = (patch) => actions.updatePortal(selectedBundle.client.id, patch);
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="ecc-display text-3xl" style={{ color: C.ink }}>Client Portal Editor</p>
          <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.name}</p>
        </div>
        <button onClick={() => setApp("client")} className="text-sm underline" style={{ color: C.forest }}>Preview client view</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Field label="Custom date" value={portal.customDate || ""} onChange={(value) => update({ customDate: value, useProjectDetails: false })} />
        <Field label="Custom time" value={portal.customTime || ""} onChange={(value) => update({ customTime: value, useProjectDetails: false })} />
        <Field label="Custom location" value={portal.customLocation || ""} onChange={(value) => update({ customLocation: value, useProjectDetails: false })} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea rows={4} value={portal.sessionVision || ""} onChange={(event) => update({ sessionVision: event.target.value })} className="w-full rounded-2xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
        <textarea rows={4} value={portal.sessionNotes || ""} onChange={(event) => update({ sessionNotes: event.target.value })} className="w-full rounded-2xl p-3 text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        {(portal.propList || []).map((prop, index) => (
          <Field key={`${prop}-${index}`} label={`Prop ${index + 1}`} value={prop} onChange={(value) => update({ propList: portal.propList.map((item, itemIndex) => (itemIndex === index ? value : item)) })} />
        ))}
      </div>
    </Card>
  );
}

function ActivityPage({ state }) {
  return (
    <Card className="p-5">
      <SectionLabel icon={Bell}>All Activity</SectionLabel>
      <div className="space-y-3">
        {state.activity.map((entry) => (
          <div key={entry.id} className="rounded-xl p-3" style={{ background: C.bg }}>
            <p className="text-sm" style={{ color: C.ink }}>{entry.text}</p>
            <p className="text-xs mt-1" style={{ color: C.taupe }}>{entry.createdAt}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SummaryChip({ label, value }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: C.bg }}>
      <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{label}</p>
      <p className="text-sm mt-2 font-medium" style={{ color: C.ink }}>{value}</p>
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

function Field({ label, value, onChange, type = "text", compact = false }) {
  return (
    <div className={compact ? "" : "space-y-1"}>
      {label && <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{label}</p>}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl px-3 py-2.5 text-sm outline-none"
        style={{ border: `1px solid ${C.line}`, color: C.ink, background: "#fff" }}
      />
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

function nextActionText(bundle) {
  if (!bundle.client) return "Select a client to continue.";
  if (!bundle.primaryQuote) return "Create the first quote from the approved inquiry.";
  if (bundle.primaryQuote.status !== "accepted") return "Get the quote accepted before generating a contract.";
  if (!bundle.primaryContract) return "Generate the contract from the accepted quote.";
  if (bundle.primaryContract.status !== "signed") return "Collect the client signature before invoicing.";
  if (!bundle.primaryInvoice) return "Create and send the first invoice.";
  if (bundle.primaryInvoice.status !== "paid") return "Record the payment and unlock scheduling.";
  if (!bundle.session?.sessionDate) return "Book the session date through the portal or admin schedule.";
  return "Project is connected end to end and ready for delivery work.";
}
