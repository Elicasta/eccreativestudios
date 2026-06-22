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
import { STAGES, docLabel, docTone } from "../lib/pipeline";
import { SARAH, DEMO_ROWS, getSessionInfo } from "../lib/mock-data";
import { Avatar, Card, EmptyState, Pill, RowMenu, SectionLabel, StatusLight } from "../components/ui";
import DocModal from "../components/DocModal";

const NAV_ADMIN = [
  { group: null, items: [{ key: "dashboard", label: "Dashboard", icon: Home }, { key: "notifications", label: "Notifications", icon: Bell }] },
  {
    group: "Clients",
    items: [
      { key: "inquiries", label: "Inquiries", icon: Inbox },
      { key: "clients", label: "Clients", icon: Users },
      { key: "projects", label: "Projects", icon: FolderKanban },
      { key: "portaleditor", label: "Portal Editor", icon: ImageIcon },
      { key: "sessions", label: "Sessions", icon: Camera },
      { key: "calendar", label: "Calendar", icon: CalendarIcon },
    ],
  },
  {
    group: "Sales",
    items: [
      { key: "quotes", label: "Quotes", icon: FileText },
      { key: "contracts", label: "Contracts", icon: PenLine },
      { key: "invoices", label: "Invoices", icon: Receipt },
      { key: "payments", label: "Payments", icon: CreditCard },
    ],
  },
  {
    group: "Communication",
    items: [
      { key: "emaillogs", label: "Email Logs", icon: Mail },
      { key: "emailmarketing", label: "Email Marketing", icon: Send },
      { key: "social", label: "Social Messaging", icon: MessageCircle },
      { key: "contactforms", label: "Contact Forms", icon: ClipboardList },
      { key: "workflows", label: "Workflows", icon: Workflow },
      { key: "templates", label: "Templates", icon: LayoutTemplate },
    ],
  },
  {
    group: "Studio",
    items: [
      { key: "settings", label: "Settings", icon: Settings },
      { key: "branding", label: "Branding", icon: Palette },
      { key: "team", label: "Team", icon: UserCog },
    ],
  },
];

const BOTTOM_NAV_ADMIN = [
  { key: "dashboard", label: "Home", icon: Home },
  { key: "clients", label: "Clients", icon: Users },
  { key: "inquiries", label: "Inquiries", icon: Inbox },
  { key: "notifications", label: "Alerts", icon: Bell },
  { key: "__more", label: "More", icon: Menu },
];

export default function AdminApp(props) {
  const [page, setPage] = useState("dashboard");
  const [drawer, setDrawer] = useState(false);
  const projectCreated = props.status.projectCreated;

  const go = (p) => {
    setPage(p);
    setDrawer(false);
  };

  return (
    <div className="flex" style={{ minHeight: "calc(100vh - 44px)" }}>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex md:flex-col w-64 xl:w-72 shrink-0 px-4 py-6"
        style={{ background: C.charcoal }}
      >
        <SidebarContent nav={NAV_ADMIN} page={page} go={go} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-72 px-4 py-6 overflow-y-auto" style={{ background: C.charcoal }}>
            <SidebarContent nav={NAV_ADMIN} page={page} go={go} onClose={() => setDrawer(false)} />
          </div>
          <div className="flex-1" style={{ background: "rgba(0,0,0,0.4)" }} onClick={() => setDrawer(false)} />
        </div>
      )}

      <main className="flex-1 min-w-0 pb-16 md:pb-0">
        <AdminTopbar onMenu={() => setDrawer(true)} title={NAV_ADMIN.flatMap((g) => g.items).find((i) => i.key === page)?.label || "Dashboard"} />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1440px] mx-auto">
          {page === "dashboard" && <AdminDashboard {...props} onOpenProject={() => go("project")} go={go} />}
          {page === "notifications" && <AdminNotifications {...props} onOpenSarah={() => go("project")} />}
          {page === "inquiries" && <AdminListPage title="Inquiries" icon={Inbox} {...props} variant="inquiries" onOpenSarah={() => go("project")} columns={["Name", "Session Type", "Budget", "Received"]} sarahCols={[SARAH.name, SARAH.sessionType, SARAH.budget, "May 30, 2026"]} sarahStatus={props.stageIndex === 0 ? "Pending approval" : STAGES[props.stageIndex].label} sarahQuickAction={props.stageIndex === 0 ? { label: "Approve", onClick: () => props.goToStage(1) } : null} />}
          {page === "clients" && <AdminListPage title="Clients" icon={Users} {...props} onOpenSarah={() => go("project")} columns={["Name", "Session Type", "Budget", "Received"]} sarahCols={[SARAH.name, SARAH.sessionType, SARAH.budget, "May 30, 2026"]} sarahStatus="Active Client" />}
          {page === "projects" && <AdminProjectsFolders {...props} onOpenSarah={() => go("project")} />}
          {page === "portaleditor" && <AdminPortalEditor {...props} />}
          {page === "sessions" && <AdminSessions {...props} onOpenSarah={() => go("project")} />}
          {page === "calendar" && <AdminCalendar {...props} onOpenSarah={() => go("project")} />}
          {page === "quotes" && <AdminListPage title="Quotes" icon={FileText} {...props} variant="quotes" onOpenSarah={() => go("project")} columns={["Client", "Package", "Amount", "Sent"]} sarahCols={[SARAH.name, SARAH.package, "$" + SARAH.total, "Jun 1, 2026"]} sarahStatus={docLabel("quote", props.status.quote)} sarahQuickAction={props.status.quote === "sent" ? { label: "Mark Accepted", onClick: () => props.goToStage(2) } : null} />}
          {page === "contracts" && <AdminListPage title="Contracts" icon={PenLine} {...props} variant="contracts" onOpenSarah={() => go("project")} columns={["Client", "Contract", "Session Type", "Sent"]} sarahCols={[SARAH.name, SARAH.contractId, SARAH.sessionType, "Jun 10, 2026"]} sarahStatus={docLabel("contract", props.status.contract)} sarahQuickAction={props.status.contract === "sent" ? { label: "Mark Signed", onClick: () => props.goToStage(4) } : null} />}
          {page === "invoices" && <AdminListPage title="Invoices" icon={Receipt} {...props} variant="invoices" onOpenSarah={() => go("project")} columns={["Client", "Invoice", "Amount", "Due"]} sarahCols={[SARAH.name, SARAH.invoiceId, "$" + SARAH.deposit + " deposit", "Jul 5, 2026"]} sarahStatus={docLabel("invoice", props.status.invoice)} sarahQuickAction={props.status.invoice === "sent" ? { label: "Mark Paid", onClick: () => props.goToStage(6) } : null} />}
          {page === "payments" && <AdminListPage title="Payments" icon={CreditCard} {...props} onOpenSarah={() => go("project")} columns={["Client", "Method", "Amount", "Date"]} sarahCols={[SARAH.name, "Stripe", "$" + SARAH.deposit, "Jun 18, 2026"]} sarahStatus={props.status.invoice === "deposit_paid" ? "Paid" : "Pending"} />}
          {page === "emaillogs" && <PlaceholderPage title="Email Logs" body="Every automated and manual email to clients will log here once Resend is wired up. Not part of this skeleton." />}
          {page === "emailmarketing" && <AdminEmailMarketing />}
          {page === "social" && <AdminSocialMessaging />}
          {page === "contactforms" && <AdminContactForms />}
          {page === "workflows" && <PlaceholderPage title="Workflows" body="Automation rules (auto-send prep guide, auto-remind on unpaid invoice) live here in v2. This skeleton moves the pipeline manually instead." />}
          {page === "templates" && <AdminTemplates />}
          {page === "settings" && <PlaceholderPage title="Settings" body="Studio info, tax rates, payment methods, notification preferences." />}
          {page === "branding" && <PlaceholderPage title="Branding" body="Logo, color palette, fonts. The skeleton already runs on the real EC Creative Studios system: charcoal, cream, taupe, blue, forest green." />}
          {page === "team" && <PlaceholderPage title="Team" body="Add Emily and any second shooters or editors with role-based access once auth exists." />}
          {page === "project" && <AdminProjectWorkspace {...props} onBack={() => go("dashboard")} go={go} />}
        </div>
      </main>

      {/* mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex justify-around py-2" style={{ background: C.charcoal }}>
        {BOTTOM_NAV_ADMIN.map((it) => {
          const Icon = it.icon;
          const active = it.key === "__more" ? drawer : page === it.key;
          return (
            <button
              key={it.key}
              onClick={() => (it.key === "__more" ? setDrawer(true) : go(it.key))}
              className="flex flex-col items-center gap-0.5 px-2"
            >
              <Icon size={18} color={active ? "#fff" : C.taupe} />
              <span className="text-[10px]" style={{ color: active ? "#fff" : C.taupe }}>{it.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function SidebarContent({ nav, page, go, onClose }) {
  return (
    <>
      <div className="flex items-center justify-between mb-8 px-1">
        <div>
          <p className="ecc-display text-white text-xl leading-none">EC</p>
          <p className="ecc-body text-[10px] uppercase tracking-widest" style={{ color: C.taupe }}>Creative Studios</p>
        </div>
        {onClose && <button onClick={onClose}><X size={18} color={C.taupe} /></button>}
      </div>
      <nav className="space-y-5 flex-1">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.group && (
              <p className="text-[10px] uppercase tracking-widest mb-1.5 px-2" style={{ color: "rgba(189,167,150,0.7)" }}>
                {g.group}
              </p>
            )}
            <div className="space-y-0.5">
              {g.items.map((it) => {
                const active = page === it.key;
                const Icon = it.icon;
                return (
                  <button
                    key={it.key}
                    onClick={() => go(it.key)}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm"
                    style={{ background: active ? C.forest : "transparent", color: active ? "#fff" : C.cream }}
                  >
                    <Icon size={16} /> {it.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-2 pt-4 mt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ background: C.taupe, color: C.charcoal }}>EC</div>
        <div className="text-xs">
          <p className="text-white">Eli Castaneda</p>
          <p style={{ color: C.taupe }}>Owner</p>
        </div>
      </div>
    </>
  );
}

function AdminTopbar({ onMenu, title }) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
      <button className="md:hidden" onClick={onMenu}><Menu size={20} color={C.ink} /></button>
      <p className="ecc-display text-2xl flex-1" style={{ color: C.ink }}>{title}</p>
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full flex-1 max-w-sm lg:max-w-md" style={{ background: C.cream }}>
        <Search size={14} color={C.charcoal} />
        <span className="text-xs" style={{ color: C.charcoal }}>Search clients, projects, invoices…</span>
      </div>
      <button className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: C.forest }}><Plus size={16} color="#fff" /></button>
      <Bell size={18} color={C.charcoal} />
      <HelpCircle size={18} color={C.charcoal} className="hidden sm:block" />
    </div>
  );
}

function AdminDashboard({ stageIndex, status, activity, onOpenProject, go }) {
  const [tasks, setTasks] = useState([
    { text: "Follow up with 2 inquiries", sub: "Due today", done: false },
    { text: "Send contract to Sarah + Mike", sub: "Completed", done: true },
    { text: "Review gallery for Ashley session", sub: "Due tomorrow", done: false },
    { text: "Send invoice for Project HEIRLOOM", sub: "Due tomorrow", done: false },
  ]);
  const toggle = (i) => setTasks((t) => t.map((x, idx) => (idx === i ? { ...x, done: !x.done } : x)));

  const pipelineCols = [
    { key: "inquiry", label: "Inquiry", count: stageIndex === 0 ? 6 : 5, amt: "$6,200", page: "inquiries" },
    { key: "quote_sent", label: "Quote Sent", count: stageIndex === 1 ? 8 : 7, amt: "$8,950", page: "quotes" },
    { key: "contract_sent", label: "Contract Sent", count: stageIndex === 3 ? 5 : 4, amt: "$6,300", page: "contracts" },
    { key: "booking_ready", label: "Booking Ready", count: [5, 6].includes(stageIndex) ? 4 : 3, amt: "", page: "invoices" },
    { key: "booked", label: "Booked", count: stageIndex >= 7 ? 19 : 18, amt: "", page: "projects" },
  ];
  const sarahInCol = (key) => {
    if (key === "inquiry") return stageIndex === 0;
    if (key === "quote_sent") return stageIndex === 1 || stageIndex === 2;
    if (key === "contract_sent") return stageIndex === 3 || stageIndex === 4;
    if (key === "booking_ready") return stageIndex === 5 || stageIndex === 6;
    if (key === "booked") return stageIndex >= 7;
    return false;
  };

  const statCards = [
    { label: "New Inquiries", value: "5", sub: "+2 this week", page: "inquiries" },
    { label: "Quotes Pending", value: "7", sub: "$8,950", page: "quotes" },
    { label: "Contracts Pending", value: "4", sub: "$6,300", page: "contracts" },
    { label: "Invoices Unpaid", value: "6", sub: "$12,450", warn: true, page: "invoices" },
    { label: "Booking Ready", value: "3", sub: "Sessions", page: "invoices" },
    { label: "Booked Sessions", value: stageIndex >= 7 ? "18" : "17", sub: "This month", page: "projects" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-5">
      <div className="space-y-5 min-w-0">
        <p className="ecc-body text-sm" style={{ color: C.charcoal }}>Good morning, Eli. Here's what's happening with your studio today.</p>

        <div className="rounded-2xl p-8 sm:p-10 relative overflow-hidden" style={{ background: `linear-gradient(120deg, ${C.charcoal}, ${C.ink})` }}>
          <p className="text-[10px] uppercase tracking-widest mb-4" style={{ color: C.taupe }}>EC Creative Studios</p>
          <p className="ecc-display text-2xl sm:text-4xl text-white leading-tight max-w-md">
            You don't just run a business.<br />You build legacy.
          </p>
          <div className="w-10 h-px my-4" style={{ background: C.taupe }} />
          <p className="text-sm italic" style={{ color: C.cream }}>Let's make today intentional.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {statCards.map((s) => (
            <button key={s.label} onClick={() => go(s.page)} className="text-left">
              <Card className="p-4 h-full">
                <p className="text-xs mb-2" style={{ color: C.charcoal }}>{s.label}</p>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>{s.value}</p>
                <p className="text-xs mt-1" style={{ color: s.warn ? C.red : C.taupe }}>{s.sub}</p>
              </Card>
            </button>
          ))}
        </div>

        <Card>
          <SectionLabel>Pipeline Overview — this is your sales pipeline at a glance</SectionLabel>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 p-5 pt-2">
            {pipelineCols.map((col) => (
              <button key={col.key} onClick={() => go(col.page)} className="rounded-xl p-3 text-left" style={{ border: `1px solid ${C.line}` }}>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: C.taupe }}>{col.label}</p>
                <p className="ecc-display text-2xl mb-2" style={{ color: C.ink }}>{col.count}{col.amt && <span className="text-xs ecc-body ml-1" style={{ color: C.charcoal }}>{col.amt}</span>}</p>
                <div className="space-y-0">
                  {sarahInCol(col.key) && (
                    <p className="text-xs px-2 py-1.5 rounded-lg" style={{ background: C.cream, color: C.ink }}>
                      Sarah Garcia <span style={{ color: C.charcoal }}>— Maternity</span>
                    </p>
                  )}
                  {DEMO_ROWS.slice(0, 2).map((r, i) => (
                    <p key={r.name} className="text-xs px-2 py-1.5" style={{ color: C.charcoal, borderTop: i === 0 && !sarahInCol(col.key) ? "none" : `1px solid ${C.line}` }}>{r.name}</p>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-1">
            <p className="ecc-display text-lg" style={{ color: C.ink }}>Recent Inquiries</p>
            <button onClick={() => go("inquiries")} className="text-xs underline" style={{ color: C.forest }}>View all</button>
          </div>
          <div className="px-5 pb-4 pt-3 overflow-x-auto ecc-scrollbar">
            <table className="w-full text-sm min-w-[480px]">
              <thead>
                <tr className="text-left text-xs" style={{ color: C.taupe }}>
                  <th className="pb-2">Name</th><th className="pb-2">Session</th><th className="pb-2">Budget</th><th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {stageIndex === 0 && (
                  <tr className="cursor-pointer" onClick={onOpenProject} style={{ borderTop: `1px solid ${C.line}` }}>
                    <td className="py-2.5 font-medium" style={{ color: C.ink }}>{SARAH.name}</td>
                    <td className="py-2.5" style={{ color: C.charcoal }}>{SARAH.sessionType}</td>
                    <td className="py-2.5" style={{ color: C.charcoal }}>{SARAH.budget}</td>
                    <td className="py-2.5"><Pill tone="new">New</Pill></td>
                  </tr>
                )}
                {DEMO_ROWS.map((r, i) => (
                  <tr key={r.name} style={{ borderTop: i === 0 && stageIndex !== 0 ? "none" : `1px solid ${C.line}` }}>
                    <td className="py-2.5" style={{ color: C.ink }}>{r.name}</td>
                    <td className="py-2.5" style={{ color: C.charcoal }}>{r.type}</td>
                    <td className="py-2.5" style={{ color: C.charcoal }}>{r.budget}</td>
                    <td className="py-2.5"><Pill tone="new">New</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="space-y-5">
        <Card className="p-5">
          <p className="ecc-display text-lg mb-1" style={{ color: C.ink }}>Tasks</p>
          <div>
            {tasks.map((t, i) => (
              <label key={i} className="flex items-start gap-2.5 cursor-pointer py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <input type="checkbox" checked={t.done} onChange={() => toggle(i)} className="mt-0.5" />
                <div>
                  <p className="text-sm" style={{ color: C.ink, textDecoration: t.done ? "line-through" : "none" }}>{t.text}</p>
                  <p className="text-xs" style={{ color: C.taupe }}>{t.sub}</p>
                </div>
              </label>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="ecc-display text-lg" style={{ color: C.ink }}>Today's Calendar</p>
            <button onClick={() => go("calendar")} className="text-xs underline" style={{ color: C.forest }}>Open</button>
          </div>
          <div className="text-sm">
            <div className="flex gap-3 py-2.5"><span style={{ color: C.taupe }} className="w-16 shrink-0">10:00 AM</span><span style={{ color: C.ink }}>Newborn Session – The Garcia Family</span></div>
            <div className="flex gap-3 py-2.5" style={{ borderTop: `1px solid ${C.line}` }}><span style={{ color: C.taupe }} className="w-16 shrink-0">1:00 PM</span><span style={{ color: C.ink }}>Consultation – Amanda + Chris</span></div>
            {stageIndex >= 7 && (
              <button onClick={onOpenProject} className="flex gap-3 w-full text-left py-2.5" style={{ borderTop: `1px solid ${C.line}` }}>
                <span style={{ color: C.taupe }} className="w-16 shrink-0">3:30 PM</span>
                <span style={{ color: C.forest }} className="underline">Maternity Session – Sarah Garcia</span>
              </button>
            )}
            <div className="flex gap-3 py-2.5" style={{ borderTop: `1px solid ${C.line}` }}><span style={{ color: C.taupe }} className="w-16 shrink-0">6:00 PM</span><span style={{ color: C.ink }}>Client Meeting – Brand Campaign</span></div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-1">
            <p className="ecc-display text-lg" style={{ color: C.ink }}>Recent Activity</p>
            <button onClick={() => go("notifications")} className="text-xs underline" style={{ color: C.forest }}>View all</button>
          </div>
          <div className="text-sm">
            {activity.slice(0, 5).map((a, i) => (
              <div key={i} className="flex justify-between gap-2 py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <span style={{ color: C.ink }}>{a.text}</span>
                <span className="text-xs shrink-0" style={{ color: C.taupe }}>{a.time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AdminListPage({ title, icon: Icon, columns, sarahCols, sarahStatus, onOpenSarah, variant, stageIndex, goToStage, status, sarahQuickAction }) {
  const [query, setQuery] = useState("");
  const filteredDemo = DEMO_ROWS.filter((r) => r.name.toLowerCase().includes(query.toLowerCase()));
  const sarahMatches = SARAH.name.toLowerCase().includes(query.toLowerCase());

  const invoiceStats = [
    { label: "Drafts", value: "$1,400" },
    { label: "Completed Payment", value: status?.invoice === "deposit_paid" ? "$8,820" : "$8,070" },
    { label: "Awaiting Payment", value: "$6,300" },
    { label: "Overdue", value: "$1,500", warn: true },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={18} color={C.taupe} />
          <p className="ecc-display text-2xl" style={{ color: C.ink }}>{title}</p>
        </div>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.charcoal }}>
          <Plus size={14} /> Add new
        </button>
      </div>

      {variant === "invoices" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {invoiceStats.map((s) => (
            <Card key={s.label} className="p-4">
              <p className="text-xs mb-2" style={{ color: C.charcoal }}>{s.label}</p>
              <p className="ecc-display text-2xl" style={{ color: s.warn ? C.red : C.ink }}>{s.value}</p>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <div className="flex flex-wrap items-center gap-2 p-4" style={{ borderBottom: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full flex-1 min-w-[160px]" style={{ background: C.cream }}>
            <Search size={14} color={C.charcoal} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}…`}
              className="bg-transparent text-xs outline-none flex-1"
              style={{ color: C.ink }}
            />
          </div>
          {["All statuses", "All dates"].map((f) => (
            <button key={f} className="flex items-center gap-1 px-3 py-2 rounded-full text-xs" style={{ border: `1px solid ${C.line}`, color: C.charcoal }}>
              {f} <ChevronDown size={12} />
            </button>
          ))}
          <Pill tone="info">1 of {DEMO_ROWS.length + 1} wired to live pipeline</Pill>
        </div>

        <div className="overflow-x-auto ecc-scrollbar px-5 pb-2">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs" style={{ color: C.taupe }}>
                {columns.map((c) => <th key={c} className="pb-2 pr-4 pt-4">{c}</th>)}
                <th className="pb-2 pt-4">Status</th>
                <th className="pb-2 pt-4 w-16"></th>
              </tr>
            </thead>
            <tbody>
              {sarahMatches && (
                <tr style={{ background: C.cream }}>
                  <td className="py-3 pl-2 pr-4 rounded-l-lg">
                    <button onClick={onOpenSarah} className="flex items-center gap-2.5 text-left">
                      <Avatar name={SARAH.name} />
                      <span style={{ color: C.ink, fontWeight: 500 }}>{sarahCols[0]}</span>
                    </button>
                  </td>
                  {sarahCols.slice(1).map((c, i) => (
                    <td key={i} className="py-3 pr-4" style={{ color: C.ink }}>{c}</td>
                  ))}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Pill tone="done">{sarahStatus}</Pill>
                      {sarahQuickAction && (
                        <button
                          onClick={sarahQuickAction.onClick}
                          className="text-xs px-2.5 py-1 rounded-full font-medium text-white shrink-0"
                          style={{ background: C.forest }}
                        >
                          {sarahQuickAction.label}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="py-3 rounded-r-lg pr-2">
                    <RowMenu
                      options={[
                        { label: "Open project", onClick: onOpenSarah },
                        ...(sarahQuickAction ? [sarahQuickAction] : []),
                        { label: "Delete", danger: true, onClick: () => {} },
                      ]}
                    />
                  </td>
                </tr>
              )}
              {filteredDemo.map((r) => (
                <tr key={r.name} style={{ borderTop: `1px solid ${C.line}` }}>
                  <td className="py-3 pl-2 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.name} />
                      <span style={{ color: C.charcoal }}>{r.name}</span>
                    </div>
                  </td>
                  {columns.slice(1).map((c, i) => (
                    <td key={i} className="py-3 pr-4" style={{ color: C.charcoal }}>
                      {i === 0 ? r.type : i === 1 ? r.budget : r.received || "—"}
                    </td>
                  ))}
                  <td className="py-3 pr-4"><Pill tone="new">New (demo)</Pill></td>
                  <td className="py-3 pr-2">
                    <RowMenu options={[{ label: "View", onClick: () => {} }, { label: "Delete", danger: true, onClick: () => {} }]} />
                  </td>
                </tr>
              ))}
              {filteredDemo.length === 0 && !sarahMatches && (
                <tr><td colSpan={columns.length + 2} className="py-6 text-center text-sm" style={{ color: C.taupe }}>No results for "{query}"</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-xs px-5 pb-5 pt-3" style={{ color: C.taupe }}>Demo rows are static filler. Sarah Garcia is the one fully wired project — open her record or use the row menu to move her forward.</p>
      </Card>
    </div>
  );
}

const FOLDER_CLIENTS = ["Daniel Andersson", "Jessica Lee", "Ashley Morgan", "Thomas & Rachel", "James Family"];

function AdminProjectsFolders({ status, stageIndex, onOpenSarah }) {
  const [openClient, setOpenClient] = useState(null); // null = folder grid, else client name

  if (openClient) {
    const isSarah = openClient === SARAH.name;
    return (
      <div className="space-y-4">
        <button onClick={() => setOpenClient(null)} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> All Clients</button>
        <div className="flex items-center gap-3">
          <Avatar name={openClient} size={36} />
          <p className="ecc-display text-2xl" style={{ color: C.ink }}>{openClient}</p>
        </div>
        {isSarah && status.projectCreated ? (
          <Card className="p-4 cursor-pointer" onClick={onOpenSarah}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FolderKanban size={20} color={C.taupe} />
                <div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{SARAH.sessionType} — {SARAH.date}</p>
                  <p className="text-xs" style={{ color: C.charcoal }}>Project HEIRLOOM</p>
                </div>
              </div>
              <Pill tone="done">{STAGES[stageIndex].label}</Pill>
            </div>
          </Card>
        ) : (
          <EmptyState title="No projects yet" body={`A project folder is created for ${openClient.split(" ")[0]} automatically once they're booked — quote accepted, contract signed, paid, date selected. Nothing to show before that.`} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Projects</p>
        <Pill tone="info">Organized by client</Pill>
      </div>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>Every client gets one folder. Each booked session becomes a project inside it — so repeat clients keep all their sessions in one place instead of scattered rows.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <button onClick={() => setOpenClient(SARAH.name)} className="text-left">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <FolderKanban size={22} color={status.projectCreated ? C.forest : C.taupe} />
              {status.projectCreated && <Pill tone="done">1 project</Pill>}
            </div>
            <p className="text-sm font-medium" style={{ color: C.ink }}>{SARAH.name}</p>
            <p className="text-xs" style={{ color: C.taupe }}>{status.projectCreated ? "Updated just now" : "No projects yet"}</p>
          </Card>
        </button>
        {FOLDER_CLIENTS.map((name) => (
          <button key={name} onClick={() => setOpenClient(name)} className="text-left">
            <Card className="p-4">
              <div className="flex items-center justify-between mb-2">
                <FolderKanban size={22} color={C.taupe} />
              </div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{name}</p>
              <p className="text-xs" style={{ color: C.taupe }}>No projects yet</p>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminSessions({ status, portal, onOpenSarah }) {
  const session = getSessionInfo(portal);
  return (
    <Card className="p-5">
      <p className="ecc-display text-2xl mb-4" style={{ color: C.ink }}>Sessions</p>
      <div>
        {status.projectCreated && (
          <button onClick={onOpenSarah} className="w-full flex items-center justify-between p-3 rounded-xl text-left mb-2" style={{ background: C.cream }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{SARAH.sessionType} — {SARAH.name}</p>
              <p className="text-xs" style={{ color: C.charcoal }}>{session.date} · {session.time} · {SARAH.studio}</p>
            </div>
            <Pill tone="done">{status.sessionStatus}</Pill>
          </button>
        )}
        {["The Garcia Family — Newborn Session", "Amanda + Chris — Consultation", "Maria Lopez — Maternity Session"].map((s, i) => (
          <div key={s} className="flex items-center justify-between p-3" style={{ borderTop: i === 0 && !status.projectCreated ? "none" : `1px solid ${C.line}` }}>
            <p className="text-sm" style={{ color: C.charcoal }}>{s}</p>
            <Pill>Demo</Pill>
          </div>
        ))}
        {!status.projectCreated && (
          <p className="text-xs pt-3" style={{ color: C.taupe }}>Sarah Garcia's session shows here once she's booked — quote accepted, contract signed, paid, date selected.</p>
        )}
      </div>
    </Card>
  );
}

const CAL_DAYS = Array.from({ length: 30 }, (_, i) => i + 1);
const CAL_EVENTS = {
  18: [{ title: "Branding Shoot — Michael B.", time: "11:00 AM", tone: "info" }],
  20: [{ title: "Maternity Session — Maria G.", time: "9:00 AM", tone: "neutral" }],
  22: [{ title: "Newborn Session — The Garcia Family", time: "10:00 AM", tone: "neutral" }, { title: "Consultation — Amanda + Chris", time: "1:00 PM", tone: "neutral" }],
};

function AdminCalendar({ status, onOpenSarah }) {
  const [selected, setSelected] = useState(22);
  const events = { ...CAL_EVENTS };
  if (status.projectCreated) {
    events[20] = [...(events[20] || []).filter((e) => !e.title.includes("Maria G.")), { title: `${SARAH.sessionType} — ${SARAH.name}`, time: SARAH.time, tone: "sarah" }];
  }
  const dayEvents = events[selected] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <button className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: C.cream, color: C.forest }} onClick={() => setSelected(22)}>Today</button>
          <p className="ecc-display text-2xl" style={{ color: C.ink }}>June 2026</p>
          <div className="flex gap-3"><ChevronLeft size={18} color={C.charcoal} /><ChevronRight size={18} color={C.charcoal} /></div>
        </div>
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="grid grid-cols-7 gap-1 text-xs mt-4 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <div key={i} className="text-center font-medium pb-1" style={{ color: C.taupe }}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {CAL_DAYS.map((d) => {
              const has = events[d];
              const isSelected = d === selected;
              return (
                <button
                  key={d}
                  onClick={() => setSelected(d)}
                  className="aspect-square rounded-full flex items-center justify-center text-sm relative"
                  style={{
                    background: isSelected ? C.forest : has ? C.cream : "transparent",
                    color: isSelected ? "#fff" : C.ink,
                  }}
                >
                  {d}
                  {has && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: C.forest }} />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-5 lg:self-start lg:sticky lg:top-20">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>June {selected}, 2026</p>
        {dayEvents.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>Nothing scheduled.</p>}
        {dayEvents.map((e, i) => (
          <div key={i} className="flex items-center gap-3 py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
            <div className="w-1 self-stretch rounded-full" style={{ background: e.tone === "sarah" ? C.forest : C.taupe }} />
            <div className="flex-1">
              {e.tone === "sarah" ? (
                <button onClick={onOpenSarah} className="text-left">
                  <p className="text-sm underline" style={{ color: C.forest }}>{e.title}</p>
                </button>
              ) : (
                <p className="text-sm" style={{ color: C.ink }}>{e.title}</p>
              )}
              <p className="text-xs" style={{ color: C.taupe }}>June {selected}, 2026 · {e.time}</p>
            </div>
            <Pill tone={e.tone === "sarah" ? "done" : "info"}>{e.tone === "sarah" ? status.sessionStatus : "Confirmed"}</Pill>
          </div>
        ))}
      </Card>
    </div>
  );
}

function AdminPortalEditor({ portal, setPortal, status, setApp }) {
  const [urlDraft, setUrlDraft] = useState("");
  const [saved, setSaved] = useState(true);
  const fileInputRef = React.useRef(null);

  const touch = (fn) => { setSaved(false); fn(); setTimeout(() => setSaved(true), 500); };

  const addImageUrl = () => {
    if (!urlDraft.trim()) return;
    touch(() => setPortal((p) => ({ ...p, visionImages: [...p.visionImages, { id: Date.now(), url: urlDraft.trim() }] })));
    setUrlDraft("");
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        touch(() => setPortal((p) => ({ ...p, visionImages: [...p.visionImages, { id: Date.now() + Math.random(), url: reader.result }] })));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeImage = (id) => touch(() => setPortal((p) => ({ ...p, visionImages: p.visionImages.filter((img) => img.id !== id) })));
  const updateProp = (i, val) => touch(() => setPortal((p) => ({ ...p, propList: p.propList.map((x, idx) => (idx === i ? val : x)) })));
  const removeProp = (i) => touch(() => setPortal((p) => ({ ...p, propList: p.propList.filter((_, idx) => idx !== i) })));
  const addProp = () => touch(() => setPortal((p) => ({ ...p, propList: [...p.propList, ""] })));

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ecc-display text-2xl" style={{ color: C.ink }}>Portal Editor — {SARAH.name}</p>
          <p className="text-xs" style={{ color: C.taupe }}>Everything here writes live to her client portal. No publish step needed.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: C.taupe }}>{saved ? "Saved" : "Saving…"}</span>
          <button onClick={() => setApp && setApp("client")} className="text-xs font-medium underline" style={{ color: C.forest }}>Preview as client</button>
        </div>
      </div>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Session Date & Location</p>
        <div className="flex gap-4 mb-3 text-sm">
          <label className="flex items-center gap-2"><input type="radio" checked={portal.useProjectDetails} onChange={() => touch(() => setPortal((p) => ({ ...p, useProjectDetails: true })))} /> Use project details</label>
          <label className="flex items-center gap-2"><input type="radio" checked={!portal.useProjectDetails} onChange={() => touch(() => setPortal((p) => ({ ...p, useProjectDetails: false })))} /> Custom override</label>
        </div>
        {portal.useProjectDetails ? (
          <p className="text-sm px-3 py-2.5 rounded-xl" style={{ background: C.cream, color: C.ink }}>{SARAH.date} · {SARAH.time} · {SARAH.location} <span style={{ color: C.taupe }}>— pulled from the project record</span></p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input placeholder="Date" defaultValue={SARAH.date} onChange={(e) => touch(() => setPortal((p) => ({ ...p, customDate: e.target.value })))} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }} />
            <input placeholder="Time" defaultValue={SARAH.time} onChange={(e) => touch(() => setPortal((p) => ({ ...p, customTime: e.target.value })))} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }} />
            <input placeholder="Location" defaultValue={SARAH.location} onChange={(e) => touch(() => setPortal((p) => ({ ...p, customLocation: e.target.value })))} className="px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }} />
          </div>
        )}
      </Card>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Vision Board Images</p>
        {portal.visionImages.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
            {portal.visionImages.map((img) => (
              <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden" style={{ background: C.cream }}>
                <img src={img.url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = "none"; }} />
                <button onClick={() => removeImage(img.id)} className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                  <X size={12} color="#fff" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="flex gap-2 sm:col-span-2">
            <input value={urlDraft} onChange={(e) => setUrlDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addImageUrl()} placeholder="Paste an image URL…" className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }} />
            <button onClick={addImageUrl} className="px-3 py-2 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>Add</button>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()} className="flex-1 px-3 py-2 rounded-xl text-sm font-medium flex items-center justify-center gap-1.5" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              <Download size={14} style={{ transform: "rotate(180deg)" }} /> Upload
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} />
          </div>
        </div>
        <button disabled className="mt-2 w-full px-3 py-2 rounded-xl text-sm flex items-center justify-center gap-1.5" style={{ border: `1px dashed ${C.line}`, color: C.taupe }}>
          Import from Google Drive — connect in Settings, not wired in this skeleton
        </button>
      </Card>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>Session Vision</p>
        <textarea value={portal.sessionVision} onChange={(e) => touch(() => setPortal((p) => ({ ...p, sessionVision: e.target.value })))} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
      </Card>

      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>Session Notes</p>
        <textarea value={portal.sessionNotes} onChange={(e) => touch(() => setPortal((p) => ({ ...p, sessionNotes: e.target.value })))} rows={3} className="w-full px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs uppercase tracking-widest" style={{ color: C.taupe }}>Prop List</p>
          <button onClick={addProp} className="text-xs font-medium flex items-center gap-1" style={{ color: C.forest }}><Plus size={12} /> Add prop</button>
        </div>
        <div className="space-y-2">
          {portal.propList.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={p} onChange={(e) => updateProp(i, e.target.value)} className="flex-1 px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
              <button onClick={() => removeProp(i)}><X size={14} color={C.taupe} /></button>
            </div>
          ))}
        </div>
      </Card>
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

function StageCarousel({ stageIndex }) {
  const [viewIndex, setViewIndex] = useState(stageIndex);
  const [expanded, setExpanded] = useState(false);
  const touchX = React.useRef(null);

  React.useEffect(() => setViewIndex(stageIndex), [stageIndex]);

  const move = (d) => setViewIndex((v) => Math.max(0, Math.min(STAGES.length - 1, v + d)));
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (dx > 40) move(-1);
    else if (dx < -40) move(1);
    touchX.current = null;
  };

  const prev = STAGES[viewIndex - 1];
  const curr = STAGES[viewIndex];
  const next = STAGES[viewIndex + 1];
  const isRealStage = viewIndex === stageIndex;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-center gap-3 py-3" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <button onClick={() => move(-1)} disabled={viewIndex === 0} className="shrink-0" style={{ opacity: viewIndex === 0 ? 0.3 : 1 }}>
          <ChevronLeft size={20} color={C.charcoal} />
        </button>

        <button onClick={() => prev && setViewIndex(viewIndex - 1)} className="text-xs text-center w-20 shrink-0 hidden sm:block" style={{ color: C.taupe, opacity: prev ? 1 : 0 }}>
          {prev?.label}
        </button>

        <button
          onClick={() => setExpanded((e) => !e)}
          className="px-5 py-2.5 rounded-full text-sm font-medium shrink-0 transition"
          style={{
            background: isRealStage ? C.forest : C.cream,
            color: isRealStage ? "#fff" : C.ink,
            border: isRealStage ? "none" : `1px solid ${C.taupe}`,
          }}
        >
          {curr.label}{!isRealStage && <span className="opacity-70"> · browsing</span>}
        </button>

        <button onClick={() => next && setViewIndex(viewIndex + 1)} className="text-xs text-center w-20 shrink-0 hidden sm:block" style={{ color: C.taupe, opacity: next ? 1 : 0 }}>
          {next?.label}
        </button>

        <button onClick={() => move(1)} disabled={viewIndex === STAGES.length - 1} className="shrink-0" style={{ opacity: viewIndex === STAGES.length - 1 ? 0.3 : 1 }}>
          <ChevronRight size={20} color={C.charcoal} />
        </button>
      </div>
      <button onClick={() => setExpanded((e) => !e)} className="block mx-auto text-[11px] underline" style={{ color: C.forest }}>
        {expanded ? "Collapse" : "Expand full timeline"}
      </button>

      {expanded && (
        <div className="flex gap-1 overflow-x-auto ecc-scrollbar pb-2 mt-3">
          {STAGES.map((s, i) => (
            <div key={s.key} className="flex items-center shrink-0">
              <div className="flex flex-col items-center w-24">
                <div className="w-3 h-3 rounded-full mb-1" style={{ background: i <= stageIndex ? C.forest : C.line }} />
                <p className="text-[10px] text-center leading-tight" style={{ color: i <= stageIndex ? C.ink : C.taupe }}>{s.label}</p>
              </div>
              {i < STAGES.length - 1 && <div className="w-6 h-px mb-4" style={{ background: i < stageIndex ? C.forest : C.line }} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminProjectWorkspace({ stageIndex, status, goToStage, activity, messages, portal, onBack, go }) {
  const session = getSessionInfo(portal);
  const [docOpen, setDocOpen] = useState(null);
  const nextAction = [
    { label: "Send Quote", to: 1 },
    { label: "Mark Quote Accepted", to: 2 },
    { label: "Send Contract", to: 3 },
    { label: "Mark Contract Signed", to: 4 },
    { label: "Send Deposit Invoice", to: 5 },
    { label: "Mark Deposit Paid", to: 6 },
    { label: "Confirm Date Selected — Mark Booked", to: 7 },
    { label: "Mark Session Complete", to: 8 },
    { label: "Deliver Gallery", to: 9 },
    null,
  ][stageIndex];

  const statusLightLabel = { green: "Booked & on track", yellow: "In progress", red: "Needs a response" }[status.statusLight];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> Back to Dashboard</button>

      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <Avatar name={SARAH.name} size={44} />
            <div>
              <p className="ecc-display text-3xl leading-tight" style={{ color: C.ink }}>{SARAH.name}</p>
              <p className="text-sm" style={{ color: C.charcoal }}>{SARAH.sessionType} · {session.date} · {session.time} · {session.location}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Pill tone="done">{STAGES[stageIndex].label}</Pill>
            {status.projectCreated && (
              <button onClick={() => go && go("portaleditor")} className="text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1" style={{ border: `1px solid ${C.line}`, color: C.forest }}>
                <ImageIcon size={12} /> Edit Portal
              </button>
            )}
          </div>
        </div>

        <div className="mb-1"><StatusLight tone={status.statusLight} label={statusLightLabel} /></div>

        {status.readyToSecure && (
          <div className="mb-4 px-4 py-3 rounded-xl text-sm" style={{ background: "#fbf1e6", color: C.ink }}>
            Paid and signed — just waiting on a date. Client gets a calendar link to pick their slot; she isn't "Booked" until she does.
          </div>
        )}

        <StageCarousel stageIndex={stageIndex} />

        {nextAction && (
          <button
            onClick={() => goToStage(nextAction.to)}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white flex items-center gap-2"
            style={{ background: C.forest }}
          >
            {nextAction.label} <ArrowRight size={14} />
          </button>
        )}
        {!nextAction && <Pill tone="done">Project complete — gallery delivered</Pill>}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="space-y-5 min-w-0">
          <div>
            <p className="text-xs uppercase tracking-widest mb-2 px-1" style={{ color: C.taupe }}>Documents</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: "inquiry", label: "Inquiry Form", id: "received May 30, 2026", st: "received" },
                { key: "quote", label: "Quote " + SARAH.quoteId, id: "$" + SARAH.total, st: status.quote },
                { key: "contract", label: "Contract " + SARAH.contractId, id: SARAH.sessionType, st: status.contract },
                { key: "invoice", label: "Invoice " + SARAH.invoiceId, id: "$" + SARAH.deposit + " deposit", st: status.invoice },
              ].map((d) => (
                <Card key={d.key} className="p-4 cursor-pointer">
                  <div onClick={() => setDocOpen(d.key)}>
                    <FileText size={16} color={C.taupe} />
                    <p className="text-sm font-medium mt-2" style={{ color: C.ink }}>{d.label}</p>
                    <p className="text-xs mb-2" style={{ color: C.charcoal }}>{d.id}</p>
                    <Pill tone={docTone(d.st)}>{docLabel(d.key, d.st) || d.st}</Pill>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {docOpen && (
            <DocModal kind={docOpen} onClose={() => setDocOpen(null)} status={status} goToStage={goToStage} stageIndex={stageIndex} />
          )}

          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Recent Conversations</p>
            {messages.slice(-3).map((m, i) => (
              <div key={i} className="flex justify-between gap-3 py-2 text-sm" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <span style={{ color: C.taupe, minWidth: 60 }}>{m.from === "client" ? "Sarah" : "Studio"}</span>
                <span className="flex-1 text-right" style={{ color: C.ink }}>{m.text}</span>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <p className="ecc-display text-lg mb-1" style={{ color: C.ink }}>Activity</p>
            <div>
              {activity.slice(0, 8).map((a, i) => (
                <div key={i} className="flex justify-between gap-2 py-2.5" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                  <span style={{ color: C.ink }}>{a.text}</span>
                  <span className="text-xs shrink-0" style={{ color: C.taupe }}>{a.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Contact Info</p>
            {[["Email", SARAH.email], ["Phone", SARAH.phone], ["Source", "Instagram inquiry form"], ["Budget", SARAH.budget]].map(([k, v], i) => (
              <div key={k} className="flex items-center justify-between py-2.5 text-sm" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
                <span style={{ color: C.taupe }}>{k}</span>
                <span style={{ color: C.ink }}>{v}</span>
              </div>
            ))}
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Payments</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
                <StatusLight tone="green" label="Paid" />
                <p className="ecc-display text-xl mt-1" style={{ color: C.ink }}>${status.invoice === "deposit_paid" ? SARAH.deposit : 0}</p>
              </div>
              <div className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
                <StatusLight tone="yellow" label="Due" />
                <p className="ecc-display text-xl mt-1" style={{ color: C.ink }}>${status.invoice === "deposit_paid" ? SARAH.total - SARAH.deposit : 0}</p>
              </div>
              <div className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
                <StatusLight tone="red" label="Past due" />
                <p className="ecc-display text-xl mt-1" style={{ color: C.ink }}>$0</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Sessions</p>
            {status.projectCreated ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{SARAH.sessionType}</p>
                  <p className="text-xs" style={{ color: C.charcoal }}>{session.date} · {session.time} · {SARAH.studio}</p>
                </div>
                <Pill tone="done">{status.sessionStatus}</Pill>
              </div>
            ) : (
              <p className="text-sm" style={{ color: C.taupe }}>No session scheduled with {SARAH.name.split(" ")[0]} yet — date locks in once she's booked.</p>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Client Gallery Collections</p>
            {status.gallery === "delivered" ? (
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: C.ink }}>Final Gallery</p>
                <Pill tone="done">Delivered</Pill>
              </div>
            ) : (
              <p className="text-sm" style={{ color: C.taupe }}>No collections for {SARAH.name.split(" ")[0]} yet — delivered to Pixieset 2–3 weeks after the session.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

function AdminNotifications({ activity, onOpenSarah }) {
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Notifications</p>
      <Card className="p-5">
        {activity.map((a, i) => (
          <div key={i} className="flex items-start gap-3 py-3" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
            <Bell size={14} color={C.taupe} className="mt-0.5" />
            <div className="flex-1">
              <button onClick={a.text.includes("Sarah") || a.text.includes("INV-1001") || a.text.includes("QUO-1023") ? onOpenSarah : undefined} className="text-left">
                <p className="text-sm" style={{ color: C.ink }}>{a.text}</p>
              </button>
              <p className="text-xs" style={{ color: C.taupe }}>{a.time}</p>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

const SEGMENTS = [
  { name: "Mini-session leads", count: 142 },
  { name: "Past clients", count: 86 },
  { name: "Newsletter", count: 310 },
  { name: "Maternity inquiries", count: 24 },
];
const CAMPAIGNS = [
  { name: "Fall Mini-Sessions Promo", segment: "Mini-session leads", status: "Sent", stats: "41% open · 9% click" },
  { name: "Welcome Series — New Inquiry", segment: "All inquiries", status: "Automated", stats: "Triggers on /api/inquiry" },
  { name: "Past Client Re-Engagement", segment: "Past clients", status: "Draft", stats: "—" },
];

function AdminEmailMarketing() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Email Marketing</p>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.charcoal }}>
          <Plus size={14} /> New Campaign
        </button>
      </div>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>
        Built on Resend Audiences. Client tags power segments — tag someone "mini-session-leads" anywhere in the CRM and they show up here automatically.
      </p>
      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Segments</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SEGMENTS.map((s) => (
            <div key={s.name} className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
              <p className="ecc-display text-2xl" style={{ color: C.ink }}>{s.count}</p>
              <p className="text-xs" style={{ color: C.charcoal }}>{s.name}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Campaigns</p>
        {CAMPAIGNS.map((c, i) => (
          <div key={c.name} className="flex items-center justify-between py-3" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{c.name}</p>
              <p className="text-xs" style={{ color: C.taupe }}>{c.segment} · {c.stats}</p>
            </div>
            <Pill tone={c.status === "Sent" ? "done" : c.status === "Automated" ? "info" : "neutral"}>{c.status}</Pill>
          </div>
        ))}
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

function AdminSocialMessaging() {
  return (
    <div className="space-y-4">
      <p className="ecc-display text-2xl" style={{ color: C.ink }}>Social Messaging</p>
      <p className="text-sm max-w-2xl" style={{ color: C.charcoal }}>
        Comment-to-DM keyword automation on Instagram. Cold-DMing isn't possible under Meta's rules — this only fires on a user-initiated comment or story reply, then logs the lead straight into Clients.
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
          <p className="text-xs uppercase tracking-widest" style={{ color: C.taupe }}>Keyword Rules</p>
          <button className="flex items-center gap-1 text-xs font-medium" style={{ color: C.forest }}><Plus size={12} /> Add rule</button>
        </div>
        {DM_RULES.map((r, i) => (
          <div key={r.keyword} className="flex items-center justify-between py-3" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
            <div>
              <p className="text-sm font-medium" style={{ color: C.ink }}>"{r.keyword}"</p>
              <p className="text-xs" style={{ color: C.charcoal }}>{r.reply}</p>
            </div>
            <Pill>{r.count} triggered</Pill>
          </div>
        ))}
      </Card>
      <EmptyState title="Webhook not connected" body="Needs a Meta Developer App with instagram_business_manage_messages, approved through App Review — weeks to months. Start that early; this page is ready for it." />
    </div>
  );
}

const Toggle = ({ checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className="w-9 h-5 rounded-full relative shrink-0 transition"
    style={{ background: checked ? C.forest : C.line }}
  >
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
    { id: "c1", name: "Maternity Session Contract", created: "Jan 17, 2026", body: "This agreement outlines the terms of your {{session_type}} on {{session_date}} at {{location}}.", settings: { signatureRequired: true, documentExpiry: false, documentReminders: true } },
    { id: "c2", name: "Wedding Photography Contract", created: "Jun 18, 2025", body: "Photography services agreement between EC Creative Studios and {{client_name}}.", settings: { signatureRequired: true, documentExpiry: false, documentReminders: true } },
    { id: "c3", name: "Mini Session Contract", created: "Sep 9, 2025", body: "Short-form agreement for mini sessions.", settings: { signatureRequired: true, documentExpiry: true, documentReminders: false } },
  ],
  invoices: [
    { id: "i1", name: "Maternity Session Invoice", created: "Feb 1, 2026", body: "Deposit due to secure {{session_date}}.", settings: { paymentDue: "Within 7 days" } },
    { id: "i2", name: "Wedding Deposit Invoice", created: "Mar 4, 2026", body: "40% deposit due on signing.", settings: { paymentDue: "Within 30 days" } },
  ],
  quotes: [
    { id: "q1", name: "Signature Experience Quote", created: "Jan 2, 2026", body: "A fully curated photography experience designed to capture {{client_name}}'s story.", settings: { autoCreateInvoice: true, documentExpiry: false, documentReminders: false, currency: "USD" } },
    { id: "q2", name: "Wedding Package Quote", created: "Dec 12, 2025", body: "Wedding day coverage tailored to your timeline.", settings: { autoCreateInvoice: true, documentExpiry: true, documentReminders: true, currency: "USD" } },
  ],
  questionnaires: [
    { id: "qq1", name: "Maternity Session Prep Questionnaire", created: "Jan 10, 2026", body: "Help us prepare for your session.", settings: { documentExpiry: false, documentReminders: true } },
    { id: "qq2", name: "Wedding Day Timeline Questionnaire", created: "Nov 2, 2025", body: "Walk us through your wedding day schedule.", settings: { documentExpiry: false, documentReminders: false } },
  ],
  emails: [
    { id: "e1", name: "Welcome Email — New Inquiry", created: "Jan 5, 2026", subject: "Thanks for reaching out, {{client_name}}!", body: "We're so excited to learn more about your {{session_type}}." },
    { id: "e2", name: "Booking Confirmation", created: "Jan 5, 2026", subject: "You're booked, {{client_name}}!", body: "Your {{session_type}} is confirmed for {{session_date}} at {{location}}." },
    { id: "e3", name: "Prep Guide & Outfit Tips", created: "Jan 5, 2026", subject: "Getting ready for your session", body: "A few tips before your {{session_date}} session." },
    { id: "e4", name: "Gallery Delivery", created: "Jan 5, 2026", subject: "Your gallery is ready!", body: "Your photos from {{session_date}} are ready to view." },
  ],
};

const VARIABLES = ["{{client_name}}", "{{session_type}}", "{{session_date}}", "{{session_time}}", "{{location}}", "{{total}}", "{{deposit}}", "{{studio_name}}"];

function AdminTemplates() {
  const [tab, setTab] = useState("contracts");
  const [data, setData] = useState(SEED_TEMPLATES);
  const [editing, setEditing] = useState(null); // { type, id } | "new" marker via id null

  const list = data[tab];
  const current = editing && data[editing.type].find((t) => t.id === editing.id);

  const updateField = (field, value) => {
    setData((d) => ({ ...d, [editing.type]: d[editing.type].map((t) => (t.id === editing.id ? { ...t, [field]: value } : t)) }));
  };
  const updateSetting = (key, value) => {
    setData((d) => ({ ...d, [editing.type]: d[editing.type].map((t) => (t.id === editing.id ? { ...t, settings: { ...t.settings, [key]: value } } : t)) }));
  };
  const insertVariable = (v) => updateField("body", (current.body || "") + " " + v);

  const newTemplate = () => {
    const id = tab + "_" + Date.now();
    const blank = tab === "emails"
      ? { id, name: "Untitled Email Template", created: "Just now", subject: "", body: "" }
      : { id, name: `Untitled ${TEMPLATE_TABS.find((t) => t.key === tab).label.replace(/s$/, "")} Template`, created: "Just now", body: "", settings: tab === "invoices" ? { paymentDue: "Within 30 days" } : tab === "quotes" ? { autoCreateInvoice: true, documentExpiry: false, documentReminders: false, currency: "USD" } : { documentExpiry: false, documentReminders: false, ...(tab === "contracts" ? { signatureRequired: true } : {}) } };
    setData((d) => ({ ...d, [tab]: [blank, ...d[tab]] }));
    setEditing({ type: tab, id });
  };

  if (editing && current) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(null)}><ChevronLeft size={16} color={C.charcoal} /></button>
            <input value={current.name} onChange={(e) => updateField("name", e.target.value)} className="ecc-display text-xl bg-transparent outline-none" style={{ color: C.ink }} />
          </div>
          <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>Done</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {editing.type !== "emails" ? (
            <Card className="p-4 h-fit">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Template Settings</p>
              <div className="space-y-4">
                {editing.type === "contracts" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.ink }}>Signature required</span>
                    <Toggle checked={!!current.settings.signatureRequired} onChange={(v) => updateSetting("signatureRequired", v)} />
                  </div>
                )}
                {editing.type === "quotes" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.ink }}>Auto-create invoice</span>
                    <Toggle checked={!!current.settings.autoCreateInvoice} onChange={(v) => updateSetting("autoCreateInvoice", v)} />
                  </div>
                )}
                {editing.type === "invoices" ? (
                  <div>
                    <p className="text-sm mb-1.5" style={{ color: C.ink }}>Payment due</p>
                    <select value={current.settings.paymentDue} onChange={(e) => updateSetting("paymentDue", e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }}>
                      {["Within 7 days", "Within 14 days", "Within 30 days", "On receipt"].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: C.ink }}>Document expiry</span>
                      <Toggle checked={!!current.settings.documentExpiry} onChange={(v) => updateSetting("documentExpiry", v)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: C.ink }}>Document reminders</span>
                      <Toggle checked={!!current.settings.documentReminders} onChange={(v) => updateSetting("documentReminders", v)} />
                    </div>
                  </>
                )}
                {editing.type === "quotes" && (
                  <div>
                    <p className="text-sm mb-1.5" style={{ color: C.ink }}>Currency</p>
                    <select value={current.settings.currency} onChange={(e) => updateSetting("currency", e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }}>
                      <option>USD</option>
                    </select>
                  </div>
                )}
              </div>
            </Card>
          ) : <div className="hidden lg:block" />}

          <Card className="p-5">
            {editing.type === "emails" && (
              <input value={current.subject} onChange={(e) => updateField("subject", e.target.value)} placeholder="Subject" className="w-full mb-3 px-3 py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
            )}
            <div className="flex items-center gap-1 mb-3 pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
              {[PenLine, ListChecks, ClipboardList].map((Icon, i) => <Icon key={i} size={15} color={C.taupe} />)}
              <div className="flex-1" />
              <select onChange={(e) => { if (e.target.value) { insertVariable(e.target.value); e.target.value = ""; } }} className="text-xs px-2 py-1 rounded-lg" style={{ border: `1px solid ${C.line}`, color: C.charcoal }}>
                <option value="">Insert Field</option>
                {VARIABLES.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <textarea value={current.body} onChange={(e) => updateField("body", e.target.value)} rows={12} placeholder={`Start typing your ${editing.type === "emails" ? "email" : editing.type.replace(/s$/, "")} template…`} className="w-full text-sm outline-none resize-none" style={{ color: C.ink }} />
            {editing.type === "contracts" && (
              <div className="mt-4 pt-4 text-sm" style={{ borderTop: `1px solid ${C.line}`, color: C.charcoal }}>
                <p className="font-medium mb-2" style={{ color: C.ink }}>Signatures</p>
                <p>Your Client _______________________</p>
                <p className="mt-2">EC Creative Studios _______________________</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Templates</p>
        <button onClick={newTemplate} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
          <Plus size={14} /> New Template
        </button>
      </div>
      <div className="flex gap-1 overflow-x-auto ecc-scrollbar">
        {TEMPLATE_TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className="px-3.5 py-2 rounded-full text-sm font-medium shrink-0" style={{ background: tab === t.key ? C.charcoal : "transparent", color: tab === t.key ? "#fff" : C.charcoal }}>
            {t.label}
          </button>
        ))}
      </div>
      <Card>
        {list.map((t, i) => (
          <button key={t.id} onClick={() => setEditing({ type: tab, id: t.id })} className="w-full flex items-center justify-between px-5 py-3.5 text-left" style={{ borderTop: i === 0 ? "none" : `1px solid ${C.line}` }}>
            <span className="text-sm font-medium" style={{ color: C.ink }}>{t.name}</span>
            <span className="text-xs" style={{ color: C.taupe }}>{t.created}</span>
          </button>
        ))}
      </Card>
    </div>
  );
}

const FORM_FIELD_TYPES = [
  { key: "short", label: "Short Text", icon: PenLine },
  { key: "long", label: "Long Text", icon: ListChecks },
  { key: "choice", label: "Multiple Choice", icon: CheckCircle2 },
  { key: "checkbox", label: "Checkboxes", icon: Check },
  { key: "email", label: "Email", icon: Mail },
  { key: "date", label: "Date", icon: CalendarIcon },
  { key: "explanation", label: "Explanation", icon: ClipboardList },
];

const SEED_FORMS = [
  { id: "f1", name: "Let's Get Started — Tell Us About You!", status: "Published", platforms: ["Website"], fields: [{ id: 1, type: "short", label: "Full Name" }, { id: 2, type: "email", label: "Email Address" }, { id: 3, type: "choice", label: "Session Type" }] },
  { id: "f2", name: "Wedding Inquiry", status: "Published", platforms: ["Website", "Instagram Bio"], fields: [{ id: 1, type: "short", label: "Couple's Names" }, { id: 2, type: "date", label: "Wedding Date" }] },
  { id: "f3", name: "Mini Session Signup", status: "Draft", platforms: [], fields: [{ id: 1, type: "short", label: "Full Name" }] },
];

const PLATFORM_OPTIONS = ["Website", "Instagram Bio", "Inquiry Page", "Email Signature"];

function AdminContactForms() {
  const [forms, setForms] = useState(SEED_FORMS);
  const [openId, setOpenId] = useState(null);
  const current = forms.find((f) => f.id === openId);

  const update = (fn) => setForms((fs) => fs.map((f) => (f.id === openId ? fn(f) : f)));
  const addField = (type) => update((f) => ({ ...f, fields: [...f.fields, { id: Date.now(), type, label: FORM_FIELD_TYPES.find((t) => t.key === type).label }] }));
  const removeField = (id) => update((f) => ({ ...f, fields: f.fields.filter((x) => x.id !== id) }));
  const updateLabel = (id, label) => update((f) => ({ ...f, fields: f.fields.map((x) => (x.id === id ? { ...x, label } : x)) }));
  const togglePlatform = (p) => update((f) => ({ ...f, platforms: f.platforms.includes(p) ? f.platforms.filter((x) => x !== p) : [...f.platforms, p] }));

  const newForm = () => {
    const id = "f" + Date.now();
    setForms((fs) => [{ id, name: "Untitled Form", status: "Draft", platforms: [], fields: [] }, ...fs]);
    setOpenId(id);
  };

  if (current) {
    const slug = current.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setOpenId(null)} className="text-xs flex items-center gap-1" style={{ color: C.charcoal }}><ChevronLeft size={14} /> All Forms</button>
          <Pill tone={current.status === "Published" ? "done" : "neutral"}>{current.status}</Pill>
        </div>
        <input value={current.name} onChange={(e) => update((f) => ({ ...f, name: e.target.value }))} className="ecc-display text-2xl bg-transparent outline-none w-full" style={{ color: C.ink }} />

        <Card className="p-4">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.taupe }}>Usable on</p>
          <div className="flex flex-wrap gap-2">
            {PLATFORM_OPTIONS.map((p) => {
              const active = current.platforms.includes(p);
              return (
                <button key={p} onClick={() => togglePlatform(p)} className="text-xs px-3 py-1.5 rounded-full font-medium" style={{ background: active ? C.forest : C.cream, color: active ? "#fff" : C.ink }}>
                  {p}
                </button>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: C.taupe }}>eccreative.com/forms/{slug || "untitled"}</p>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-4">
          <Card className="p-4">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Fields</p>
            {current.fields.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>No fields yet. Add one from the right.</p>}
            <div className="space-y-2">
              {current.fields.map((f) => {
                const Icon = FORM_FIELD_TYPES.find((t) => t.key === f.type)?.icon || PenLine;
                return (
                  <div key={f.id} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ border: `1px solid ${C.line}` }}>
                    <Icon size={14} color={C.taupe} />
                    <input value={f.label} onChange={(e) => updateLabel(f.id, e.target.value)} className="flex-1 text-sm bg-transparent outline-none" style={{ color: C.ink }} />
                    <button onClick={() => removeField(f.id)}><X size={14} color={C.taupe} /></button>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card className="p-4 h-fit">
            <p className="text-xs uppercase tracking-widest mb-3" style={{ color: C.taupe }}>Add a field</p>
            <div className="grid grid-cols-2 gap-2">
              {FORM_FIELD_TYPES.map((t) => {
                const Icon = t.icon;
                return (
                  <button key={t.key} onClick={() => addField(t.key)} className="flex flex-col items-center gap-1.5 p-3 rounded-xl text-center" style={{ border: `1px solid ${C.line}` }}>
                    <Icon size={16} color={C.forest} />
                    <span className="text-[11px]" style={{ color: C.ink }}>{t.label}</span>
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
        {forms.map((f) => (
          <Card key={f.id} className="p-4">
            <div className="aspect-[16/9] rounded-xl mb-3 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${C.cream}, ${C.taupe})` }}>
              <ClipboardList size={20} color="#fff" />
            </div>
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="text-sm font-medium" style={{ color: C.ink }}>{f.name}</p>
              {f.status === "Draft" && <Pill>Draft</Pill>}
            </div>
            <p className="text-xs mb-3" style={{ color: C.taupe }}>{f.platforms.length ? f.platforms.join(" · ") : "Not placed anywhere yet"}</p>
            <button onClick={() => setOpenId(f.id)} className="w-full py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }}>
              {f.status === "Draft" ? "Edit Draft" : "View Form"}
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
