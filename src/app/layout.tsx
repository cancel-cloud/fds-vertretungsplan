import type {Metadata} from "next";
import {Inter} from "next/font/google";
import React from "react";
import Footer from "@/components/Footer";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "FDS Vertretungsplan",
    description: "Dieser Vertretungsplan, ist sortierbar, schöner anzusehen und einfacher zu verstehen.",
};

export default function RootLayout({
children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}
