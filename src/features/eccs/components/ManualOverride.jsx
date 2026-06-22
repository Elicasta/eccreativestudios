"use client";

import React from "react";
import { Check, SlidersHorizontal, X } from "lucide-react";
import { C } from "../lib/brand";
import { STAGES } from "../lib/pipeline";

export default function ManualOverride({ open, setOpen, stageIndex, goToStage, balancePaid, setBalancePaid }) {
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg text-sm font-medium"
        style={{ background: C.forest, color: "#fff" }}
      >
        <SlidersHorizontal size={16} /> <span className="hidden sm:inline">Manual Override</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto" style={{ background: "#fff" }}>
            <div className="flex items-center justify-between mb-1">
              <p className="ecc-display text-xl" style={{ color: C.ink }}>Manual Override</p>
              <button onClick={() => setOpen(false)}><X size={20} color={C.charcoal} /></button>
            </div>
            <p className="text-xs mb-4" style={{ color: C.charcoal }}>
              For when a client pays by Zelle, signs in person, or anything else happens off-platform.
              Jump Sarah Garcia's project to any stage manually.
            </p>
            <div className="space-y-1.5 mb-4">
              {STAGES.map((s, i) => (
                <button
                  key={s.key}
                  onClick={() => goToStage(i)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm text-left"
                  style={{
                    background: i === stageIndex ? C.cream : "#fff",
                    border: `1px solid ${i === stageIndex ? C.taupe : C.line}`,
                    color: C.ink,
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ background: i <= stageIndex ? C.forest : C.line }}
                    />
                    {s.label}
                  </span>
                  {i === stageIndex && <Check size={15} color={C.forest} />}
                </button>
              ))}
            </div>
            <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm" style={{ border: `1px solid ${C.line}` }}>
              <input type="checkbox" checked={balancePaid} onChange={(e) => setBalancePaid(e.target.checked)} />
              Mark remaining balance as paid in full
            </label>
            <button
              onClick={() => setOpen(false)}
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-medium text-white"
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
