import React from "react";
import { C } from "../lib/brand";

export default function TopSwitcher({ app, setApp, stageLabel }) {
  return (
    <div
      className="sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 py-2.5"
      style={{ background: C.charcoal }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="ecc-display text-white text-base sm:text-lg whitespace-nowrap">EC Creative Studios</span>
        <span className="hidden sm:inline text-xs ecc-body" style={{ color: C.taupe }}>
          prototype skeleton · live stage: {stageLabel}
        </span>
      </div>
      <div className="flex rounded-full p-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
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
      </div>
    </div>
  );
}
