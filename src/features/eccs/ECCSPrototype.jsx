"use client";

import React, { useEffect, useMemo, useReducer, useState } from "react";
import { C } from "./lib/brand";
import { createInitialState, crmReducer, getClientBundle, PIPELINE_LABELS } from "./lib/crm";
import { FontLoad } from "./components/ui";
import TopSwitcher from "./components/TopSwitcher";
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
      createQuote: (clientId) => dispatch({ type: "create_quote", clientId }),
      patchQuote: (quoteId, patch) => dispatch({ type: "patch_quote", quoteId, patch }),
      addQuoteItem: (quoteId) => dispatch({ type: "add_quote_item", quoteId }),
      patchQuoteItem: (quoteId, itemId, patch) => dispatch({ type: "patch_quote_item", quoteId, itemId, patch }),
      removeQuoteItem: (quoteId, itemId) => dispatch({ type: "remove_quote_item", quoteId, itemId }),
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
    </div>
  );
}
