

import { Analytics } from '@vercel/analytics/react';
import {Metadata} from "next";


export const metadata: Metadata = {
    title: "FDS Vertretungsplan",
    description: "Dieser Vertretungsplan, ist sortierbar, schöner anzusehen und einfacher zu verstehen.",
};


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <head>
            <title>FDS Vertretungsplan</title>
        </head>
        <body>
        {children}
        <Analytics />
        </body>
        </html>
    );
}