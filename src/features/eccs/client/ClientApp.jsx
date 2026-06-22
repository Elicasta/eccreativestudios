"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  CreditCard,
  FileSignature,
  FileText,
  Image as ImageIcon,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  Sparkles,
} from "lucide-react";
import { C } from "../lib/brand";
import { formatCurrency, PIPELINE_LABELS } from "../lib/crm";
import { Card, Pill, StatusLight } from "../components/ui";

const NAV = [
  { key: "overview", label: "Overview" },
  { key: "documents", label: "Documents" },
  { key: "details", label: "Session Details" },
  { key: "vision", label: "Vision Board" },
  { key: "messages", label: "Messages" },
  { key: "payments", label: "Payments" },
];

const SLOT_OPTIONS = [
  { date: "Jul 18, 2026", time: "9:00 AM", locationName: "The Light Haus Studio" },
  { date: "Jul 20, 2026", time: "4:30 PM", locationName: "The Light Haus Studio" },
  { date: "Jul 22, 2026", time: "10:00 AM", locationName: "Dallas Arboretum" },
];

export default function ClientApp({ selectedBundle, actions }) {
  const [page, setPage] = useState("overview");
  const [drawer, setDrawer] = useState(false);

  if (!selectedBundle.client) {
    return null;
  }

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 44px)" }}>
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 px-4 py-6" style={{ background: C.charcoal }}>
        <PortalSidebar page={page} setPage={setPage} clientName={selectedBundle.client.name} sessionType={selectedBundle.client.sessionType} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 px-4 py-6 overflow-y-auto" style={{ background: C.charcoal }}>
            <PortalSidebar page={page} setPage={(nextPage) => { setPage(nextPage); setDrawer(false); }} clientName={selectedBundle.client.name} sessionType={selectedBundle.client.sessionType} />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.35)" }} onClick={() => setDrawer(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <button className="md:hidden" onClick={() => setDrawer(true)}>
            <Menu size={20} color={C.ink} />
          </button>
          <div className="flex-1">
            <p className="text-sm" style={{ color: C.charcoal }}>Welcome back,</p>
            <p className="ecc-display text-2xl" style={{ color: C.ink }}>{selectedBundle.client.name}</p>
          </div>
          <StatusLight tone={selectedBundle.stage === "deposit_paid" || selectedBundle.stage === "session_scheduled" ? "green" : "yellow"} label={PIPELINE_LABELS[selectedBundle.stage]} />
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
          {page === "overview" && <OverviewPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "documents" && <DocumentsPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "details" && <DetailsPage selectedBundle={selectedBundle} />}
          {page === "vision" && <VisionPage selectedBundle={selectedBundle} />}
          {page === "messages" && <MessagesPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "payments" && <PaymentsPage selectedBundle={selectedBundle} actions={actions} />}
        </div>
      </main>
    </div>
  );
}

function PortalSidebar({ page, setPage, clientName, sessionType }) {
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
          const active = page === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="w-full flex items-center px-3 py-2.5 rounded-xl text-sm"
              style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.cream }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="pt-4 mt-4 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", color: C.taupe }}>
        {clientName} • {sessionType}
      </div>
    </>
  );
}

function OverviewPage({ selectedBundle, actions }) {
  const session = selectedBundle.session;
  const portal = selectedBundle.portal;
  const quote = selectedBundle.primaryQuote;
  const contract = selectedBundle.primaryContract;
  const invoice = selectedBundle.primaryInvoice;

  return (
    <div className="space-y-5">
      <Card className="p-6 sm:p-8" style={{ background: `linear-gradient(135deg, ${C.charcoal}, ${C.ink})`, borderColor: "transparent" }}>
        <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: C.taupe }}>Session Journey</p>
        <p className="ecc-display text-4xl text-white mt-3 max-w-xl leading-tight">
          Everything for your session, beautifully organized in one place.
        </p>
        <p className="text-sm mt-4 max-w-lg" style={{ color: C.cream }}>
          Review your proposal, sign, pay, choose your date, and prepare for your session without losing the calm editorial feel.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard label="Current step" value={PIPELINE_LABELS[selectedBundle.stage]} />
        <InfoCard label="Session status" value={session?.status || "planning"} />
        <InfoCard label="Balance remaining" value={formatCurrency(selectedBundle.invoices.reduce((sum, entry) => sum + entry.balanceDue, 0))} />
      </div>

      {selectedBundle.stage === "deposit_paid" && session?.status === "awaiting_schedule" && (
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays size={18} color={C.forest} />
            <p className="ecc-display text-2xl" style={{ color: C.ink }}>Pick your date</p>
          </div>
          <p className="text-sm mb-4" style={{ color: C.charcoal }}>
            Your contract is signed and your deposit is in. Choose the time that works best and we’ll secure it instantly.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SLOT_OPTIONS.map((slot) => (
              <button
                key={`${slot.date}-${slot.time}`}
                onClick={() => actions.scheduleSession(selectedBundle.client.id, slot)}
                className="p-4 rounded-2xl text-left"
                style={{ border: `1px solid ${C.line}` }}
              >
                <p className="text-sm font-medium" style={{ color: C.ink }}>{slot.date}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>{slot.time}</p>
                <p className="text-xs mt-1" style={{ color: C.taupe }}>{slot.locationName}</p>
              </button>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <DocumentStatusCard
          icon={FileText}
          title={quote?.number || "Quote"}
          status={quote?.status || "not created"}
          description={quote ? `${formatCurrency(quote.total)} total proposal` : "Your quote will appear here once it is prepared."}
        />
        <DocumentStatusCard
          icon={FileSignature}
          title={contract?.number || "Contract"}
          status={contract?.status || "not created"}
          description={contract ? contract.templateName : "Your contract becomes available after quote acceptance."}
        />
        <DocumentStatusCard
          icon={CreditCard}
          title={invoice?.number || "Invoice"}
          status={invoice?.status || "not created"}
          description={invoice ? `${formatCurrency(invoice.balanceDue)} balance due` : "Invoices appear once your booking paperwork is ready."}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={16} color={C.taupe} />
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>Session Details</p>
          </div>
          <div className="space-y-2 text-sm" style={{ color: C.ink }}>
            <p>Date: {session?.sessionDate || portal?.customDate || "Waiting for your selection"}</p>
            <p>Time: {session?.sessionTime || portal?.customTime || "To be confirmed"}</p>
            <p>Location: {portal?.customLocation || "Dallas, TX"}</p>
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} color={C.taupe} />
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>Vision</p>
          </div>
          <p className="text-sm leading-7" style={{ color: C.ink }}>{portal?.sessionVision || "Your visual plan will appear here once your session is confirmed."}</p>
        </Card>
      </div>
    </div>
  );
}

function DocumentsPage({ selectedBundle, actions }) {
  const quote = selectedBundle.primaryQuote;
  const contract = selectedBundle.primaryContract;
  const invoice = selectedBundle.primaryInvoice;

  return (
    <div className="space-y-4">
      <ActionDocument
        title={quote?.number || "Quote"}
        body={quote ? `${formatCurrency(quote.total)} • ${selectedBundle.client.sessionType}` : "No quote has been prepared yet."}
        status={quote?.status || "pending"}
        actions={[
          quote && quote.status !== "accepted" ? { label: "Accept quote", onClick: () => actions.acceptQuote(quote.id) } : null,
          quote && quote.status === "draft" ? { label: "Mark viewed", onClick: () => actions.viewQuote(quote.id) } : null,
        ]}
      />
      <ActionDocument
        title={contract?.number || "Contract"}
        body={contract ? `${contract.templateName} for ${selectedBundle.client.name}` : "Your contract will appear here after your quote is accepted."}
        status={contract?.status || "pending"}
        actions={[contract && contract.status !== "signed" ? { label: "Sign contract", onClick: () => actions.signContract(contract.id) } : null]}
      />
      <ActionDocument
        title={invoice?.number || "Invoice"}
        body={invoice ? `${formatCurrency(invoice.total)} total • ${formatCurrency(invoice.balanceDue)} remaining` : "Your invoice will appear here once your booking is ready for payment."}
        status={invoice?.status || "pending"}
        actions={[invoice && invoice.balanceDue > 0 ? { label: `Pay ${formatCurrency(invoice.balanceDue)}`, onClick: () => actions.recordPayment(invoice.id, invoice.balanceDue, "Portal") } : null]}
      />
    </div>
  );
}

function DetailsPage({ selectedBundle }) {
  const unlocked = selectedBundle.stage === "session_scheduled" || selectedBundle.stage === "completed" || selectedBundle.stage === "deposit_paid";
  if (!unlocked) {
    return <LockedCard body="Session details unlock after your quote, contract, and invoice steps are in place." />;
  }
  const session = selectedBundle.session;
  const portal = selectedBundle.portal;
  return (
    <Card className="p-5">
      <p className="ecc-display text-3xl mb-4" style={{ color: C.ink }}>Session Details</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard label="Date" value={session?.sessionDate || portal?.customDate || "Awaiting selection"} />
        <InfoCard label="Time" value={session?.sessionTime || portal?.customTime || "Awaiting selection"} />
        <InfoCard label="Location" value={portal?.customLocation || "Dallas, TX"} />
      </div>
      <div className="mt-5 rounded-2xl p-4" style={{ background: C.bg }}>
        <p className="text-sm leading-7" style={{ color: C.ink }}>{portal?.sessionNotes}</p>
      </div>
    </Card>
  );
}

function VisionPage({ selectedBundle }) {
  if (!(selectedBundle.portal?.sessionVision || selectedBundle.portal?.propList?.length)) {
    return <LockedCard body="The styling board will appear here once planning is underway." />;
  }
  return (
    <Card className="p-5">
      <p className="ecc-display text-3xl mb-4" style={{ color: C.ink }}>Vision Board</p>
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
        <div className="rounded-2xl p-5" style={{ background: C.bg }}>
          <p className="text-sm leading-7" style={{ color: C.ink }}>{selectedBundle.portal.sessionVision}</p>
        </div>
        <div className="space-y-2">
          {(selectedBundle.portal.propList || []).map((prop, index) => (
            <div key={`${prop}-${index}`} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
              <ImageIcon size={16} color={C.taupe} />
              <span className="text-sm" style={{ color: C.ink }}>{prop}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function MessagesPage({ selectedBundle, actions }) {
  const [draft, setDraft] = useState("");

  return (
    <Card className="p-5">
      <p className="ecc-display text-3xl mb-4" style={{ color: C.ink }}>Messages</p>
      <div className="space-y-3 mb-4">
        {selectedBundle.messages.map((message) => (
          <div
            key={message.id}
            className="max-w-[80%] rounded-2xl px-4 py-3"
            style={{
              marginLeft: message.from === "client" ? "auto" : 0,
              background: message.from === "client" ? C.forest : C.bg,
              color: message.from === "client" ? "#fff" : C.ink,
            }}
          >
            <p className="text-sm">{message.text}</p>
            <p className="text-[11px] mt-2" style={{ color: message.from === "client" ? "rgba(255,255,255,0.7)" : C.taupe }}>
              {message.createdAt}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 rounded-full px-4 py-2" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
          <MessageCircle size={16} color={C.taupe} />
          <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Write a message..." className="w-full bg-transparent outline-none text-sm" />
        </div>
        <button onClick={() => { actions.sendMessage(selectedBundle.client.id, draft, "client"); setDraft(""); }} className="w-11 h-11 rounded-full flex items-center justify-center text-white" style={{ background: C.forest }}>
          <Send size={16} />
        </button>
      </div>
    </Card>
  );
}

function PaymentsPage({ selectedBundle, actions }) {
  return (
    <div className="space-y-4">
      {selectedBundle.invoices.length === 0 && <LockedCard body="Payments will appear here once your booking invoice is ready." />}
      {selectedBundle.invoices.map((invoice) => (
        <Card key={invoice.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="ecc-display text-3xl" style={{ color: C.ink }}>{invoice.number}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{invoice.kind} invoice</p>
            </div>
            <Pill tone={invoice.status === "paid" ? "done" : invoice.status === "sent" || invoice.status === "partially_paid" ? "info" : "neutral"}>
              {invoice.status}
            </Pill>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <InfoCard label="Total" value={formatCurrency(invoice.total)} />
            <InfoCard label="Paid" value={formatCurrency(invoice.amountPaid)} />
            <InfoCard label="Balance due" value={formatCurrency(invoice.balanceDue)} />
          </div>
          {invoice.balanceDue > 0 && (
            <button onClick={() => actions.recordPayment(invoice.id, invoice.balanceDue, "Portal")} className="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
              Pay remaining balance
            </button>
          )}
        </Card>
      ))}
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
      <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{label}</p>
      <p className="text-sm mt-2 font-medium" style={{ color: C.ink }}>{value}</p>
    </div>
  );
}

function DocumentStatusCard({ icon: Icon, title, status, description }) {
  return (
    <Card className="p-5">
      <Icon size={18} color={C.taupe} />
      <p className="text-sm font-medium mt-3" style={{ color: C.ink }}>{title}</p>
      <p className="text-xs mt-1" style={{ color: C.charcoal }}>{description}</p>
      <div className="mt-3">
        <Pill tone={status === "accepted" || status === "signed" || status === "paid" ? "done" : status === "sent" || status === "viewed" || status === "partially_paid" ? "info" : "neutral"}>
          {status}
        </Pill>
      </div>
    </Card>
  );
}

function ActionDocument({ title, body, status, actions = [] }) {
  return (
    <Card className="p-5">
      <p className="ecc-display text-3xl" style={{ color: C.ink }}>{title}</p>
      <p className="text-sm mt-2" style={{ color: C.charcoal }}>{body}</p>
      <div className="mt-3">
        <Pill tone={status === "accepted" || status === "signed" || status === "paid" ? "done" : status === "sent" || status === "viewed" || status === "partially_paid" ? "info" : "neutral"}>
          {status}
        </Pill>
      </div>
      <div className="flex flex-wrap gap-2 mt-4">
        {actions.filter(Boolean).map((action) => (
          <button key={action.label} onClick={action.onClick} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>
            {action.label}
          </button>
        ))}
      </div>
    </Card>
  );
}

function LockedCard({ body }) {
  return (
    <Card className="p-10 text-center">
      <Lock size={24} color={C.taupe} className="mx-auto mb-3" />
      <p className="ecc-display text-2xl mb-2" style={{ color: C.ink }}>Available soon</p>
      <p className="text-sm max-w-md mx-auto" style={{ color: C.charcoal }}>{body}</p>
    </Card>
  );
}
