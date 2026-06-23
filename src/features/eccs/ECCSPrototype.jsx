"use client";

import React, { useEffect, useMemo, useReducer, useState } from "react";
import { C } from "./lib/brand";
import { createInitialState, crmReducer, getClientBundle, PIPELINE_LABELS } from "./lib/crm";
import { FontLoad } from "./components/ui";
import TopSwitcher from "./components/TopSwitcher";
import ManualOverride from "./components/ManualOverride";
import AdminApp from "./admin/AdminApp";
import ClientApp from "./client/ClientApp";

const STORAGE_KEY = "eccs-crm-v2";

function initState() {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : createInitialState();
  } catch {
    return createInitialState();
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
      resetDemo: () => window.localStorage.removeItem(STORAGE_KEY),
    }),
    [],
  );

  return (
    <div className="ecc-body min-h-screen" style={{ background: C.bg }}>
      <FontLoad />
      <TopSwitcher
        app={app}
        setApp={setApp}
        stageLabel={selectedBundle.client ? PIPELINE_LABELS[selectedBundle.stage] : "No client selected"}
      />

      {app === "admin" ? (
        <AdminApp state={state} selectedBundle={selectedBundle} actions={actions} setApp={setApp} />
      ) : (
        <ClientApp state={state} selectedBundle={selectedBundle} actions={actions} setApp={setApp} />
      )}

      <ManualOverride open={overrideOpen} setOpen={setOverrideOpen} selectedBundle={selectedBundle} actions={actions} />
    </div>
  );
}
