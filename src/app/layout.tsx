import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import { PostHogProvider } from "./providers";

export const metadata: Metadata = {
  title: "FDS Vertretungsplan",
  description:
    "Dieser Vertretungsplan, ist sortierbar, schöner anzusehen und einfacher zu verstehen.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content="FDS Vertretungsplan" />
        <meta
          property="og:description"
          content="Dieser Vertretungsplan, ist sortierbar, schöner anzusehen und einfacher zu verstehen."
        />
        <meta property="og:image" content="../publi" />
        <meta property="og:url" content="https://yourwebsite.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FDS Vertretungsplan" />
        <meta
          name="twitter:description"
          content="Dieser Vertretungsplan, ist sortierbar, schöner anzusehen und einfacher zu verstehen."
        />
        <meta name="twitter:image" content="/path/to/your/image.jpg" />
        <title>FDS Vertretungsplan</title>
      </head>
      <body>
        <PostHogProvider>
          {children}
          <Analytics />
        </PostHogProvider>
      </body>
    </html>
  );
}
