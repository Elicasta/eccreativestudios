export const SARAH = {
  name: "Sarah Garcia",
  email: "sarahgarcia@email.com",
  phone: "(214) 555-3872",
  sessionType: "Maternity Session",
  date: "July 20, 2026",
  time: "4:30 PM",
  location: "Dallas, TX",
  studio: "The Light Haus Studio",
  budget: "$900–$1,500",
  package: "The Signature Experience",
  quoteId: "Q-1001",
  contractId: "C-1001",
  invoiceId: "INV-1001",
  total: 1850,
  deposit: 750,
};

export const DEMO_ROWS = [
  { name: "Daniel Andersson", type: "Family Session", budget: "$800–$1,200", received: "Jun 22, 2026" },
  { name: "Jessica Lee", type: "Maternity Session", budget: "$700–$1,000", received: "Jun 22, 2026" },
  { name: "Ashley Morgan", type: "Newborn Session", budget: "$900–$1,500", received: "Jun 21, 2026" },
  { name: "Thomas & Rachel", type: "Wedding", budget: "—", received: "Jun 20, 2026" },
  { name: "James Family", type: "Family Session", budget: "—", received: "Jun 19, 2026" },
];

export function getSessionInfo(portal) {
  if (!portal || portal.useProjectDetails) {
    return { date: SARAH.date, time: SARAH.time, location: SARAH.location };
  }
  return {
    date: portal.customDate || SARAH.date,
    time: portal.customTime || SARAH.time,
    location: portal.customLocation || SARAH.location,
  };
}

export function makeInitialPortal() {
  return {
    useProjectDetails: true,
    customDate: "",
    customTime: "",
    customLocation: "",
    sessionVision: "Soft, timeless, elegant images that celebrate this beautiful chapter. Natural light, neutral tones, and meaningful details that tell your story.",
    sessionNotes: "We will focus on natural light and soft, organic moments. Please arrive 15 minutes early so we can start on time and make the most of golden hour.",
    propList: ["Flowing white/cream dress", "Nude bra", "Draped gauze", "Wooden stool", "Vase or bowl", "White backdrop"],
    visionImages: [],
  };
}
