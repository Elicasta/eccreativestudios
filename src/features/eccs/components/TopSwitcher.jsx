import React from "react";
import { C } from "../lib/brand";

export default function TopSwitcher({ app, setApp, stageLabel, onManualOverride }) {
  return (
    <div
      className="ecc-top-switcher sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-2.5"
      style={{ background: C.charcoal }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="ecc-display text-white text-base sm:text-lg whitespace-nowrap"><span className="sm:hidden">EC Studios</span><span className="hidden sm:inline">EC Creative Studios</span></span>
        <span className="hidden sm:inline text-xs ecc-body" style={{ color: C.taupe }}>
          local crm demo · selected pipeline stage: {stageLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 rounded-full p-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
        {["admin", "client"].map((a) => (
          <button
            key={a}
            onClick={() => setApp(a)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition"
            style={{
              background: app === a ? C.forest : "transparent",
              color: app === a ? "#fff" : C.taupe,
            }}
          >
            {a === "admin" ? "Admin / CRM" : "Client Portal"}
          </button>
        ))}
        {onManualOverride && (
          <button
            onClick={onManualOverride}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition"
            style={{ background: C.cream, color: C.ink }}
            title="Manual Override"
          >
            Manual
          </button>
        )}
      </div>
    </div>
  );
}
