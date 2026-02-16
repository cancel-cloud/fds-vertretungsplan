import type { Metadata } from 'next';
import './globals.css';
import { AppErrorBoundary } from '@/components/error-boundary';
import { ThemeProvider } from '@/providers/theme-provider';
import { PostHogProvider } from '@/providers/posthog-provider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Vertretungsplan - Dessauer Schule Limburg',
  description: 'Hier finden Sie alle aktuellen Vertretungen und Änderungen für Ihre Klasse.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FDS Vertretungsplan',
  },
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-foreground"
        >
          Zum Inhalt springen
        </a>
        <AppErrorBoundary>
          <ThemeProvider>
            <PostHogProvider>
              {children}
              <Analytics />
              <SpeedInsights />
            </PostHogProvider>
          </ThemeProvider>
        </AppErrorBoundary>
      </body>
    </html>
  );
}
