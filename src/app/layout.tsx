import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { AppErrorBoundary } from "@/components/error-boundary";

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
          </ThemeProvider>
        </AppErrorBoundary>
        <Analytics />
      </body>
    </html>
  );
}
