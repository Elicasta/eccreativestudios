export const STAGES = [
  { key: "inquiry", label: "Inquiry" },
  { key: "quote_sent", label: "Quote Sent" },
  { key: "quote_accepted", label: "Quote Accepted" },
  { key: "contract_sent", label: "Contract Sent" },
  { key: "contract_signed", label: "Contract Signed" },
  { key: "invoice_sent", label: "Deposit Invoice Sent" },
  { key: "deposit_paid", label: "Deposit Paid — Pick a Date" },
  { key: "booked", label: "Booked" },
  { key: "session_complete", label: "Session Complete" },
  { key: "gallery_delivered", label: "Gallery Delivered" },
];

export function deriveDocStatus(stageIndex) {
  const quote = stageIndex >= 2 ? "accepted" : stageIndex >= 1 ? "sent" : "draft";
  const contract = stageIndex >= 4 ? "signed" : stageIndex >= 3 ? "sent" : "not_sent";
  const invoice = stageIndex >= 6 ? "deposit_paid" : stageIndex >= 5 ? "sent" : "not_sent";
  const dateSelected = stageIndex >= 7;
  const projectCreated = stageIndex >= 7;
  const readyToSecure = contract === "signed" && invoice === "deposit_paid" && !dateSelected;
  const needsAttention = stageIndex >= 5 && stageIndex < 6;

  return {
    inquiryForm: "received",
    quote,
    contract,
    invoice,
    dateSelected,
    projectCreated,
    readyToSecure,
    needsAttention,
    sessionStatus:
      stageIndex >= 8 ? "Completed" : stageIndex >= 7 ? "Booked" : stageIndex >= 6 ? "Awaiting Date" : stageIndex >= 4 ? "On Track" : "Planning",
    statusLight: stageIndex >= 7 ? "green" : stageIndex >= 1 ? "yellow" : "red",
    gallery: stageIndex >= 9 ? "delivered" : "pending",
  };
}

export function docLabel(doc, status) {
  const map = {
    quote: { draft: "Draft", sent: "Sent", accepted: "Accepted" },
    contract: { not_sent: "Not Sent", sent: "Sent", signed: "Signed" },
    invoice: { not_sent: "Not Sent", sent: "Deposit Due", deposit_paid: "Deposit Paid" },
  };
  return map[doc]?.[status] || status;
}

export function docTone(status) {
  if (["accepted", "signed", "deposit_paid", "received", "delivered"].includes(status)) return "done";
  if (["sent"].includes(status)) return "info";
  return "neutral";
}
