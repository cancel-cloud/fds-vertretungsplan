import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppErrorBoundary } from "@/components/error-boundary";
import { ThemeProvider } from "@/providers/theme-provider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Vertretungsplan - Dessauer Schule Limburg",
  description: "Hier finden Sie alle aktuellen Vertretungen und Änderungen für Ihre Klasse.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <AppErrorBoundary>
          <ThemeProvider>
            {children}
            <Analytics />
            <SpeedInsights />
          </ThemeProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
