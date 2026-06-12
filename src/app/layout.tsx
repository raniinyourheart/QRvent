import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QRevnt - Digital Guest Book Platform",
  description: "Platform multievent digital guest book & smart check-in berbasis QR Code",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}