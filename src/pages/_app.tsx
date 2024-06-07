// src/pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { Analytics } from "@vercel/analytics/react";
import { useEffect } from "react";
import { useRouter } from "next/router";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

// Check that PostHog is client-side (used to handle Next.js SSR)
if (typeof window !== "undefined") {
  // @ts-ignore
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host:
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
    // Enable debug mode in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") posthog.debug();
    },
  });
}

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Track page views
    const handleRouteChange = () => posthog?.capture("$pageview");
    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);
  return (
    <>
      <PostHogProvider client={posthog}>
        <Component {...pageProps} />
        <Analytics mode={"production"} />
      </PostHogProvider>
    </>
  );
}

export default MyApp;
