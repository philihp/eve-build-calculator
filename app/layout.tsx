import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EVE Online Static Data ETL",
  description: "EVE Online Static Data ETL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
