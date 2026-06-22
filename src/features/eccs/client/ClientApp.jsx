"use client";

import React, { useState } from "react";
import {
  Home, Inbox, Users, FolderKanban, Camera, Calendar as CalendarIcon,
  FileText, PenLine, Receipt, CreditCard, Mail, Workflow, LayoutTemplate,
  Settings, Palette, UserCog, Bell, HelpCircle, Search, Plus, Menu, X,
  ChevronRight, ChevronDown, Check, CheckCircle2, SlidersHorizontal,
  Image as ImageIcon, MessageCircle, MapPin, CloudSun, ListChecks,
  Download, ArrowRight, Lock, Sparkles, ClipboardList, Send, ChevronLeft,
  Circle, Dot, MoreHorizontal
} from "lucide-react";
import { C } from "../lib/brand";
import { docLabel, docTone } from "../lib/pipeline";
import { SARAH, getSessionInfo } from "../lib/mock-data";
import { Card, Pill, StatusLight } from "../components/ui";
import DocModal from "../components/DocModal";

const NAV_CLIENT = [
  { key: "overview", label: "Overview", icon: Home },
  { key: "details", label: "Session Details", icon: ClipboardList },
  { key: "vision", label: "Vision Board", icon: Sparkles },
  { key: "documents", label: "Documents", icon: FileText },
  { key: "messages", label: "Messages", icon: MessageCircle },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "plan", label: "Plan & Prep", icon: ListChecks },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
];

export default function ClientApp(props) {
  const [page, setPage] = useState("overview");
  const [drawer, setDrawer] = useState(false);
  const go = (p) => { setPage(p); setDrawer(false); };

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 44px)" }}>
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 px-4 py-6" style={{ background: C.charcoal }}>
        <ClientSidebar page={page} go={go} />
      </aside>

      {drawer && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 px-4 py-6 overflow-y-auto" style={{ background: C.charcoal }}>
            <ClientSidebar page={page} go={go} onClose={() => setDrawer(false)} />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setDrawer(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <div className="flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <button className="md:hidden" onClick={() => setDrawer(true)}><Menu size={20} color={C.ink} /></button>
          <p className="text-sm flex-1" style={{ color: C.charcoal }}>Welcome, Sarah</p>
          <Bell size={18} color={C.charcoal} />
        </div>
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl lg:max-w-4xl mx-auto">
          {page === "overview" && <ClientOverview {...props} go={go} />}
          {page === "details" && (props.status.projectCreated ? <ClientDetails portal={props.portal} /> : <PortalLocked />)}
          {page === "vision" && (props.status.projectCreated ? <ClientVisionBoard portal={props.portal} /> : <PortalLocked />)}
          {page === "documents" && <ClientDocuments {...props} />}
          {page === "messages" && (props.status.projectCreated ? <ClientMessages messages={props.messages} setMessages={props.setMessages} /> : <PortalLocked body="Direct messaging opens once your session is booked. Need something before then? Use the message box on your quote or contract." />)}
          {page === "payments" && <ClientPayments {...props} />}
          {page === "plan" && (props.status.projectCreated ? <ClientPlan /> : <PortalLocked />)}
          {page === "gallery" && <ClientGallery {...props} />}
        </div>
      </main>

      {/* mobile bottom tab bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around py-2" style={{ background: "#fff", borderTop: `1px solid ${C.line}` }}>
        {[NAV_CLIENT[0], NAV_CLIENT[3], NAV_CLIENT[4], NAV_CLIENT[5]].map((it) => {
          const Icon = it.icon;
          const active = page === it.key;
          return (
            <button key={it.key} onClick={() => go(it.key)} className="flex flex-col items-center gap-0.5 px-2">
              <Icon size={18} color={active ? C.forest : C.taupe} />
              <span className="text-[10px]" style={{ color: active ? C.forest : C.taupe }}>{it.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ClientSidebar({ page, go, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <p className="ecc-display text-white text-xl leading-none">EC</p>
          <p className="text-[10px] uppercase tracking-widest" style={{ color: C.taupe }}>Creative Studios</p>
        </div>
        {onClose && <button onClick={onClose}><X size={18} color={C.taupe} /></button>}
      </div>
      <nav className="space-y-0.5 flex-1">
        {NAV_CLIENT.map((it) => {
          const Icon = it.icon;
          const active = page === it.key;
          return (
            <button key={it.key} onClick={() => go(it.key)} className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm"
              style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.cream }}>
              <Icon size={16} /> {it.label}
            </button>
          );
        })}
      </nav>
      <div className="flex items-center gap-2 pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: C.taupe, color: C.charcoal }}>SG</div>
        <div className="text-xs">
          <p className="text-white">Sarah Garcia</p>
          <p style={{ color: C.taupe }}>Maternity Session</p>
        </div>
      </div>
    </>
  );
}

const AVAILABLE_SLOTS = ["Sat, July 18 · 9:00 AM", "Sun, July 19 · 4:00 PM", "Mon, July 20 · 4:30 PM", "Wed, July 22 · 10:00 AM"];

function ClientOverview({ stageIndex, status, goToStage, logActivity, go, portal, setPortal }) {
  const session = getSessionInfo(portal);
  const [picked, setPicked] = useState(session.date + " · " + session.time);

  const confirmDate = () => {
    const [rawDate, rawTime] = picked.split("·").map((part) => part.trim());
    const dateWithoutWeekday = rawDate.replace(/^[A-Za-z]+,\s*/, "");

    setPortal && setPortal((current) => ({
      ...current,
      useProjectDetails: false,
      customDate: dateWithoutWeekday ? `${dateWithoutWeekday}, 2026` : current.customDate,
      customTime: rawTime || current.customTime,
    }));

    goToStage(7);
    logActivity && logActivity(`${SARAH.name} selected ${picked} — session booked`);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="ecc-display text-cream text-sm italic mb-1" style={{ color: C.taupe }}>Welcome back,</p>
          <p className="ecc-display text-3xl" style={{ color: C.ink }}>{SARAH.name}</p>
          <p className="text-sm" style={{ color: C.charcoal }}>{SARAH.sessionType}</p>
          {status.projectCreated && (
            <div className="text-sm mt-2 space-y-1" style={{ color: C.charcoal }}>
              <p className="flex items-center gap-2"><CalendarIcon size={14} /> {session.date}</p>
              <p className="flex items-center gap-2"><MapPin size={14} /> {session.location}</p>
            </div>
          )}
        </div>
        <Card className="p-4 w-full sm:w-56">
          <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: C.taupe }}>Session Status</p>
          <p className="ecc-display text-xl" style={{ color: C.ink }}>
            <StatusLight tone={status.statusLight} label={status.sessionStatus} />
          </p>
        </Card>
      </div>

      {!status.projectCreated && stageIndex < 6 && (
        <div className="px-4 py-3 rounded-xl text-sm" style={{ background: "#fbf1e6", color: C.ink }}>
          Your session isn't booked yet. Sign your contract and pay your invoice to secure your date — head to Documents below.
        </div>
      )}

      {stageIndex === 6 && (
        <Card className="p-5" style={{ border: `1px solid ${C.taupe}` }}>
          <p className="ecc-display text-xl mb-1" style={{ color: C.ink }}>Pick your date</p>
          <p className="text-sm mb-4" style={{ color: C.charcoal }}>Deposit's in and your contract is signed — last step. Choose a slot to lock in your session.</p>
          <div className="space-y-2 mb-4">
            {AVAILABLE_SLOTS.map((slot) => (
              <label key={slot} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm cursor-pointer" style={{ border: `1px solid ${picked === slot ? C.forest : C.line}`, background: picked === slot ? C.cream : "#fff" }}>
                <input type="radio" checked={picked === slot} onChange={() => setPicked(slot)} />
                {slot}
              </label>
            ))}
          </div>
          <button onClick={confirmDate} className="w-full py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
            Confirm date & secure my session
          </button>
        </Card>
      )}

      {status.projectCreated && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs uppercase tracking-widest flex items-center gap-2" style={{ color: C.taupe }}><Sparkles size={14} /> Vision Board</p>
            <button onClick={() => go("vision")} className="text-xs underline" style={{ color: C.forest }}>View Full Board</button>
          </div>
          <VisionGrid compact images={portal.visionImages} />
          <p className="text-sm mt-3 line-clamp-2" style={{ color: C.charcoal }}>{portal.sessionVision}</p>
        </Card>
      )}

      {status.projectCreated && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: C.taupe }}><CloudSun size={14} /> Weather Forecast</p>
            <p className="ecc-display text-2xl" style={{ color: C.ink }}>77°F</p>
            <p className="text-xs" style={{ color: C.charcoal }}>Partly Cloudy · {session.location}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-widest mb-2 flex items-center gap-2" style={{ color: C.taupe }}><MapPin size={14} /> Location</p>
            <p className="text-sm font-medium" style={{ color: C.ink }}>{SARAH.studio}</p>
            <p className="text-xs" style={{ color: C.charcoal }}>{session.location}</p>
          </Card>
        </div>
      )}

      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>My Documents</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { l: "Quote", st: status.quote, k: "quote" },
            { l: "Contract", st: status.contract, k: "contract" },
            { l: "Invoice", st: status.invoice, k: "invoice" },
            { l: "Inquiry Form", st: "received", k: "inquiry" },
          ].map((d) => (
            <button key={d.k} onClick={() => go("documents")} className="p-3 rounded-xl text-left" style={{ border: `1px solid ${C.line}` }}>
              <FileText size={14} color={C.taupe} />
              <p className="text-xs mt-1.5 font-medium" style={{ color: C.ink }}>{d.l}</p>
              <Pill tone={docTone(d.st)}>{docLabel(d.k, d.st) || d.st}</Pill>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

const PortalLocked = ({ body }) => (
  <Card className="p-10 text-center">
    <Lock size={24} color={C.taupe} className="mx-auto mb-3" />
    <p className="ecc-display text-2xl mb-2" style={{ color: C.ink }}>Available once you're booked</p>
    <p className="text-sm max-w-sm mx-auto" style={{ color: C.charcoal }}>{body || "This unlocks the moment your quote's accepted, contract's signed, deposit's paid, and your date is picked."}</p>
  </Card>
);

function VisionGrid({ compact, images = [] }) {
  const tiles = compact ? 3 : 7;
  const placeholders = Math.max(0, tiles - images.length);
  return (
    <div className="grid grid-cols-3 gap-2" style={{ gridAutoRows: compact ? undefined : "90px" }}>
      {images.slice(0, tiles).map((img, i) => (
        <div
          key={img.id || i}
          className={compact ? "aspect-square rounded-xl overflow-hidden" : "rounded-xl overflow-hidden"}
          style={{ gridRow: !compact && i % 3 === 0 ? "span 2" : undefined }}
        >
          <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.opacity = 0.2; }} />
        </div>
      ))}
      {Array.from({ length: placeholders }).map((_, i) => (
        <div
          key={"ph" + i}
          className={compact ? "aspect-square rounded-xl flex items-center justify-center" : "rounded-xl flex items-center justify-center"}
          style={{ background: `linear-gradient(135deg, ${C.cream}, ${C.taupe})`, gridRow: !compact && (images.length + i) % 3 === 0 ? "span 2" : undefined }}
        >
          <ImageIcon size={20} color="#fff" />
        </div>
      ))}
    </div>
  );
}

function ClientDetails({ portal }) {
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Session Details</p>
      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>Session Notes</p>
        <p className="text-sm" style={{ color: C.charcoal }}>{portal.sessionNotes}</p>
      </Card>
      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>Prop List</p>
        <ul className="text-sm space-y-1" style={{ color: C.charcoal }}>
          {portal.propList.filter(Boolean).map((p) => (
            <li key={p} className="flex items-center gap-2"><Dot size={16} color={C.taupe} /> {p}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function ClientVisionBoard({ portal }) {
  const [mode, setMode] = useState("slideshow"); // 'slideshow' | 'grid'
  const [slide, setSlide] = useState(0);
  const images = portal.visionImages;
  const TOTAL = Math.max(images.length, 7);
  const activeImg = images[slide % Math.max(images.length, 1)];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Vision Board</p>
        <button onClick={() => setMode(mode === "slideshow" ? "grid" : "slideshow")} className="text-xs underline" style={{ color: C.forest }}>
          {mode === "slideshow" ? "View as grid" : "View as slideshow"}
        </button>
      </div>

      {mode === "slideshow" ? (
        <Card className="overflow-hidden">
          <button
            onClick={() => setMode("grid")}
            className="w-full aspect-[4/5] flex items-center justify-center relative overflow-hidden"
            style={{ background: activeImg ? "#000" : `linear-gradient(135deg, ${C.cream}, ${C.taupe}, ${C.charcoal})` }}
          >
            {activeImg ? <img src={activeImg.url} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={40} color="#fff" />}
            <span className="absolute bottom-3 right-3 text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,0,0,0.4)", color: "#fff" }}>{slide + 1} / {TOTAL} · tap for full board</span>
          </button>
          <div className="flex items-center justify-between p-3">
            <button onClick={(e) => { e.stopPropagation(); setSlide((s) => (s - 1 + TOTAL) % TOTAL); }}><ChevronLeft size={18} color={C.charcoal} /></button>
            <p className="text-xs" style={{ color: C.taupe }}>Swipe through inspiration, or view the full Pinterest-style board</p>
            <button onClick={(e) => { e.stopPropagation(); setSlide((s) => (s + 1) % TOTAL); }}><ChevronRight size={18} color={C.charcoal} /></button>
          </div>
        </Card>
      ) : (
        <VisionGrid images={images} />
      )}

      <Card className="p-5">
        <p className="text-sm italic" style={{ color: C.charcoal }}>{portal.sessionVision}</p>
      </Card>
    </div>
  );
}

function ClientDocuments({ status, goToStage }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Documents</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { k: "quote", l: "Quote " + SARAH.quoteId, st: status.quote },
          { k: "contract", l: "Contract " + SARAH.contractId, st: status.contract },
          { k: "invoice", l: "Invoice " + SARAH.invoiceId, st: status.invoice },
          { k: "inquiry", l: "Inquiry Form", st: "received" },
        ].map((d) => (
          <Card key={d.k} className="p-4 cursor-pointer" onClick={() => setOpen(d.k)}>
            <FileText size={16} color={C.taupe} />
            <p className="text-sm font-medium mt-2" style={{ color: C.ink }}>{d.l}</p>
            <Pill tone={docTone(d.st)}>{docLabel(d.k, d.st) || d.st}</Pill>
          </Card>
        ))}
      </div>
      {open && <DocModal kind={open} onClose={() => setOpen(null)} status={status} goToStage={goToStage} />}
    </div>
  );
}

function ClientMessages({ messages, setMessages }) {
  const [draft, setDraft] = useState("");
  const send = () => {
    if (!draft.trim()) return;
    setMessages((m) => [...m, { from: "client", text: draft }]);
    setDraft("");
  };
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Messages</p>
      <Card className="p-5 flex flex-col" style={{ height: 420 }}>
        <div className="flex-1 overflow-y-auto space-y-3 mb-3 ecc-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "client" ? "justify-end" : "justify-start"}`}>
              <div className="px-3 py-2 rounded-2xl text-sm max-w-[75%]" style={{ background: m.from === "client" ? C.forest : C.cream, color: m.from === "client" ? "#fff" : C.ink }}>
                {m.text}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Type your message…" className="flex-1 px-3 py-2 rounded-full text-sm" style={{ border: `1px solid ${C.line}` }} />
          <button onClick={send} className="px-4 rounded-full text-white flex items-center gap-1" style={{ background: C.forest }}><Send size={14} /></button>
        </div>
      </Card>
    </div>
  );
}

function ClientPayments({ status, balancePaid, setBalancePaid }) {
  const pct = status.invoice === "deposit_paid" ? (balancePaid ? 100 : 41) : 0;
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Payments</p>
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm" style={{ color: C.charcoal }}>Deposit Paid</p>
            <p className="ecc-display text-2xl" style={{ color: C.ink }}>${status.invoice === "deposit_paid" ? SARAH.deposit : 0}.00</p>
          </div>
          <div>
            <p className="text-sm" style={{ color: C.charcoal }}>Balance</p>
            <p className="ecc-display text-2xl" style={{ color: C.ink }}>${balancePaid ? 0 : SARAH.total - SARAH.deposit}.00</p>
          </div>
        </div>
        <div className="h-2 rounded-full mb-4" style={{ background: C.line }}>
          <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: C.forest }} />
        </div>
        {status.invoice === "deposit_paid" && !balancePaid && (
          <button onClick={() => setBalancePaid(true)} className="w-full py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>Pay Balance — ${SARAH.total - SARAH.deposit}.00</button>
        )}
        {status.invoice !== "deposit_paid" && <Pill>Deposit invoice not yet sent</Pill>}
        {balancePaid && <Pill tone="done">Paid in full</Pill>}
        <p className="text-xs mt-3" style={{ color: C.taupe }}>Secure payments powered by Stripe · Zelle also accepted</p>
      </Card>
    </div>
  );
}

function ClientPlan() {
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Plan & Prep</p>
      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>Prep Tip</p>
        <p className="text-sm" style={{ color: C.charcoal }}>Hydrate well and get plenty of rest the night before your session.</p>
      </Card>
      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>What's Next</p>
        <div className="space-y-3 text-sm">
          {[
            { l: "Session Booked", d: "June 18, 2026", done: true },
            { l: "Planning & Inspiration", d: "In Progress", done: false },
            { l: "Session Day", d: "July 20, 2026", done: false },
            { l: "Gallery Delivery", d: "2–3 weeks after session", done: false },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-2">
              {s.done ? <CheckCircle2 size={16} color={C.forest} /> : <Circle size={16} color={C.taupe} />}
              <div><p style={{ color: C.ink }}>{s.l}</p><p className="text-xs" style={{ color: C.taupe }}>{s.d}</p></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function ClientGallery({ status }) {
  if (status.gallery !== "delivered") {
    return (
      <div className="space-y-4">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Gallery</p>
        <Card className="p-10 text-center">
          <Lock size={28} color={C.taupe} className="mx-auto mb-3" />
          <p className="text-sm" style={{ color: C.charcoal }}>Your gallery will be available here 2–3 weeks after your session.</p>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Your Gallery</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.taupe}, ${C.charcoal})` }}>
            <ImageIcon size={18} color="#fff" />
          </div>
        ))}
      </div>
      <button className="w-full py-2.5 rounded-xl text-sm font-medium text-white flex items-center justify-center gap-2" style={{ background: C.forest }}>
        <Download size={14} /> Download Full Gallery
      </button>
    </div>
  );
}
