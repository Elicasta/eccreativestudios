"use client";

import React from "react";
import { X } from "lucide-react";
import { C } from "../lib/brand";
import { SARAH } from "../lib/mock-data";
import { Card, Pill } from "./ui";

export default function DocModal({ kind, onClose, status, goToStage, stageIndex }) {
  const config = {
    inquiry: { title: "Inquiry Form", body: `${SARAH.name} · ${SARAH.email} · ${SARAH.sessionType} · Budget ${SARAH.budget}`, action: null },
    quote: {
      title: "Quote " + SARAH.quoteId,
      body: `${SARAH.package} — $${SARAH.total} total`,
      action: status.quote === "sent" ? { label: "Mark Quote Accepted", to: 2 } : null,
    },
    contract: {
      title: "Contract " + SARAH.contractId,
      body: `Photography agreement for ${SARAH.name}, ${SARAH.sessionType}.`,
      action: status.contract === "sent" ? { label: "Mark Contract Signed", to: 4 } : null,
    },
    invoice: {
      title: "Invoice " + SARAH.invoiceId,
      body: `Deposit $${SARAH.deposit} of $${SARAH.total} total.`,
      action: status.invoice === "sent" ? { label: "Mark Deposit Paid", to: 6 } : null,
    },
  }[kind];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.4)" }}>
      <Card className="p-6 max-w-sm w-full" style={{ background: "#fff" }}>
        <div className="flex justify-between items-start mb-3">
          <p className="ecc-display text-xl" style={{ color: C.ink }}>{config.title}</p>
          <button onClick={onClose}><X size={18} color={C.charcoal} /></button>
        </div>
        <p className="text-sm mb-5" style={{ color: C.charcoal }}>{config.body}</p>
        {config.action ? (
          <button onClick={() => { goToStage(config.action.to); onClose(); }} className="w-full py-2.5 rounded-xl text-sm font-medium text-white" style={{ background: C.forest }}>
            {config.action.label}
          </button>
        ) : (
          <Pill tone="done">Up to date</Pill>
        )}
      </Card>
    </div>
  );
}
