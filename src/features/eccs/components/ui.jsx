"use client";

import React, { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { C } from "../lib/brand";

export const FontLoad = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Jost:wght@300;400;500;600&display=swap');
    .ecc-display { font-family: 'Cormorant Garamond', serif; }
    .ecc-body { font-family: 'Jost', sans-serif; }
    .ecc-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
    .ecc-scrollbar::-webkit-scrollbar-thumb { background: ${C.taupe}; border-radius: 4px; }
  `}</style>
);

export const Pill = ({ children, tone = "neutral" }) => {
  const tones = {
    neutral: { bg: "#f1ece3", color: C.ink },
    new: { bg: "#eaf1ee", color: C.forest },
    warn: { bg: "#f7ece8", color: C.red },
    done: { bg: C.forest, color: "#fff" },
    info: { bg: "#eaf0f3", color: C.blue },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className="ecc-body text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap"
      style={{ background: t.bg, color: t.color }}
    >
      {children}
    </span>
  );
};

export const StatusLight = ({ tone = "yellow", label }) => {
  const colors = { green: C.forest, yellow: "#c98a3e", red: C.red };
  return (
    <span className="flex items-center gap-2">
      <span className="w-2.5 h-2.5 rounded-full" style={{ background: colors[tone] }} />
      {label && <span className="text-sm" style={{ color: C.ink }}>{label}</span>}
    </span>
  );
};

const AVATAR_BG = [C.taupe, C.blue, C.forest, "#9c8f7a", "#7d97a3"];

export const Avatar = ({ name, size = 32 }) => {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const idx = name.length % AVATAR_BG.length;
  return (
    <div
      className="rounded-full flex items-center justify-center shrink-0 text-[11px] font-medium"
      style={{ width: size, height: size, background: AVATAR_BG[idx], color: "#fff" }}
    >
      {initials}
    </div>
  );
};

export const RowMenu = ({ options }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: open ? C.cream : "transparent" }}
      >
        <MoreHorizontal size={16} color={C.charcoal} />
      </button>
      {open && (
        <div
          className="absolute right-0 mt-1 z-20 w-48 rounded-xl shadow-lg py-1 ecc-body"
          style={{ background: "#fff", border: `1px solid ${C.line}` }}
          onMouseLeave={() => setOpen(false)}
        >
          {options.map((o, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); o.onClick && o.onClick(); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm"
              style={{ color: o.danger ? C.red : C.ink }}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-2xl border ${className}`}
    style={{ borderColor: C.line, background: "#fff", ...style }}
  >
    {children}
  </div>
);

export const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 px-5 pt-5 pb-2">
    {Icon && <Icon size={15} color={C.taupe} />}
    <span className="ecc-body text-xs uppercase tracking-wide font-medium" style={{ color: C.charcoal }}>
      {children}
    </span>
  </div>
);

export const EmptyState = ({ title, body, action }) => (
  <Card className="p-10 text-center">
    <p className="ecc-display text-2xl mb-2" style={{ color: C.ink }}>{title}</p>
    <p className="ecc-body text-sm max-w-md mx-auto" style={{ color: C.charcoal }}>{body}</p>
    {action}
  </Card>
);
