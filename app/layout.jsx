import "./globals.css";

export const metadata = {
  title: "EC Creative Studios OS",
  description: "Admin CRM and client portal prototype for EC Creative Studios.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "ECCS CRM",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport = {
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
