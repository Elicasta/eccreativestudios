"use client";

import React from "react";
import { AlertTriangle, Archive, Check, X } from "lucide-react";
import { C } from "../lib/brand";
import { FORCE_STAGE_ORDER, PIPELINE_LABELS } from "../lib/crm";

export default function ManualOverride({ open, setOpen, selectedBundle, actions }) {
  const client = selectedBundle?.client || null;

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 safe-modal" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: "#fff" }}>
            <div className="flex items-center justify-between mb-1">
              <p className="ecc-display text-xl" style={{ color: C.ink }}>Manual Override</p>
              <button onClick={() => setOpen(false)}><X size={20} color={C.charcoal} /></button>
            </div>

            {!client ? (
              <p className="text-sm mt-4" style={{ color: C.charcoal }}>
                No client selected. Pick a client from the sidebar first — this fast-forwards whoever is currently selected.
              </p>
            ) : (
              <>
                <p className="text-xs mb-4" style={{ color: C.charcoal }}>
                  For when a client pays by Zelle, signs in person, or anything else happens off-platform. This creates whatever
                  real quote/contract/invoice/session records are missing to get <strong>{client.name}</strong> to the stage you pick —
                  it doesn't fake a number, it builds the records.
                </p>
                <div className="space-y-1.5 mb-4">
                  {FORCE_STAGE_ORDER.map((key) => {
                    const isCurrent = selectedBundle.stage === key;
                    const rank = FORCE_STAGE_ORDER.indexOf(key);
                    const currentRank = FORCE_STAGE_ORDER.indexOf(selectedBundle.stage);
                    const passed = currentRank >= 0 && rank <= currentRank;
                    return (
                      <button
                        key={key}
                        onClick={() => { actions.forceStage(client.id, key); }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left"
                        style={{
                          background: isCurrent ? C.cream : "#fff",
                          border: `1px solid ${isCurrent ? C.taupe : C.line}`,
                          color: C.ink,
                        }}
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: passed ? C.forest : C.line }} />
                          {PIPELINE_LABELS[key]}
                        </span>
                        {isCurrent && <Check size={15} color={C.forest} />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => actions.markLost(client.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm"
                    style={{ border: `1px solid ${C.line}`, color: C.red }}
                  >
                    <AlertTriangle size={14} /> Mark lost
                  </button>
                  <button
                    onClick={() => actions.markArchived(client.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm"
                    style={{ border: `1px solid ${C.line}`, color: C.charcoal }}
                  >
                    <Archive size={14} /> Archive
                  </button>
                </div>
                <p className="text-[11px] mb-3" style={{ color: C.taupe }}>
                  Override moves a client forward only — it won't unsign a contract or unpay an invoice. For that, edit the record directly.
                </p>
              </>
            )}

            <button
              onClick={() => setOpen(false)}
              className="w-full mt-2 py-2.5 rounded-xl text-sm font-medium text-white"
              style={{ background: C.charcoal }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
}
