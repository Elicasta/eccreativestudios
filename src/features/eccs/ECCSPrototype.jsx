"use client";

import React, { useState } from "react";
import { C } from "./lib/brand";
import { STAGES, deriveDocStatus } from "./lib/pipeline";
import { makeInitialPortal } from "./lib/mock-data";
import { FontLoad } from "./components/ui";
import TopSwitcher from "./components/TopSwitcher";
import ManualOverride from "./components/ManualOverride";
import AdminApp from "./admin/AdminApp";
import ClientApp from "./client/ClientApp";

export default function ECCSPrototype() {
  const [app, setApp] = useState("admin");
  const [stageIndex, setStageIndex] = useState(7);
  const [balancePaid, setBalancePaid] = useState(false);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "studio", text: "Hi Sarah! Excited for your session. Let us know if you have any questions." },
    { from: "client", text: "Thank you! Should I bring my own outfit or do you provide one?" },
    { from: "studio", text: "We have a few flowing dresses available, but feel free to bring something you love too." },
  ]);
  const [activity, setActivity] = useState([
    { text: "Invoice INV-1001 was viewed", who: "client", time: "2m ago" },
    { text: "Payment received from Sarah Garcia", who: "system", time: "15m ago" },
    { text: "Contract signed by Sarah Garcia", who: "client", time: "1h ago" },
    { text: "New inquiry from Daniel Andersson", who: "system", time: "2h ago" },
    { text: "Quote QUO-1023 was accepted", who: "client", time: "3h ago" },
  ]);
  const [portal, setPortal] = useState(makeInitialPortal);

  const logActivity = (text) => setActivity((a) => [{ text, who: "manual", time: "Just now" }, ...a]);

  const goToStage = (i) => {
    setStageIndex(i);
    logActivity(`Pipeline moved to "${STAGES[i].label}" for Sarah Garcia`);
  };

  const status = deriveDocStatus(stageIndex);

  return (
    <div className="ecc-body min-h-screen" style={{ background: C.bg }}>
      <FontLoad />
      <TopSwitcher app={app} setApp={setApp} stageLabel={STAGES[stageIndex].label} />

      {app === "admin" ? (
        <AdminApp
          stageIndex={stageIndex}
          goToStage={goToStage}
          status={status}
          activity={activity}
          logActivity={logActivity}
          balancePaid={balancePaid}
          setBalancePaid={setBalancePaid}
          messages={messages}
          setMessages={setMessages}
          setApp={setApp}
          portal={portal}
          setPortal={setPortal}
        />
      ) : (
        <ClientApp
          stageIndex={stageIndex}
          status={status}
          balancePaid={balancePaid}
          setBalancePaid={setBalancePaid}
          goToStage={goToStage}
          logActivity={logActivity}
          messages={messages}
          setMessages={setMessages}
          portal={portal}
          setPortal={setPortal}
        />
      )}

      <ManualOverride
        open={overrideOpen}
        setOpen={setOverrideOpen}
        stageIndex={stageIndex}
        goToStage={goToStage}
        balancePaid={balancePaid}
        setBalancePaid={setBalancePaid}
      />
    </div>
  );
}
