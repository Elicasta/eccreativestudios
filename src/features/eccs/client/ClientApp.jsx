"use client";

import React, { useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  CreditCard,
  FileSignature,
  FileText,
  Home,
  Image as ImageIcon,
  Lock,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { C } from "../lib/brand";
import { formatCurrency, PIPELINE_LABELS } from "../lib/crm";
import { Card, Pill, StatusLight } from "../components/ui";
import { LinkPreviewCard } from "../components/LinkPreviewCard";

const NAV = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "details", label: "Session Details", icon: CalendarDays },
  { key: "vision", label: "Vision Board", icon: Sparkles },
  { key: "plan", label: "Plan & Prep", icon: CheckCircle2 },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
];

const BOTTOM_NAV = [
  { key: "overview", label: "Home", icon: Home },
  { key: "documents", label: "Docs", icon: FileText },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "payments", label: "Payments", icon: CreditCard },
];

const SLOT_OPTIONS = [
  { date: "Jul 18, 2026", time: "9:00 AM", locationName: "The Light Haus Studio" },
  { date: "Jul 20, 2026", time: "4:30 PM", locationName: "The Light Haus Studio" },
  { date: "Jul 22, 2026", time: "10:00 AM", locationName: "Dallas Arboretum" },
];

export default function ClientApp({ state, selectedBundle, actions }) {
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
          {page === "overview" && <OverviewPage state={state} selectedBundle={selectedBundle} actions={actions} setPage={setPage} />}
          {page === "documents" && <DocumentsPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "details" && <DetailsPage selectedBundle={selectedBundle} />}
          {page === "vision" && <VisionPage selectedBundle={selectedBundle} />}
          {page === "plan" && <PlanPage selectedBundle={selectedBundle} />}
          {page === "messages" && <MessagesPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "payments" && <PaymentsPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "gallery" && <GalleryPage selectedBundle={selectedBundle} />}
        </div>
      </main>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around py-2" style={{ background: "#fff", borderTop: `1px solid ${C.line}` }}>
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          const active = page === item.key;
          return (
            <button key={item.key} onClick={() => setPage(item.key)} className="flex flex-col items-center gap-0.5 px-2">
              <Icon size={18} color={active ? C.forest : C.taupe} />
              <span className="text-[10px]" style={{ color: active ? C.forest : C.taupe }}>{item.label}</span>
            </button>
          );
        })}
      </div>
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
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              onClick={() => setPage(item.key)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm"
              style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.cream }}
            >
              <Icon size={15} />
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

function OverviewPage({ state, selectedBundle, actions, setPage }) {
  const session = selectedBundle.session;
  const portal = selectedBundle.portal;
  const quote = selectedBundle.primaryQuote;
  const contract = selectedBundle.primaryContract;
  const invoice = selectedBundle.primaryInvoice;
  const heroImage = portal?.visionImages?.[0];
  const availableDates = (state.availability || []).filter((entry) => entry.times.length > 0);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden" style={{ borderColor: "transparent" }}>
        <div className={`grid grid-cols-1 ${heroImage ? "sm:grid-cols-[1.2fr_1fr]" : ""}`} style={{ background: `linear-gradient(135deg, ${C.charcoal}, ${C.ink})` }}>
          <div className="p-6 sm:p-8">
            <p className="text-[10px] uppercase tracking-[0.35em]" style={{ color: C.taupe }}>Session Journey</p>
            <p className="ecc-display text-4xl text-white mt-3 max-w-xl leading-tight">
              Everything for your session, beautifully organized in one place.
            </p>
            <p className="text-sm mt-4 max-w-lg" style={{ color: C.cream }}>
              Review your proposal, sign, pay, choose your date, and prepare for your session without losing the calm editorial feel.
            </p>
          </div>
          {heroImage && (
            <button onClick={() => setPage("vision")} className="block w-full h-full min-h-[200px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={heroImage.url} alt="" className="w-full h-full object-cover" />
            </button>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button onClick={() => setPage("documents")} className="text-left">
          <InfoCard label="Current step" value={PIPELINE_LABELS[selectedBundle.stage]} />
        </button>
        <button onClick={() => setPage("details")} className="text-left">
          <InfoCard label="Session status" value={session?.status || "planning"} />
        </button>
        <button onClick={() => setPage("payments")} className="text-left">
          <InfoCard label="Balance remaining" value={formatCurrency(selectedBundle.invoices.reduce((sum, entry) => sum + entry.balanceDue, 0))} />
        </button>
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
          {availableDates.length === 0 ? (
            <p className="text-sm rounded-xl p-4" style={{ background: C.bg, color: C.taupe }}>
              Your studio hasn't opened any dates yet — check back soon or reach out in Messages.
            </p>
          ) : (
            <div className="space-y-4">
              {availableDates.map((entry) => (
                <div key={entry.date}>
                  <p className="text-xs font-medium mb-2" style={{ color: C.ink }}>{entry.date}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {entry.times.map((time) => (
                      <button
                        key={time}
                        onClick={() => actions.scheduleSession(selectedBundle.client.id, { date: entry.date, time })}
                        className="p-3 rounded-2xl text-left"
                        style={{ border: `1px solid ${C.line}` }}
                      >
                        <p className="text-sm font-medium" style={{ color: C.ink }}>{time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <button onClick={() => setPage("documents")} className="text-left">
          <DocumentStatusCard
            icon={FileText}
            title={quote?.number || "Quote"}
            status={quote?.status || "not created"}
            description={quote ? `${formatCurrency(quote.total)} total proposal` : "Your quote will appear here once it is prepared."}
          />
        </button>
        <button onClick={() => setPage("documents")} className="text-left">
          <DocumentStatusCard
            icon={FileSignature}
            title={contract?.number || "Contract"}
            status={contract?.status || "not created"}
            description={contract ? contract.templateName : "Your contract becomes available after quote acceptance."}
          />
        </button>
        <button onClick={() => setPage("payments")} className="text-left">
          <DocumentStatusCard
            icon={CreditCard}
            title={invoice?.number || "Invoice"}
            status={invoice?.status || "not created"}
            description={invoice ? `${formatCurrency(invoice.balanceDue)} balance due` : "Invoices appear once your booking paperwork is ready."}
          />
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.9fr] gap-4">
        <button onClick={() => setPage("details")} className="text-left">
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
        </button>
        <button onClick={() => setPage("vision")} className="text-left">
          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} color={C.taupe} />
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>Vision</p>
            </div>
            <p className="text-sm leading-7" style={{ color: C.ink }}>{portal?.sessionVision || "Your visual plan will appear here once your session is confirmed."}</p>
          </Card>
        </button>
      </div>
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

function ClientQuoteOptionGroup({ quote, group, actions, locked }) {
  const selected = new Set(group.selectedOptionIds || []);
  return (
    <div className="rounded-2xl p-4" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-medium" style={{ color: C.ink }}>{group.title || "Choose your package"}</p>
          {group.description && <p className="text-xs mt-1" style={{ color: C.charcoal }}>{group.description}</p>}
        </div>
        <Pill tone={group.required ? "warn" : "neutral"}>{group.selectionMode === "multiple" ? "choose options" : "choose one"}</Pill>
      </div>
      <div className="space-y-2">
        {(group.options || []).map((option) => {
          const isSelected = selected.has(option.id);
          return (
            <button
              key={option.id}
              disabled={locked}
              onClick={() => actions.selectQuoteOption(quote.id, group.id, option.id, !isSelected)}
              className="w-full text-left rounded-2xl p-3"
              style={{ background: isSelected ? "#fff" : "rgba(255,255,255,0.55)", border: `1px solid ${isSelected ? C.forest : C.line}` }}
            >
              <div className="flex gap-3">
                <span className="w-5 h-5 rounded-full mt-0.5 flex items-center justify-center shrink-0" style={{ border: `1px solid ${isSelected ? C.forest : C.taupe}`, background: isSelected ? C.forest : "#fff" }}>
                  {isSelected && <Check size={12} color="#fff" />}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium" style={{ color: C.ink }}>{option.name}</p>
                    <p className="text-sm shrink-0" style={{ color: C.ink }}>{formatCurrency((option.quantity || 1) * (option.unitPrice || 0))}</p>
                  </div>
                  <RichText text={option.description} className="text-xs mt-1" style={{ color: C.charcoal }} />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {locked && <p className="text-xs mt-3" style={{ color: C.taupe }}>Accepted selections are locked.</p>}
    </div>
  );
}

function ClientModal({ onClose, title, children }) {
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

function DocumentsPage({ selectedBundle, actions }) {
  const quote = selectedBundle.primaryQuote;
  const contract = selectedBundle.primaryContract;
  const invoice = selectedBundle.primaryInvoice;
  const [preview, setPreview] = useState(null); // 'quote' | 'contract' | 'invoice'

  return (
    <div className="space-y-4">
      <ActionDocument
        title={quote?.number || "Quote"}
        body={quote ? `${formatCurrency(quote.total)} • ${selectedBundle.client.sessionType}` : "No quote has been prepared yet."}
        status={quote?.status || "pending"}
        actions={[
          quote ? { label: "View", onClick: () => setPreview("quote") } : null,
          quote && quote.status !== "accepted" ? { label: "Accept quote", onClick: () => actions.acceptQuote(quote.id) } : null,
          quote && quote.status === "draft" ? { label: "Mark viewed", onClick: () => actions.viewQuote(quote.id) } : null,
        ]}
      />
      <ActionDocument
        title={contract?.number || "Contract"}
        body={contract ? `${contract.templateName} for ${selectedBundle.client.name}` : "Your contract will appear here after your quote is accepted."}
        status={contract?.status || "pending"}
        actions={[
          contract ? { label: "View", onClick: () => setPreview("contract") } : null,
          contract && contract.status !== "signed" ? { label: "Sign contract", onClick: () => actions.signContract(contract.id) } : null,
        ]}
      />
      <ActionDocument
        title={invoice?.number || "Invoice"}
        body={invoice ? `${formatCurrency(invoice.total)} total • ${formatCurrency(invoice.balanceDue)} remaining` : "Your invoice will appear here once your booking is ready for payment."}
        status={invoice?.status || "pending"}
        actions={[
          invoice ? { label: "View", onClick: () => setPreview("invoice") } : null,
          invoice && invoice.balanceDue > 0 ? { label: `Pay ${formatCurrency(invoice.balanceDue)}`, onClick: () => actions.recordPayment(invoice.id, invoice.balanceDue, "Portal") } : null,
        ]}
      />

      {preview === "quote" && quote && (
        <ClientModal onClose={() => setPreview(null)} title={`Quote ${quote.number} — read-only`}>
          <p className="ecc-display text-3xl mt-2" style={{ color: C.ink }}>{formatCurrency(quote.total)}</p>
          <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.sessionType}</p>
          <div className="mt-5 space-y-3">
            {(quote.optionGroups || []).map((group) => (
              <ClientQuoteOptionGroup key={group.id} quote={quote} group={group} actions={actions} locked={quote.status === "accepted"} />
            ))}
            {quote.lineItems.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: C.ink }}>{item.name}</p>
                    {item.optional && <Pill tone={item.selected ? "done" : "neutral"}>{item.selected ? "selected" : "optional"}</Pill>}
                  </div>
                  <RichText text={item.description} className="text-xs mt-1" style={{ color: C.charcoal }} />
                  {item.optional && quote.status !== "accepted" && (
                    <button onClick={() => actions.patchQuoteItem(quote.id, item.id, { selected: !item.selected })} className="text-xs mt-2 underline" style={{ color: C.forest }}>
                      {item.selected ? "Remove from quote" : "Add to quote"}
                    </button>
                  )}
                </div>
                <p className="text-sm shrink-0" style={{ color: C.ink }}>{item.optional && !item.selected ? "+" : ""}{formatCurrency(item.quantity * item.unitPrice)}</p>
              </div>
            ))}
          </div>
          {quote.status === "accepted" && <p className="text-xs mt-4" style={{ color: C.taupe }}>Accepted — this quote is locked and can't be edited.</p>}
        </ClientModal>
      )}

      {preview === "contract" && contract && (
        <ClientModal onClose={() => setPreview(null)} title={`Contract ${contract.number} — read-only`}>
          <p className="ecc-display text-2xl mt-2" style={{ color: C.ink }}>{contract.templateName}</p>
          <div className="mt-5 space-y-4">
            {(contract.clauses || []).map((clause) => (
              <div key={clause.id}>
                <p className="text-sm font-medium mb-1" style={{ color: C.ink }}>{clause.title}</p>
                <p className="text-sm leading-6" style={{ color: C.charcoal }}>{clause.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
            <p className="text-xs" style={{ color: C.taupe }}>
              {contract.status === "signed" ? `Signed by ${contract.signerName} on ${contract.signedAt}` : "Not yet signed."}
            </p>
          </div>
        </ClientModal>
      )}

      {preview === "invoice" && invoice && (
        <ClientModal onClose={() => setPreview(null)} title={`Invoice ${invoice.number} — read-only`}>
          <p className="ecc-display text-3xl mt-2" style={{ color: C.ink }}>{formatCurrency(invoice.total)}</p>
          <p className="text-sm mt-1" style={{ color: C.charcoal }}>{invoice.kind} invoice</p>
          <div className="mt-5 space-y-3">
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
          <div className="space-y-1.5 mt-5 text-sm">
            <div className="flex justify-between"><span style={{ color: C.taupe }}>Paid</span><span style={{ color: C.ink }}>{formatCurrency(invoice.amountPaid)}</span></div>
            <div className="flex justify-between font-medium"><span style={{ color: C.taupe }}>Balance due</span><span style={{ color: C.ink }}>{formatCurrency(invoice.balanceDue)}</span></div>
          </div>
        </ClientModal>
      )}
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
  const address = portal?.customLocation || "Dallas, TX";
  const mapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(address)}`;
  return (
    <Card className="p-5">
      <p className="ecc-display text-3xl mb-4" style={{ color: C.ink }}>Session Details</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <InfoCard label="Date" value={session?.sessionDate || portal?.customDate || "Awaiting selection"} />
        <InfoCard label="Time" value={session?.sessionTime || portal?.customTime || "Awaiting selection"} />
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="block">
          <div className="rounded-2xl p-4 h-full" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>Location</p>
              <MapPin size={13} color={C.forest} />
            </div>
            <p className="text-sm mt-2 font-medium underline" style={{ color: C.forest }}>{address}</p>
            <p className="text-[11px] mt-1" style={{ color: C.taupe }}>Tap to open in Maps</p>
          </div>
        </a>
      </div>
      <div className="mt-5 rounded-2xl p-4" style={{ background: C.bg }}>
        <p className="text-sm leading-7" style={{ color: C.ink }}>{portal?.sessionNotes}</p>
      </div>
    </Card>
  );
}

function VisionPage({ selectedBundle }) {
  const portal = selectedBundle.portal;
  const images = portal?.visionImages || [];
  const [mode, setMode] = useState("slideshow");
  const [slide, setSlide] = useState(0);

  if (!(portal?.sessionVision || portal?.propList?.length || images.length)) {
    return <LockedCard body="The styling board will appear here once planning is underway." />;
  }

  const total = Math.max(images.length, 1);
  const active = images[slide % total];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="ecc-display text-3xl" style={{ color: C.ink }}>Vision Board</p>
        {images.length > 0 && (
          <button onClick={() => setMode(mode === "slideshow" ? "grid" : "slideshow")} className="text-sm underline" style={{ color: C.forest }}>
            {mode === "slideshow" ? "View as grid" : "View as slideshow"}
          </button>
        )}
      </div>

      {images.length === 0 ? (
        <Card className="p-10 text-center">
          <ImageIcon size={24} color={C.taupe} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: C.charcoal }}>Your studio hasn't added inspiration images yet — check back soon.</p>
        </Card>
      ) : mode === "slideshow" ? (
        <Card className="overflow-hidden">
          <button onClick={() => setMode("grid")} className="w-full aspect-[4/5] flex items-center justify-center relative overflow-hidden" style={{ background: "#000" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={active?.url} alt="" className="w-full h-full object-cover" />
            <span className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.45)", color: "#fff" }}>
              {(slide % total) + 1} / {total} · tap for full board
            </span>
          </button>
          <div className="flex items-center justify-between p-3">
            <button onClick={(event) => { event.stopPropagation(); setSlide((s) => (s - 1 + total) % total); }}><ChevronLeft size={18} color={C.charcoal} /></button>
            <p className="text-xs" style={{ color: C.taupe }}>Swipe through inspiration, or view the full Pinterest-style board</p>
            <button onClick={(event) => { event.stopPropagation(); setSlide((s) => (s + 1) % total); }}><ChevronRight size={18} color={C.charcoal} /></button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((image) => (
            <div key={image.id} className="aspect-square rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}

      <Card className="p-5">
        <p className="text-sm leading-7 italic" style={{ color: C.ink }}>{portal.sessionVision}</p>
      </Card>
      {(portal.propList || []).length > 0 && (
        <Card className="p-5">
          <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.taupe }}>Prop List</p>
          <div className="space-y-2">
            {portal.propList.filter(Boolean).map((prop, index) => (
              <div key={`${prop}-${index}`} className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
                <Circle size={6} color={C.taupe} fill={C.taupe} />
                <span className="text-sm" style={{ color: C.ink }}>{prop}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

function PlanPage({ selectedBundle }) {
  const session = selectedBundle.session;
  const customSteps = selectedBundle.portal?.planPrepSteps || [];
  const steps = customSteps.length ? customSteps.map((step) => ({
    label: step.title,
    done: step.status === "complete",
    active: step.status === "active",
    date: step.body,
  })) : [
    { label: "Session Booked", done: selectedBundle.booking.isBooked, date: session?.projectCreatedAt || "" },
    { label: "Planning & Inspiration", done: Boolean(selectedBundle.portal?.sessionVision), date: "In progress" },
    { label: "Session Day", done: session?.status === "completed", date: session?.sessionDate || "Awaiting selection" },
    { label: "Gallery Delivery", done: session?.galleryStatus === "delivered", date: "2-3 weeks after session" },
  ];

  return (
    <div className="space-y-4">
      <p className="ecc-display text-3xl" style={{ color: C.ink }}>Plan &amp; Prep</p>
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-2" style={{ color: C.taupe }}>Prep Notes</p>
        <p className="text-sm leading-7" style={{ color: C.ink }}>
          {selectedBundle.portal?.sessionNotes || "Hydrate well and get plenty of rest the night before your session."}
        </p>
      </Card>
      <Card className="p-5">
        <p className="text-[10px] uppercase tracking-[0.3em] mb-3" style={{ color: C.taupe }}>What's Next</p>
        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.label} className="flex items-start gap-3">
              {step.done ? <CheckCircle2 size={16} color={C.forest} className="mt-0.5" /> : <Circle size={16} color={step.active ? C.forest : C.taupe} className="mt-0.5" />}
              <div>
                <p className="text-sm" style={{ color: C.ink }}>{step.label}</p>
                <p className="text-xs leading-5" style={{ color: C.taupe }}>{step.date}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


function GalleryPage({ selectedBundle }) {
  const session = selectedBundle.session;
  const delivered = session?.galleryStatus === "delivered";
  const galleryLink = selectedBundle.portal?.galleryLink;

  if (!delivered) {
    return (
      <div className="space-y-4">
        <p className="ecc-display text-3xl" style={{ color: C.ink }}>Gallery</p>
        <LockedCard body="Your gallery will be available here 2-3 weeks after your session." />
      </div>
    );
  }

  if (!galleryLink?.url) {
    return (
      <div className="space-y-4">
        <p className="ecc-display text-3xl" style={{ color: C.ink }}>Your Gallery</p>
        <Card className="p-10 text-center">
          <ImageIcon size={24} color={C.taupe} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: C.charcoal }}>Marked delivered, but the gallery link hasn't been added yet — check back soon.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="ecc-display text-3xl" style={{ color: C.ink }}>Your Gallery</p>
      <LinkPreviewCard
        link={galleryLink}
        fallbackTitle="Your Gallery"
        helperText="Preview image is pulled from the gallery link when Pixieset exposes one."
      />
      <a href={galleryLink.url} target="_blank" rel="noreferrer" className="w-full block text-center py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
        Open Gallery
      </a>
      {selectedBundle.portal?.printStoreLink && (
        <a href={selectedBundle.portal.printStoreLink} target="_blank" rel="noreferrer" className="w-full block text-center py-2.5 rounded-xl text-sm font-medium" style={{ background: C.cream, color: C.ink }}>
          Print Your Album / Shop Your Gallery
        </a>
      )}
    </div>
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
  const [payingInvoice, setPayingInvoice] = useState(null);

  return (
    <div className="space-y-4">
      {selectedBundle.invoices.length === 0 && <LockedCard body="Payments will appear here once your booking invoice is ready." />}
      {selectedBundle.invoices.map((invoice) => (
        <Card key={invoice.id} className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="ecc-display text-3xl" style={{ color: C.ink }}>{invoice.number}</p>
              <p className="text-sm mt-1" style={{ color: C.charcoal }}>{invoice.kind} invoice{invoice.dueDate ? ` • due ${invoice.dueDate}` : ""}</p>
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
            <button onClick={() => setPayingInvoice(invoice)} className="mt-4 px-4 py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
              Pay Now — {formatCurrency(invoice.balanceDue)}
            </button>
          )}
        </Card>
      ))}

      {payingInvoice && (
        <PayNowModal
          invoice={payingInvoice}
          onClose={() => setPayingInvoice(null)}
          onConfirm={(method) => { actions.recordPayment(payingInvoice.id, payingInvoice.balanceDue, method); setPayingInvoice(null); }}
        />
      )}
    </div>
  );
}

function PayNowModal({ invoice, onClose, onConfirm }) {
  const [method, setMethod] = useState("card");
  return (
    <ClientModal onClose={onClose} title={`Pay ${invoice.number}`}>
      <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{formatCurrency(invoice.balanceDue)}</p>
      <p className="text-sm mt-1 mb-5" style={{ color: C.charcoal }}>Balance due on {invoice.number}</p>

      <div className="space-y-2 mb-5">
        <button onClick={() => setMethod("card")} className="w-full flex items-center justify-between p-3 rounded-xl text-left" style={{ border: `1px solid ${method === "card" ? C.forest : C.line}`, background: method === "card" ? C.bg : "#fff" }}>
          <span className="flex items-center gap-2 text-sm" style={{ color: C.ink }}><CreditCard size={16} color={C.taupe} /> Card via Stripe</span>
          {method === "card" && <Check size={14} color={C.forest} />}
        </button>
        <button onClick={() => setMethod("zelle")} className="w-full flex items-center justify-between p-3 rounded-xl text-left" style={{ border: `1px solid ${method === "zelle" ? C.forest : C.line}`, background: method === "zelle" ? C.bg : "#fff" }}>
          <span className="flex items-center gap-2 text-sm" style={{ color: C.ink }}><Send size={16} color={C.taupe} /> Zelle</span>
          {method === "zelle" && <Check size={14} color={C.forest} />}
        </button>
      </div>

      {method === "zelle" ? (
        <div className="rounded-xl p-4 mb-4" style={{ background: C.bg }}>
          <p className="text-sm" style={{ color: C.ink }}>Send {formatCurrency(invoice.balanceDue)} to <strong>payments@eccreativestudios.com</strong>, then confirm below once sent.</p>
        </div>
      ) : (
        <p className="text-xs mb-4" style={{ color: C.taupe }}>This demo doesn't process a real card — confirming marks the invoice paid the same way a completed Stripe checkout would.</p>
      )}

      <button onClick={() => onConfirm(method === "card" ? "Card" : "Zelle")} className="w-full py-3 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
        {method === "card" ? "Continue to secure checkout" : "I've sent the Zelle payment"}
      </button>
    </ClientModal>
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
