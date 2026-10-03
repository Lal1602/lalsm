/**
 * Thin, provider-agnostic event tracking. The provider script is injected by
 * components/ui/Analytics.tsx only when NEXT_PUBLIC_ANALYTICS_PROVIDER is set,
 * so without it every call here is a silent no-op (no cookies, no requests).
 */

type Props = Record<string, string | number | boolean>;

interface AnalyticsWindow extends Window {
  plausible?: (event: string, options?: { props?: Props }) => void;
  umami?: { track: (event: string, props?: Props) => void };
  va?: (command: string, payload?: Record<string, unknown>) => void;
}

export function track(event: string, props?: Props): void {
  if (typeof window === "undefined") return;
  const w = window as AnalyticsWindow;

  try {
    w.plausible?.(event, props ? { props } : undefined);
    w.umami?.track(event, props);
    w.va?.("event", { name: event, ...(props ? { data: props } : {}) });
  } catch {
    // Analytics must never break the page.
  }
}
