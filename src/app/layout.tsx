import type {Metadata} from "next";
import {Inter} from "next/font/google";
import React from "react";
import {PHProvider} from "@/app/providers";
import {Analytics} from "@vercel/analytics/react"
import dynamic from "next/dynamic";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "FDS Vertretungsplan",
    description: "Dieser Vertretungsplan, ist sortierbar, schöner anzusehen und einfacher zu verstehen.",
};

const PostHogPageView = dynamic(() => import('./PostHogPageView'), {
    ssr: false,
})

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <PHProvider>
                <body className={inter.className}>
                <PostHogPageView/>
                {children}
                </body>
            </PHProvider>
            <Analytics/>
        </html>
    );
}
