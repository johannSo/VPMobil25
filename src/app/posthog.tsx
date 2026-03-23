"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import type { ConfigDefaults } from "@posthog/types";

function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    if (!pathname) return;
    const search = searchParams?.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}

export function PostHogProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;
    const defaultsEnv = process.env.NEXT_PUBLIC_POSTHOG_DEFAULTS;
    const isConfigDefaults = (value: string | undefined): value is ConfigDefaults =>
      value === "2026-01-30" || value === "2025-11-30" || value === "2025-05-24" || value === "unset";
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://z.timetablex.space",
      capture_pageview: false,
      defaults: isConfigDefaults(defaultsEnv) ? defaultsEnv : "2026-01-30",
    });
  }, []);

  return (
    <PostHogProvider client={posthog}>
      {children}
      <PostHogPageview />
    </PostHogProvider>
  );
}
