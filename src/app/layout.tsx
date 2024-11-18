import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import {ThemeProvider} from "@/components/theme-provider";
import React from "react";
import HeadderComponent from "@/components/page/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FDS Vertretungsplan",
  description: "Ich bin einfach besser, benutzt mich doch einfach.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
        
      <body className={inter.className}>
      
      <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
          <HeadderComponent />
          {children}
          
          </ThemeProvider>
      </body>
    </html>
  );
}
