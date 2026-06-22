import "./globals.css";

export const metadata = {
  title: "EC Creative Studios OS",
  description: "Admin CRM and client portal prototype for EC Creative Studios.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
