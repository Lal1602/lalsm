import Script from "next/script";

/**
 * Privacy-friendly analytics, opt-in through environment variables. With no
 * NEXT_PUBLIC_ANALYTICS_PROVIDER set this renders nothing, so nothing loads and
 * lib/analytics.ts `track()` calls are no-ops.
 *
 *   NEXT_PUBLIC_ANALYTICS_PROVIDER = plausible | umami | vercel
 *   plausible: NEXT_PUBLIC_PLAUSIBLE_DOMAIN (+ optional NEXT_PUBLIC_PLAUSIBLE_SRC)
 *   umami:     NEXT_PUBLIC_UMAMI_SRC and NEXT_PUBLIC_UMAMI_WEBSITE_ID
 *   vercel:    nothing else — enable Web Analytics in the Vercel dashboard
 */
export default function Analytics() {
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER;

  if (provider === "plausible") {
    const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    if (!domain) return null;
    return (
      <Script
        defer
        data-domain={domain}
        src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js"}
        strategy="afterInteractive"
      />
    );
  }

  if (provider === "umami") {
    const src = process.env.NEXT_PUBLIC_UMAMI_SRC;
    const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
    if (!src || !websiteId) return null;
    return <Script defer src={src} data-website-id={websiteId} strategy="afterInteractive" />;
  }

  if (provider === "vercel") {
    return (
      <>
        <Script id="vercel-analytics-queue" strategy="afterInteractive">
          {`window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };`}
        </Script>
        <Script defer src="/_vercel/insights/script.js" strategy="afterInteractive" />
      </>
    );
  }

  return null;
}
