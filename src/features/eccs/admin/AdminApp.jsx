"use client";

import React, { useMemo, useState, useRef } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  ClipboardList,
  CreditCard,
  FileSignature,
  FileText,
  FolderKanban,
  Image as ImageIcon,
  Inbox,
  LayoutTemplate,
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

const NAV = [
  { key: "dashboard", label: "Dashboard", icon: FolderKanban },
  { key: "pipeline", label: "Pipeline", icon: Sparkles },
  { key: "inquiries", label: "Inquiries", icon: Inbox },
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: ClipboardList },
  { key: "quotes", label: "Quotes", icon: FileText },
  { key: "contracts", label: "Contracts", icon: FileSignature },
  { key: "invoices", label: "Invoices", icon: Receipt },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "sessions", label: "Sessions", icon: CalendarDays },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "portal", label: "Portal Editor", icon: LayoutTemplate },
  { key: "emails", label: "Emails", icon: Mail },
  { key: "marketing", label: "Email Marketing", icon: Megaphone },
  { key: "social", label: "Social Messaging", icon: MessageCircle },
  { key: "forms", label: "Contact Forms", icon: ClipboardList },
  { key: "templates", label: "Templates", icon: LayoutTemplate },
  { key: "workflows", label: "Workflows", icon: Workflow },
  { key: "activity", label: "Activity", icon: Bell },
  { key: "settings", label: "Settings", icon: SettingsIcon },
  { key: "branding", label: "Branding", icon: Palette },
  { key: "team", label: "Team", icon: UserCog },
];

const BOTTOM_NAV = [
  { key: "dashboard", label: "Home", icon: FolderKanban },
  { key: "clients", label: "Clients", icon: Users },
  { key: "inquiries", label: "Inquiries", icon: Inbox },
  { key: "activity", label: "Alerts", icon: Bell },
  { key: "__more", label: "More", icon: Menu },
];

const SLOT_OPTIONS = [
  { date: "Jul 18, 2026", time: "9:00 AM", locationName: "The Light Haus Studio" },
  { date: "Jul 20, 2026", time: "4:30 PM", locationName: "The Light Haus Studio" },
  { date: "Jul 22, 2026", time: "10:00 AM", locationName: "Dallas Arboretum" },
];

export default function AdminApp({ state, selectedBundle, actions, setApp }) {
  const [page, setPage] = useState("dashboard");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState(false);

  const filteredClients = useMemo(() => {
    const lower = query.trim().toLowerCase();
    if (!lower) return state.clients;
    return state.clients.filter((client) =>
      [client.name, client.email, client.sessionType].some((value) => value?.toLowerCase().includes(lower)),
    );
  }, [query, state.clients]);

  const go = (nextPage) => {
    setPage(nextPage);
    setDrawer(false);
  };

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
        <Topbar query={query} setQuery={setQuery} onMenu={() => setDrawer(true)} />
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1520px] mx-auto space-y-5">
          {page === "dashboard" && (
            <DashboardPage
              state={state}
              selectedBundle={selectedBundle}
              filteredClients={filteredClients}
              actions={actions}
              setPage={go}
              setApp={setApp}
            />
          )}
          {page === "pipeline" && <PipelinePage state={state} actions={actions} />}
          {page === "inquiries" && <InquiriesPage state={state} actions={actions} />}
          {page === "clients" && (
            <ClientsPage
              state={state}
              selectedBundle={selectedBundle}
              filteredClients={filteredClients}
              actions={actions}
              setPage={go}
            />
          )}
          {page === "projects" && <ProjectsPage state={state} selectedBundle={selectedBundle} actions={actions} setPage={go} />}
          {page === "quotes" && <QuotesPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "contracts" && <ContractsPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "invoices" && <InvoicesPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "payments" && <PaymentsPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "sessions" && <SessionsPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "calendar" && <CalendarPage state={state} selectedBundle={selectedBundle} actions={actions} />}
          {page === "portal" && <PortalPage selectedBundle={selectedBundle} actions={actions} setApp={setApp} />}
          {page === "emails" && <EmailsPage selectedBundle={selectedBundle} actions={actions} />}
          {page === "marketing" && <MarketingPage state={state} />}
          {page === "social" && <SocialPage />}
          {page === "forms" && <FormsPage />}
          {page === "templates" && <TemplatesPage />}
          {page === "workflows" && <PlaceholderPage title="Workflows" body="Automation rules (auto-send prep guide, auto-remind on unpaid invoice) live here in v2. This skeleton moves clients through the pipeline via real actions and Manual Override instead." />}
          {page === "activity" && <ActivityPage state={state} />}
          {page === "settings" && <PlaceholderPage title="Settings" body="Studio info, tax rates, payment methods, notification preferences." />}
          {page === "branding" && <PlaceholderPage title="Branding" body="Logo, color palette, fonts. The app already runs on the real EC Creative Studios system: charcoal, cream, taupe, blue, forest green." />}
          {page === "team" && <PlaceholderPage title="Team" body="Add Emily and any second shooters or editors with role-based access once auth exists." />}
        </div>
      </main>

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
      <nav className="space-y-1 flex-1 overflow-y-auto ecc-scrollbar">
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
        Admin-first local CRM
      </div>
    </>
  );
}

function Topbar({ query, setQuery, onMenu }) {
  return (
    <div className="flex items-center gap-3 px-4 sm:px-6 py-4" style={{ borderBottom: `1px solid ${C.line}` }}>
      <button className="md:hidden" onClick={onMenu}><Menu size={20} color={C.ink} /></button>
      <p className="ecc-display text-2xl flex-1" style={{ color: C.ink }}>
        Studio Admin
      </p>
      <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full w-full max-w-md" style={{ background: "#fff", border: `1px solid ${C.line}` }}>
        <Search size={14} color={C.taupe} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search clients, pipeline, invoices..."
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
    { label: "Quotes Awaiting Decision", value: state.quotes.filter((entry) => ["draft", "sent", "viewed"].includes(entry.status)).length },
    { label: "Contracts Awaiting Signature", value: state.contracts.filter((entry) => entry.status === "sent").length },
    { label: "Booked Clients", value: state.clients.filter((client) => getClientBundle(state, client.id).booking.isBooked).length },
  ];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[1.18fr_0.82fr] gap-5">
      <div className="space-y-5">
        <Card className="p-8 sm:p-10" style={{ background: `linear-gradient(135deg, ${C.charcoal}, ${C.ink})`, borderColor: "transparent" }}>
          <p className="text-[10px] uppercase tracking-[0.35em] mb-3" style={{ color: C.taupe }}>
            EC Creative Studios
          </p>
          <p className="ecc-display text-4xl text-white max-w-xl leading-tight">
            Admin first. Booking rules before everything else.
          </p>
          <p className="text-sm mt-4 max-w-lg" style={{ color: C.cream }}>
            This dashboard now makes the quote, contract, payment, project, portal, and calendar handoff explicit.
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
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>
                Selected Client
              </p>
              <p className="ecc-display text-3xl" style={{ color: C.ink }}>
                {selectedBundle.client?.name || "No client selected"}
              </p>
            </div>
            <button onClick={() => setApp("client")} className="text-sm underline" style={{ color: C.forest }}>
              Preview portal
            </button>
          </div>
          {selectedBundle.client && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <SummaryChip label="Pipeline" value={PIPELINE_LABELS[selectedBundle.stage]} />
                <SummaryChip label="Booked" value={selectedBundle.booking.isBooked ? "Yes" : "Not yet"} />
                <SummaryChip label="Project" value={selectedBundle.projectStatus.projectCreated ? "Created" : "Locked"} />
                <SummaryChip label="Outstanding" value={formatCurrency(selectedBundle.invoices.reduce((total, invoice) => total + invoice.balanceDue, 0))} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <ActionCard title="Next step" body={nextActionText(selectedBundle)} actionLabel="Open workflow" onClick={() => setPage("projects")} />
                <ActionCard title="Portal handoff" body={selectedBundle.projectStatus.portalAccessSent ? "Portal email already sent." : "Send portal access after booking is complete."} actionLabel="Open emails" onClick={() => setPage("emails")} />
              </div>
            </>
          )}
        </Card>

        <Card className="p-5">
          <SectionLabel icon={Users}>Client List</SectionLabel>
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
                      <p className="text-sm font-medium truncate" style={{ color: C.ink }}>{client.name}</p>
                      <p className="text-xs truncate" style={{ color: C.charcoal }}>
                        {client.sessionType} • {bundle.booking.completionCount}/3 booking steps complete
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
        <BookingChecklistCard selectedBundle={selectedBundle} />

        <Card className="p-5">
          <SectionLabel icon={Inbox}>New Inquiry Queue</SectionLabel>
          <div className="space-y-3">
            {state.inquiries.filter((entry) => entry.status === "new").map((entry) => (
              <div key={entry.id} className="rounded-xl p-3" style={{ background: C.bg }}>
                <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.name}</p>
                <p className="text-xs mt-1" style={{ color: C.charcoal }}>
                  {entry.sessionType} • {entry.budgetRange}
                </p>
                <button onClick={() => actions.approveInquiry(entry.id)} className="mt-3 px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
                  Approve and create client
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionLabel icon={Bell}>Recent Activity</SectionLabel>
          <div className="space-y-3">
            {state.activity.slice(0, 8).map((entry) => (
              <div key={entry.id} className="pb-3" style={{ borderBottom: `1px solid ${C.line}` }}>
                <p className="text-sm" style={{ color: C.ink }}>{entry.text}</p>
                <p className="text-xs mt-1" style={{ color: C.taupe }}>{entry.createdAt}</p>
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
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
      {PIPELINE_STAGES.slice(0, 10).map((stage) => {
        const items = state.clients.filter((client) => getClientBundle(state, client.id).stage === stage.key);
        return (
          <Card key={stage.key} className="p-4">
            <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: C.taupe }}>{stage.label}</p>
            <p className="ecc-display text-3xl mt-2 mb-4" style={{ color: C.ink }}>{items.length}</p>
            <div className="space-y-2">
              {items.length === 0 && <p className="text-xs" style={{ color: C.charcoal }}>No records here.</p>}
              {items.map((client) => (
                <button key={client.id} onClick={() => actions.selectClient(client.id)} className="w-full p-3 rounded-xl text-left" style={{ background: C.bg }}>
                  <p className="text-sm font-medium" style={{ color: C.ink }}>{client.name}</p>
                  <p className="text-xs mt-1" style={{ color: C.charcoal }}>{client.sessionType}</p>
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
                <Pill tone={bundle.booking.isBooked ? "done" : "info"}>{PIPELINE_LABELS[bundle.stage]}</Pill>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        {!selectedBundle.client ? (
          <EmptyState title="No client selected" body="Pick a client to inspect the real linked records and booking requirements." />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>{selectedBundle.client.name}</p>
                <p className="text-sm mt-1" style={{ color: C.charcoal }}>
                  {selectedBundle.client.email} • {selectedBundle.client.phone}
                </p>
              </div>
              <StatusLight tone={selectedBundle.booking.isBooked ? "green" : "yellow"} label={selectedBundle.booking.isBooked ? "Booked" : PIPELINE_LABELS[selectedBundle.stage]} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
              <SummaryChip label="Quotes" value={String(selectedBundle.quotes.length)} />
              <SummaryChip label="Contracts" value={String(selectedBundle.contracts.length)} />
              <SummaryChip label="Invoices" value={String(selectedBundle.invoices.length)} />
              <SummaryChip label="Portal Access" value={selectedBundle.projectStatus.portalAccessSent ? "Sent" : "Pending"} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ActionCard title="Build quote" body="Create a proposal sourced from your template logic." actionLabel="Open quotes" onClick={() => setPage("quotes")} />
              <ActionCard title="Advance booking" body="Project creation stays locked until quote, contract, and payment are complete." actionLabel="Open project flow" onClick={() => setPage("projects")} />
              <ActionCard title="Payment and calendar" body="Track manual or Stripe payments, then send availability and ICS invite." actionLabel="Open sessions" onClick={() => setPage("sessions")} />
              <ActionCard title="Portal content" body="Prepare the planning board once the booking gate has been met." actionLabel="Open portal" onClick={() => setPage("portal")} />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function ProjectsPage({ state, selectedBundle, actions, setPage }) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 px-5 pb-5">
          {state.clients.map((client) => {
            const bundle = getClientBundle(state, client.id);
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
        </div>
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5">
      <div className="space-y-5">
        <BookingChecklistCard selectedBundle={selectedBundle} />
        <Card className="p-5">
          <SectionLabel icon={ClipboardList}>Project Creation Gate</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <SummaryChip label="Booked" value={booking.isBooked ? "Yes" : "No"} />
            <SummaryChip label="Project record" value={projectStatus.projectCreated ? "Created" : "Locked"} />
            <SummaryChip label="Portal ready" value={projectStatus.portalReady ? "Ready" : "Locked"} />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button disabled={!canSendPortal} onClick={() => actions.sendPortalAccess(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.forest, color: "#fff" }}>
              Send portal access
            </button>
            <button disabled={!canSendAvailability} onClick={() => actions.sendAvailability(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.cream, color: C.ink }}>
              Send date selection email
            </button>
            <button disabled={!canSendCalendarInvite} onClick={() => actions.sendCalendarInvite(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#edf2f5", color: C.blue }}>
              Send calendar invite
            </button>
            <button disabled={booking.isBooked} onClick={() => actions.sendBookingReminder(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#f8ece8", color: C.red }}>
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
          <EmptyState title="Project locked" body="This workspace is intentionally unavailable until quote accepted, contract signed, and payment received." />
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
            <button key={entry.id} onClick={() => actions.selectClient(entry.clientId)} className="w-full p-3 rounded-xl text-left" style={{ background: entry.clientId === state.selectedClientId ? C.cream : "#fff", border: `1px solid ${C.line}` }}>
              <p className="text-sm font-medium" style={{ color: C.ink }}>{entry.number}</p>
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>{getClientBundle(state, entry.clientId).client?.name} • {formatCurrency(entry.total)}</p>
              <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
            </button>
          ))}
        </div>
      </Card>

      {!quote ? (
        <EmptyState title="No quote yet" body="Select a client and draft the first connected quote from their inquiry and package." />
      ) : (
        <div className="grid grid-cols-1 2xl:grid-cols-[1.08fr_0.92fr] gap-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <p className="ecc-display text-3xl" style={{ color: C.ink }}>{quote.number}</p>
                <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {selectedBundle.client?.sessionType}</p>
              </div>
              <Pill tone={statusTone(quote.status)}>{quote.status}</Pill>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <Field label="Session date" value={quote.sessionDate} onChange={(value) => actions.patchQuote(quote.id, { sessionDate: value })} />
              <Field label="Location" value={quote.location} onChange={(value) => actions.patchQuote(quote.id, { location: value })} />
              <Field label="Expiration" value={quote.expirationDate} onChange={(value) => actions.patchQuote(quote.id, { expirationDate: value })} />
              <Field label="Discount" type="number" value={quote.discount} onChange={(value) => actions.patchQuote(quote.id, { discount: Number(value || 0) })} />
            </div>
            <textarea rows={3} value={quote.notes || ""} onChange={(event) => actions.patchQuote(quote.id, { notes: event.target.value })} className="w-full rounded-2xl p-3 text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
            <div className="space-y-3 mt-5">
              {quote.lineItems.map((item) => (
                <div key={item.id} className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr_110px_130px_40px] gap-2 items-center">
                  <Field compact value={item.name} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { name: value })} />
                  <Field compact value={item.description} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { description: value })} />
                  <Field compact type="number" value={item.quantity} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { quantity: Number(value || 0) })} />
                  <Field compact type="number" value={item.unitPrice} onChange={(value) => actions.patchQuoteItem(quote.id, item.id, { unitPrice: Number(value || 0) })} />
                  <button onClick={() => actions.removeQuoteItem(quote.id, item.id)} className="h-10 rounded-xl text-sm" style={{ border: `1px solid ${C.line}`, color: C.red }}>x</button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              <button onClick={() => actions.addQuoteItem(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: C.cream, color: C.ink }}>Add line item</button>
              <button onClick={() => actions.sendQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>Send quote</button>
              <button onClick={() => actions.viewQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>Mark viewed</button>
              <button onClick={() => actions.acceptQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#eaf1ee", color: C.forest }}>Accept</button>
              <button onClick={() => actions.declineQuote(quote.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#f8ece8", color: C.red }}>Decline</button>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[10px] uppercase tracking-[0.3em]" style={{ color: C.taupe }}>Quote Preview</p>
            <p className="ecc-display text-4xl mt-2" style={{ color: C.ink }}>{quote.number}</p>
            <p className="text-sm mt-2" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {quote.eventType}</p>
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
          Contracts only unlock after a quote is accepted. Signing the contract still does not create a project until payment is in.
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
            <p className="text-sm mt-2" style={{ color: C.charcoal }}>{selectedBundle.client?.name} • {contract.templateName}</p>
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
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>{entry.kind} • {formatCurrency(entry.total)}</p>
              <Pill tone={statusTone(entry.status)}>{entry.status}</Pill>
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
            <Pill tone={statusTone(invoice.status)}>{invoice.status}</Pill>
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
            <button onClick={() => actions.sendBookingReminder(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#f8ece8", color: C.red }}>
              Send not-booked reminder
            </button>
            <Field compact label="Payment amount" type="number" value={paymentAmount} onChange={setPaymentAmount} />
            <button onClick={() => { actions.recordPayment(invoice.id, Number(paymentAmount || 0), "Manual"); setPaymentAmount(""); }} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#eaf1ee", color: C.forest }}>
              Apply payment
            </button>
          </div>
          <textarea rows={3} value={invoice.internalNotes || ""} onChange={(event) => actions.patchInvoice(invoice.id, { internalNotes: event.target.value })} className="w-full rounded-2xl p-3 text-sm outline-none" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
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
              <p className="text-xs mt-1" style={{ color: C.charcoal }}>{getClientBundle(state, payment.clientId).client?.name} • {payment.method}</p>
              <p className="text-xs mt-1" style={{ color: C.taupe }}>{payment.paidAt}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionLabel icon={ClipboardList}>Client Balance Snapshot</SectionLabel>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <SummaryChip label="Client" value={selectedBundle.client?.name || "—"} />
          <SummaryChip label="Outstanding" value={formatCurrency(selectedBundle.invoices.reduce((sum, entry) => sum + entry.balanceDue, 0))} />
          <SummaryChip label="Payments logged" value={String(selectedBundle.payments.length)} />
          <SummaryChip label="Booked" value={selectedBundle.booking.isBooked ? "Yes" : "No"} />
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
            <SummaryChip label="Date" value={session.sessionDate || "Not set"} />
            <SummaryChip label="Time" value={session.sessionTime || "Not set"} />
            <SummaryChip label="Availability Email" value={selectedBundle.projectStatus.availabilitySent ? "Sent" : "Pending"} />
            <SummaryChip label="ICS Invite" value={selectedBundle.projectStatus.calendarInviteSent ? "Sent" : "Pending"} />
          </div>
          {session.status === "awaiting_schedule" && (
            <div className="mb-5">
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => actions.sendAvailability(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium text-white" style={{ background: C.forest }}>
                  Send date selection email
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {SLOT_OPTIONS.map((slot) => (
                  <button key={`${slot.date}-${slot.time}`} onClick={() => actions.scheduleSession(selectedBundle.client.id, slot)} className="p-3 rounded-xl text-left" style={{ border: `1px solid ${C.line}` }}>
                    <p className="text-sm font-medium" style={{ color: C.ink }}>{slot.date}</p>
                    <p className="text-xs mt-1" style={{ color: C.charcoal }}>{slot.time} • {slot.locationName}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
          {session.sessionDate && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button onClick={() => actions.sendCalendarInvite(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium" style={{ background: "#edf2f5", color: C.blue }}>
                Send ICS invite
              </button>
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

  if (!selectedBundle.projectStatus.projectCreated) {
    return <EmptyState title="Portal locked" body="The portal editor stays unavailable until the client is truly booked: quote accepted, contract signed, and payment received." />;
  }

  const update = (patch) => actions.updatePortal(selectedBundle.client.id, patch);
  const addProp = () => update({ propList: [...(portal.propList || []), ""] });
  const removeProp = (index) => update({ propList: portal.propList.filter((_, itemIndex) => itemIndex !== index) });

  return (
    <div className="space-y-5">
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div>
            <p className="ecc-display text-3xl" style={{ color: C.ink }}>Client Portal Editor</p>
            <p className="text-sm mt-1" style={{ color: C.charcoal }}>{selectedBundle.client.name}</p>
          </div>
          <button onClick={() => setApp("client")} className="text-sm underline" style={{ color: C.forest }}>Preview client view</button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {(portal.propList || []).map((prop, index) => (
              <div key={index} className="flex items-center gap-2">
                <Field compact value={prop} onChange={(value) => update({ propList: portal.propList.map((item, itemIndex) => (itemIndex === index ? value : item)) })} />
                <button onClick={() => removeProp(index)}><X size={14} color={C.taupe} /></button>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <ImageManager
        title="Vision Board Images"
        description="Drives the slideshow + Pinterest-style grid the client sees on Vision Board."
        images={portal.visionImages || []}
        onChange={(images) => update({ visionImages: images })}
      />

      <ImageManager
        title="Gallery Images"
        description="Stays locked on the client side until the session is marked complete and the gallery is delivered."
        images={portal.galleryImages || []}
        onChange={(images) => update({ galleryImages: images })}
        footer={
          <button
            disabled={selectedBundle.session?.status !== "completed" || selectedBundle.session?.galleryStatus === "delivered"}
            onClick={() => actions.deliverGallery(selectedBundle.client.id)}
            className="mt-3 px-3 py-2 rounded-full text-xs font-medium text-white disabled:opacity-40"
            style={{ background: C.forest }}
          >
            {selectedBundle.session?.galleryStatus === "delivered" ? "Gallery delivered" : "Deliver gallery to client"}
          </button>
        }
      />
    </div>
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

function EmailsPage({ selectedBundle, actions }) {
  if (!selectedBundle.client) {
    return <EmptyState title="No client selected" body="Choose a client to view milestone emails." />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-5">
      <Card className="p-5">
        <SectionLabel icon={Mail}>Milestone Emails</SectionLabel>
        <div className="flex flex-wrap gap-2 mb-4">
          <button disabled={!selectedBundle.projectStatus.projectCreated} onClick={() => actions.sendPortalAccess(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.forest, color: "#fff" }}>
            Portal access
          </button>
          <button disabled={!selectedBundle.projectStatus.projectCreated} onClick={() => actions.sendAvailability(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: C.cream, color: C.ink }}>
            Date selection
          </button>
          <button disabled={!selectedBundle.session?.sessionDate} onClick={() => actions.sendCalendarInvite(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#edf2f5", color: C.blue }}>
            Calendar invite
          </button>
          <button disabled={selectedBundle.booking.isBooked} onClick={() => actions.sendBookingReminder(selectedBundle.client.id)} className="px-3 py-2 rounded-full text-xs font-medium disabled:opacity-40" style={{ background: "#f8ece8", color: C.red }}>
            Not-booked reminder
          </button>
        </div>
        <p className="text-sm" style={{ color: C.charcoal }}>
          These actions make the handoff visible inside admin instead of relying on implied status changes.
        </p>
      </Card>

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

function CalendarPage({ state, selectedBundle, actions }) {
  const [selected, setSelected] = useState(22);
  const days = Array.from({ length: 30 }, (_, index) => index + 1);

  const eventsByDay = useMemo(() => {
    const map = {};
    state.sessions
      .filter((session) => session.sessionDate)
      .forEach((session) => {
        const day = Number((session.sessionDate.match(/\d{1,2}/) || [])[0]);
        if (!day) return;
        const bundle = getClientBundle(state, session.clientId);
        map[day] = map[day] || [];
        map[day].push({ title: `${bundle.client?.sessionType || "Session"} — ${bundle.client?.name || "Client"}`, time: session.sessionTime, clientId: session.clientId });
      });
    return map;
  }, [state]);

  const dayEvents = eventsByDay[selected] || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
      <Card className="p-5">
        <div className="flex items-center justify-between mb-1">
          <button className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: C.cream, color: C.forest }} onClick={() => setSelected(22)}>Today</button>
          <p className="ecc-display text-2xl" style={{ color: C.ink }}>July 2026</p>
          <div className="flex gap-3"><ChevronLeft size={18} color={C.charcoal} /><ChevronRight size={18} color={C.charcoal} /></div>
        </div>
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="grid grid-cols-7 gap-1 text-xs mt-4 mb-1">
            {["S", "M", "T", "W", "T", "F", "S"].map((label, index) => (
              <div key={index} className="text-center font-medium pb-1" style={{ color: C.taupe }}>{label}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const has = eventsByDay[day];
              const isSelected = day === selected;
              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className="aspect-square rounded-full flex items-center justify-center text-sm relative"
                  style={{ background: isSelected ? C.forest : has ? C.cream : "transparent", color: isSelected ? "#fff" : C.ink }}
                >
                  {day}
                  {has && !isSelected && <span className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: C.forest }} />}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="p-5 lg:self-start">
        <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>July {selected}, 2026</p>
        {dayEvents.length === 0 && <p className="text-sm" style={{ color: C.taupe }}>Nothing scheduled.</p>}
        {dayEvents.map((event, index) => (
          <button
            key={index}
            onClick={() => actions.selectClient(event.clientId)}
            className="w-full text-left flex items-center gap-3 py-2.5"
            style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}
          >
            <div className="w-1 self-stretch rounded-full" style={{ background: C.forest }} />
            <div className="flex-1">
              <p className="text-sm" style={{ color: C.forest }}>{event.title}</p>
              <p className="text-xs" style={{ color: C.taupe }}>{event.time || "Time TBD"}</p>
            </div>
          </button>
        ))}
        {selectedBundle.session?.sessionDate && (
          <p className="text-[11px] mt-3" style={{ color: C.taupe }}>
            Selected client's session: {selectedBundle.session.sessionDate} at {selectedBundle.session.sessionTime || "TBD"}.
          </p>
        )}
      </Card>
    </div>
  );
}

function MarketingPage({ state }) {
  const segments = useMemo(() => {
    const counts = {};
    state.clients.forEach((client) => (client.tags || []).forEach((tag) => { counts[tag] = (counts[tag] || 0) + 1; }));
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [state.clients]);

  const campaigns = [
    { name: "Fall Mini-Sessions Promo", segment: segments[0]?.name || "All clients", status: "Sent", stats: "41% open · 9% click" },
    { name: "Welcome Series — New Inquiry", segment: "All inquiries", status: "Automated", stats: "Triggers on inquiry approval" },
    { name: "Past Client Re-Engagement", segment: "Returning inquiry", status: "Draft", stats: "—" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="ecc-display text-2xl" style={{ color: C.ink }}>Email Marketing</p>
        <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium text-white" style={{ background: C.forest }}>
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
            <div key={segment.name} className="rounded-xl p-3" style={{ border: `1px solid ${C.line}` }}>
              <p className="ecc-display text-2xl" style={{ color: C.ink }}>{segment.count}</p>
              <p className="text-xs" style={{ color: C.charcoal }}>{segment.name}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionLabel icon={Mail}>Campaigns</SectionLabel>
        <div className="px-5 pb-5">
          {campaigns.map((campaign, index) => (
            <div key={campaign.name} className="flex items-center justify-between py-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
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

function SocialPage() {
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
          <button className="flex items-center gap-1 text-xs font-medium" style={{ color: C.forest }}><Plus size={12} /> Add rule</button>
        </div>
        {DM_RULES.map((rule, index) => (
          <div key={rule.keyword} className="flex items-center justify-between py-3" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
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
    { id: "c1", name: "Maternity Session Contract", created: "Jan 17, 2026", body: "This agreement outlines the terms of {{client_name}}'s session on {{session_date}}.", settings: { signatureRequired: true, documentExpiry: false, documentReminders: true } },
    { id: "c2", name: "Wedding Photography Contract", created: "Jun 18, 2025", body: "Photography services agreement between EC Creative Studios and {{client_name}}.", settings: { signatureRequired: true, documentExpiry: false, documentReminders: true } },
  ],
  invoices: [
    { id: "i1", name: "Deposit Invoice", created: "Feb 1, 2026", body: "Deposit due to secure {{session_date}}.", settings: { paymentDue: "Within 7 days" } },
    { id: "i2", name: "Final Balance Invoice", created: "Mar 4, 2026", body: "Remaining balance due before session.", settings: { paymentDue: "Within 30 days" } },
  ],
  quotes: [
    { id: "q1", name: "Signature Experience Quote", created: "Jan 2, 2026", body: "A fully curated photography experience for {{client_name}}.", settings: { autoCreateInvoice: true, documentExpiry: false, documentReminders: false } },
  ],
  questionnaires: [
    { id: "qq1", name: "Session Prep Questionnaire", created: "Jan 10, 2026", body: "Help us prepare for your session.", settings: { documentExpiry: false, documentReminders: true } },
  ],
  emails: [
    { id: "e1", name: "Welcome Email — New Inquiry", created: "Jan 5, 2026", subject: "Thanks for reaching out, {{client_name}}!", body: "We're so excited to learn more about your {{session_type}}." },
    { id: "e2", name: "Booking Confirmation", created: "Jan 5, 2026", subject: "You're booked, {{client_name}}!", body: "Your {{session_type}} is confirmed for {{session_date}}." },
  ],
};

const TEMPLATE_VARIABLES = ["{{client_name}}", "{{session_type}}", "{{session_date}}", "{{session_time}}", "{{location}}", "{{total}}", "{{deposit}}"];

function TemplatesPage() {
  const [tab, setTab] = useState("contracts");
  const [data, setData] = useState(SEED_TEMPLATES);
  const [editing, setEditing] = useState(null);

  const list = data[tab];
  const current = editing && data[editing.type].find((entry) => entry.id === editing.id);

  const updateField = (field, value) => setData((d) => ({ ...d, [editing.type]: d[editing.type].map((entry) => (entry.id === editing.id ? { ...entry, [field]: value } : entry)) }));
  const updateSetting = (key, value) => setData((d) => ({ ...d, [editing.type]: d[editing.type].map((entry) => (entry.id === editing.id ? { ...entry, settings: { ...entry.settings, [key]: value } } : entry)) }));
  const insertVariable = (variable) => updateField("body", `${current.body || ""} ${variable}`);

  const newTemplate = () => {
    const id = `${tab}_${Date.now()}`;
    const blank = tab === "emails"
      ? { id, name: "Untitled Email Template", created: "Just now", subject: "", body: "" }
      : { id, name: `Untitled ${TEMPLATE_TABS.find((entry) => entry.key === tab).label.replace(/s$/, "")} Template`, created: "Just now", body: "", settings: tab === "invoices" ? { paymentDue: "Within 30 days" } : tab === "quotes" ? { autoCreateInvoice: true, documentExpiry: false, documentReminders: false } : { documentExpiry: false, documentReminders: false, ...(tab === "contracts" ? { signatureRequired: true } : {}) } };
    setData((d) => ({ ...d, [tab]: [blank, ...d[tab]] }));
    setEditing({ type: tab, id });
  };

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

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4">
          {editing.type !== "emails" ? (
            <Card className="p-4 h-fit">
              <p className="text-xs uppercase tracking-[0.25em] mb-3" style={{ color: C.taupe }}>Template Settings</p>
              <div className="space-y-4">
                {editing.type === "contracts" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.ink }}>Signature required</span>
                    <Toggle checked={!!current.settings.signatureRequired} onChange={(value) => updateSetting("signatureRequired", value)} />
                  </div>
                )}
                {editing.type === "quotes" && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: C.ink }}>Auto-create invoice</span>
                    <Toggle checked={!!current.settings.autoCreateInvoice} onChange={(value) => updateSetting("autoCreateInvoice", value)} />
                  </div>
                )}
                {editing.type === "invoices" ? (
                  <div>
                    <p className="text-sm mb-1.5" style={{ color: C.ink }}>Payment due</p>
                    <select value={current.settings.paymentDue} onChange={(event) => updateSetting("paymentDue", event.target.value)} className="w-full px-3 py-2 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }}>
                      {["Within 7 days", "Within 14 days", "Within 30 days", "On receipt"].map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: C.ink }}>Document expiry</span>
                      <Toggle checked={!!current.settings.documentExpiry} onChange={(value) => updateSetting("documentExpiry", value)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: C.ink }}>Document reminders</span>
                      <Toggle checked={!!current.settings.documentReminders} onChange={(value) => updateSetting("documentReminders", value)} />
                    </div>
                  </>
                )}
              </div>
            </Card>
          ) : <div className="hidden lg:block" />}

          <Card className="p-5">
            {editing.type === "emails" && (
              <input value={current.subject} onChange={(event) => updateField("subject", event.target.value)} placeholder="Subject" className="w-full mb-3 px-3 py-2 rounded-xl text-sm font-medium" style={{ border: `1px solid ${C.line}`, color: C.ink }} />
            )}
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
        {TEMPLATE_TABS.map((tabOption) => (
          <button key={tabOption.key} onClick={() => setTab(tabOption.key)} className="px-3.5 py-2 rounded-full text-sm font-medium shrink-0" style={{ background: tab === tabOption.key ? C.charcoal : "transparent", color: tab === tabOption.key ? "#fff" : C.charcoal }}>
            {tabOption.label}
          </button>
        ))}
      </div>
      <Card>
        {list.map((template, index) => (
          <button key={template.id} onClick={() => setEditing({ type: tab, id: template.id })} className="w-full flex items-center justify-between px-5 py-3.5 text-left" style={{ borderTop: index === 0 ? "none" : `1px solid ${C.line}` }}>
            <span className="text-sm font-medium" style={{ color: C.ink }}>{template.name}</span>
            <span className="text-xs" style={{ color: C.taupe }}>{template.created}</span>
          </button>
        ))}
      </Card>
    </div>
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

function BookingChecklistCard({ selectedBundle }) {
  if (!selectedBundle.client) {
    return <Card className="p-5"><EmptyState title="No client selected" body="Select a client to inspect the booking gate." /></Card>;
  }

  return (
    <Card className="p-5">
      <SectionLabel icon={CheckCircle2}>Booking Checklist</SectionLabel>
      <div className="space-y-3">
        {BOOKING_STEPS.map((step) => {
          const complete = selectedBundle.booking.steps[step.key];
          return (
            <div key={step.key} className="flex items-center justify-between rounded-xl px-4 py-3" style={{ background: C.bg }}>
              <span className="text-sm" style={{ color: C.ink }}>{step.label}</span>
              <Pill tone={complete ? "done" : "warn"}>{complete ? "Complete" : "Missing"}</Pill>
            </div>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
        <SummaryChip label="Booked status" value={selectedBundle.booking.isBooked ? "Booked" : "Not booked"} />
        <SummaryChip label="Project creation" value={selectedBundle.projectStatus.projectCreated ? "Unlocked" : "Locked"} />
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

function statusTone(status) {
  if (["accepted", "signed", "paid"].includes(status)) return "done";
  if (["sent", "viewed", "partially_paid"].includes(status)) return "info";
  if (["declined", "cancelled", "refunded"].includes(status)) return "warn";
  return "neutral";
}
