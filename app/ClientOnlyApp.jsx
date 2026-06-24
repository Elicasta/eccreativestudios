"use client";

import dynamic from "next/dynamic";

const ECCSPrototype = dynamic(() => import("@/features/eccs/ECCSPrototype"), {
  ssr: false,
  loading: () => (
    <main className="min-h-screen grid place-items-center px-6 text-center" style={{ background: "#F7F2E8", color: "#1F2A24" }}>
      <div>
        <p className="text-xs tracking-[0.28em] uppercase opacity-70">EC Creative Studios</p>
        <h1 className="mt-3 text-2xl font-semibold">Loading CRM</h1>
      </div>
    </main>
  ),
});

export default function ClientOnlyApp() {
  return <ECCSPrototype />;
}
