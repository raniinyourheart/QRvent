"use client";

import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState("light");



  return (
    <html lang="id" className={theme === "dark" ? "dark" : ""}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
      >
        {children}
      </body>
    </html>
  );
}