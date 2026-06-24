"use client";

import React, { useEffect, useMemo, useReducer, useState } from "react";
import { C } from "./lib/brand";
import { createInitialState, crmReducer, getClientBundle, PIPELINE_LABELS, DEFAULT_NOTIFICATION_SETTINGS } from "./lib/crm";
import { FontLoad } from "./components/ui";
import TopSwitcher from "./components/TopSwitcher";
import ManualOverride from "./components/ManualOverride";
import AdminApp from "./admin/AdminApp";
import ClientApp from "./client/ClientApp";

const STORAGE_KEY = "eccs-crm-v7";

const PUSH_SENT_KEY = "eccs-crm-push-sent-v1";
const PUSH_BOOTSTRAP_KEY = "eccs-crm-push-bootstrapped-v1";

function normalizeNotificationSettings(settings) {
  return {
    ...DEFAULT_NOTIFICATION_SETTINGS,
    ...(settings || {}),
    categories: {
      ...DEFAULT_NOTIFICATION_SETTINGS.categories,
      ...(settings?.categories || {}),
    },
    quietHours: {
      ...DEFAULT_NOTIFICATION_SETTINGS.quietHours,
      ...(settings?.quietHours || {}),
    },
    devices: Array.isArray(settings?.devices) ? settings.devices : [],
  };
}

function parseClockMinutes(value = "") {
  const [hour = "0", minute = "0"] = String(value).split(":");
  return Number(hour) * 60 + Number(minute);
}

function isInsideQuietHours(quietHours = {}) {
  if (!quietHours.enabled) return false;
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const start = parseClockMinutes(quietHours.start || "21:00");
  const end = parseClockMinutes(quietHours.end || "08:00");
  if (start === end) return false;
  if (start < end) return current >= start && current < end;
  return current >= start || current < end;
}

function notificationTriggersFromState(state) {
  const clients = Array.isArray(state.clients) ? state.clients : [];
  const clientName = (clientId) => clients.find((client) => client.id === clientId)?.name || "EC Creative Studios";
  const messages = Array.isArray(state.messages) ? state.messages : [];
  const inquiries = Array.isArray(state.inquiries) ? state.inquiries : [];
  const quotes = Array.isArray(state.quotes) ? state.quotes : [];
  const contracts = Array.isArray(state.contracts) ? state.contracts : [];
  const invoices = Array.isArray(state.invoices) ? state.invoices : [];
  const sessions = Array.isArray(state.sessions) ? state.sessions : [];

  return [
    ...messages
      .filter((message) => message.from === "client" && !message.readAt)
      .map((message) => ({
        id: `message:${message.id}`,
        category: "messages",
        title: `New message from ${clientName(message.clientId)}`,
        body: message.text || "Open the CRM to reply.",
        url: "/",
      })),
    ...inquiries
      .filter((inquiry) => ["new", "follow_up"].includes(inquiry.status))
      .map((inquiry) => ({
        id: `inquiry:${inquiry.id}:${inquiry.status}`,
        category: "inquiries",
        title: inquiry.status === "follow_up" ? "Inquiry needs follow-up" : "New inquiry received",
        body: `${inquiry.name || "A client"} · ${inquiry.sessionType || "Session"}`,
        url: "/",
      })),
    ...quotes
      .filter((quote) => ["viewed", "accepted", "declined"].includes(quote.status))
      .map((quote) => ({
        id: `quote:${quote.id}:${quote.status}`,
        category: "quotes",
        title: quote.status === "accepted" ? "Quote accepted" : quote.status === "declined" ? "Quote declined" : "Quote viewed",
        body: `${clientName(quote.clientId)} · ${quote.number || "Quote"}`,
        url: "/",
      })),
    ...contracts
      .filter((contract) => ["sent", "signed"].includes(contract.status))
      .map((contract) => ({
        id: `contract:${contract.id}:${contract.status}`,
        category: "contracts",
        title: contract.status === "signed" ? "Contract signed" : "Contract still pending",
        body: `${clientName(contract.clientId)} · ${contract.number || "Contract"}`,
        url: "/",
      })),
    ...invoices
      .filter((invoice) => ["sent", "partially_paid", "paid"].includes(invoice.status))
      .map((invoice) => ({
        id: `invoice:${invoice.id}:${invoice.status}:${invoice.balanceDue}`,
        category: invoice.status === "paid" ? "payments" : "invoices",
        title: invoice.status === "paid" ? "Invoice paid" : "Open invoice",
        body: `${clientName(invoice.clientId)} · ${invoice.number || "Invoice"}${invoice.balanceDue ? ` · $${Number(invoice.balanceDue).toLocaleString()} due` : ""}`,
        url: "/",
      })),
    ...sessions
      .filter((session) => session.status === "scheduled" && session.sessionDate)
      .map((session) => ({
        id: `session:${session.id}:${session.sessionDate}:${session.sessionTime}`,
        category: "sessions",
        title: "Session scheduled",
        body: `${clientName(session.clientId)} · ${session.sessionDate}${session.sessionTime ? ` at ${session.sessionTime}` : ""}`,
        url: "/",
      })),
  ];
}

function PushNotificationBridge({ state }) {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const settings = normalizeNotificationSettings(state.notificationSettings);
    const triggers = notificationTriggersFromState(state).filter((trigger) => settings.categories?.[trigger.category] !== false);
    const currentIds = triggers.map((trigger) => trigger.id);

    try {
      if (!window.localStorage.getItem(PUSH_BOOTSTRAP_KEY)) {
        window.localStorage.setItem(PUSH_SENT_KEY, JSON.stringify(currentIds));
        window.localStorage.setItem(PUSH_BOOTSTRAP_KEY, "1");
        return;
      }
    } catch {
      return;
    }

    if (!settings.enabled || settings.permission !== "granted" || !("Notification" in window) || Notification.permission !== "granted") return;
    if (isInsideQuietHours(settings.quietHours)) return;

    let sentIds = [];
    try {
      sentIds = JSON.parse(window.localStorage.getItem(PUSH_SENT_KEY) || "[]");
    } catch {
      sentIds = [];
    }
    const sent = new Set(sentIds);
    const next = triggers.filter((trigger) => !sent.has(trigger.id));
    if (!next.length) return;

    next.slice(0, 3).forEach((trigger) => {
      sent.add(trigger.id);
      const payload = {
        body: trigger.body,
        tag: trigger.id,
        badge: "/icons/icon-192.png",
        icon: "/icons/icon-192.png",
        data: { url: trigger.url || "/" },
      };
      navigator.serviceWorker.ready
        .then((registration) => registration.showNotification(trigger.title, payload))
        .catch(() => new Notification(trigger.title, payload));
    });

    try {
      window.localStorage.setItem(PUSH_SENT_KEY, JSON.stringify(Array.from(sent).slice(-200)));
    } catch {
      // Ignore storage failures. Notifications are a convenience layer.
    }
  }, [state]);

  return null;
}

function initState() {
  const fresh = createInitialState();
  if (typeof window === "undefined") return fresh;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fresh;
    const stored = JSON.parse(raw);
    return {
      ...fresh,
      ...stored,
      availability: Array.isArray(stored.availability) ? stored.availability : fresh.availability,
      activity: Array.isArray(stored.activity) ? stored.activity : fresh.activity,
      messages: Array.isArray(stored.messages) ? stored.messages : fresh.messages,
      notes: Array.isArray(stored.notes) ? stored.notes : fresh.notes,
      emailLogs: Array.isArray(stored.emailLogs) ? stored.emailLogs : fresh.emailLogs,
      scheduledEmails: Array.isArray(stored.scheduledEmails) ? stored.scheduledEmails : fresh.scheduledEmails,
      marketingCampaigns: Array.isArray(stored.marketingCampaigns) ? stored.marketingCampaigns : fresh.marketingCampaigns,
      socialRules: Array.isArray(stored.socialRules) ? stored.socialRules : fresh.socialRules,
      locations: stored.locations?.length ? stored.locations : fresh.locations,
      emailTemplates: stored.emailTemplates?.length ? stored.emailTemplates : fresh.emailTemplates,
      contractTemplates: stored.contractTemplates?.length ? stored.contractTemplates : fresh.contractTemplates,
      quoteTemplates: stored.quoteTemplates?.length ? stored.quoteTemplates : fresh.quoteTemplates,
      portalDefaults: stored.portalDefaults?.length ? stored.portalDefaults : fresh.portalDefaults,
      calendarConnections: stored.calendarConnections || fresh.calendarConnections,
      notificationSettings: normalizeNotificationSettings(stored.notificationSettings || fresh.notificationSettings),
      notificationEvents: Array.isArray(stored.notificationEvents) ? stored.notificationEvents : fresh.notificationEvents,
      availabilityLastEditedAt: stored.availabilityLastEditedAt || fresh.availabilityLastEditedAt,
      portalProfiles: (stored.portalProfiles || fresh.portalProfiles).map((profile) => ({
        ...profile,
        printStoreLink: profile.printStoreLink || "",
        planPrepSteps: profile.planPrepSteps?.length ? profile.planPrepSteps : fresh.portalDefaults,
      })),
    };
  } catch {
    return fresh;
  }
}

export default function ECCSPrototype() {
  const [app, setApp] = useState("admin");
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [state, dispatch] = useReducer(crmReducer, undefined, initState);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const selectedBundle = useMemo(
    () => getClientBundle(state, state.selectedClientId),
    [state],
  );

  const actions = useMemo(
    () => ({
      selectClient: (clientId) => dispatch({ type: "select_client", clientId }),
      approveInquiry: (inquiryId) => dispatch({ type: "approve_inquiry", inquiryId }),
      patchInquiry: (inquiryId, patch) => dispatch({ type: "patch_inquiry", inquiryId, patch }),
      startQuoteFromInquiry: (inquiryId) => dispatch({ type: "start_quote_from_inquiry", inquiryId }),
      createQuote: (clientId, options = {}) => dispatch({ type: "create_quote", clientId, ...options }),
      addQuoteCatalogItem: (quoteId, item) => dispatch({ type: "add_quote_catalog_item", quoteId, ...item }),
      patchQuote: (quoteId, patch) => dispatch({ type: "patch_quote", quoteId, patch }),
      addQuoteItem: (quoteId) => dispatch({ type: "add_quote_item", quoteId }),
      patchQuoteItem: (quoteId, itemId, patch) => dispatch({ type: "patch_quote_item", quoteId, itemId, patch }),
      removeQuoteItem: (quoteId, itemId) => dispatch({ type: "remove_quote_item", quoteId, itemId }),
      addQuotePackageGroup: (quoteId, selectedPackageId) => dispatch({ type: "add_quote_package_group", quoteId, selectedPackageId }),
      patchQuoteOptionGroup: (quoteId, groupId, patch) => dispatch({ type: "patch_quote_option_group", quoteId, groupId, patch }),
      removeQuoteOptionGroup: (quoteId, groupId) => dispatch({ type: "remove_quote_option_group", quoteId, groupId }),
      addQuoteOption: (quoteId, groupId) => dispatch({ type: "add_quote_option", quoteId, groupId }),
      patchQuoteOption: (quoteId, groupId, optionId, patch) => dispatch({ type: "patch_quote_option", quoteId, groupId, optionId, patch }),
      removeQuoteOption: (quoteId, groupId, optionId) => dispatch({ type: "remove_quote_option", quoteId, groupId, optionId }),
      selectQuoteOption: (quoteId, groupId, optionId, selected = true) => dispatch({ type: "select_quote_option", quoteId, groupId, optionId, selected }),
      sendQuote: (quoteId) => dispatch({ type: "send_quote", quoteId }),
      viewQuote: (quoteId) => dispatch({ type: "view_quote", quoteId }),
      acceptQuote: (quoteId) => dispatch({ type: "accept_quote", quoteId }),
      declineQuote: (quoteId) => dispatch({ type: "decline_quote", quoteId }),
      createContract: (clientId) => dispatch({ type: "create_contract", clientId }),
      sendContract: (contractId) => dispatch({ type: "send_contract", contractId }),
      signContract: (contractId) => dispatch({ type: "sign_contract", contractId }),
      createInvoice: (clientId, kind) => dispatch({ type: "create_invoice", clientId, kind }),
      patchInvoice: (invoiceId, patch) => dispatch({ type: "patch_invoice", invoiceId, patch }),
      sendInvoice: (invoiceId) => dispatch({ type: "send_invoice", invoiceId }),
      recordPayment: (invoiceId, amount, method, note) =>
        dispatch({ type: "record_payment", invoiceId, amount, method, note }),
      scheduleSession: (clientId, payload) => dispatch({ type: "schedule_session", clientId, ...payload }),
      completeSession: (sessionId) => dispatch({ type: "complete_session", sessionId }),
      sendPortalAccess: (clientId) => dispatch({ type: "send_portal_access", clientId }),
      sendBookingReminder: (clientId) => dispatch({ type: "send_booking_reminder", clientId }),
      sendAvailability: (clientId) => dispatch({ type: "send_availability", clientId }),
      sendCalendarInvite: (clientId) => dispatch({ type: "send_calendar_invite", clientId }),
      updatePortal: (clientId, patch) => dispatch({ type: "update_portal", clientId, patch }),
      sendMessage: (clientId, text, from = "studio") => dispatch({ type: "send_message", clientId, text, from }),
      forceStage: (clientId, stageKey) => dispatch({ type: "force_stage", clientId, stageKey }),
      updateStudioSettings: (patch) => dispatch({ type: "update_studio_settings", patch }),
      patchContract: (contractId, patch) => dispatch({ type: "patch_contract", contractId, patch }),
      addInvoiceItem: (invoiceId) => dispatch({ type: "add_invoice_item", invoiceId }),
      addInvoiceCatalogItem: (invoiceId, item) => dispatch({ type: "add_invoice_catalog_item", invoiceId, ...item }),
      patchInvoiceItem: (invoiceId, itemId, patch) => dispatch({ type: "patch_invoice_item", invoiceId, itemId, patch }),
      removeInvoiceItem: (invoiceId, itemId) => dispatch({ type: "remove_invoice_item", invoiceId, itemId }),
      markLost: (clientId) => dispatch({ type: "mark_lost", clientId }),
      markArchived: (clientId) => dispatch({ type: "mark_archived", clientId }),
      deliverGallery: (clientId) => dispatch({ type: "deliver_gallery", clientId }),
      setAvailability: (date, times) => dispatch({ type: "set_availability", date, times }),
      addAvailabilitySlot: (date, time) => dispatch({ type: "add_availability_slot", date, time }),
      removeAvailabilitySlot: (date, time) => dispatch({ type: "remove_availability_slot", date, time }),
      scheduleEmail: (clientId, subject, body, sendAt) => dispatch({ type: "schedule_email", clientId, subject, body, sendAt }),
      sendScheduledEmailNow: (id) => dispatch({ type: "send_scheduled_email_now", id }),
      cancelScheduledEmail: (id) => dispatch({ type: "cancel_scheduled_email", id }),
      addAddon: (addon) => dispatch({ type: "add_addon", ...addon }),
      updateAddon: (addonId, patch) => dispatch({ type: "update_addon", addonId, patch }),
      removeAddon: (addonId) => dispatch({ type: "remove_addon", addonId }),
      createClient: (payload) => dispatch({ type: "create_client", ...payload }),
      createInquiry: (payload) => dispatch({ type: "create_inquiry", ...payload }),
      logEmail: (payload) => dispatch({ type: "log_email", ...payload }),
      addMarketingCampaign: (payload) => dispatch({ type: "add_marketing_campaign", ...payload }),
      addSocialRule: (payload) => dispatch({ type: "add_social_rule", ...payload }),
      refundPayment: (paymentId, amount, note) => dispatch({ type: "refund_payment", paymentId, amount, note }),
      deletePayment: (paymentId) => dispatch({ type: "delete_payment", paymentId }),
      patchSession: (sessionId, patch) => dispatch({ type: "patch_session", sessionId, patch }),
      updateEmailTemplate: (key, patch) => dispatch({ type: "update_email_template", key, patch }),
      addLocation: (payload) => dispatch({ type: "add_location", ...payload }),
      updateLocation: (locationId, patch) => dispatch({ type: "update_location", locationId, patch }),
      removeLocation: (locationId) => dispatch({ type: "remove_location", locationId }),
      updateCalendarConnection: (provider, connected) => dispatch({ type: "update_calendar_connection", provider, connected }),
      updateNotificationSettings: (patch) => dispatch({ type: "update_notification_settings", patch }),
      registerNotificationDevice: (device) => dispatch({ type: "register_notification_device", device }),
      removeNotificationDevice: (deviceId) => dispatch({ type: "remove_notification_device", deviceId }),
      deleteQuote: (quoteId) => dispatch({ type: "delete_quote", quoteId }),
      deleteContract: (contractId) => dispatch({ type: "delete_contract", contractId }),
      deleteInvoice: (invoiceId) => dispatch({ type: "delete_invoice", invoiceId }),
      resetDemo: () => window.localStorage.removeItem(STORAGE_KEY),
    }),
    [],
  );

  return (
    <div className="ecc-body min-h-screen" style={{ background: C.bg }}>
      <FontLoad />
      <PushNotificationBridge state={state} />
      <TopSwitcher
        app={app}
        setApp={setApp}
        stageLabel={selectedBundle.client ? PIPELINE_LABELS[selectedBundle.stage] : "No client selected"}
      />

      {app === "admin" ? (
        <AdminApp
          state={state}
          selectedBundle={selectedBundle}
          actions={actions}
          setApp={setApp}
          openManualOverride={() => setOverrideOpen(true)}
        />
      ) : (
        <ClientApp state={state} selectedBundle={selectedBundle} actions={actions} setApp={setApp} />
      )}

      {app === "admin" && (
        <ManualOverride open={overrideOpen} setOpen={setOverrideOpen} selectedBundle={selectedBundle} actions={actions} />
      )}
    </div>
  );
}
