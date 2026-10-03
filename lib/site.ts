/**
 * Canonical site URL for metadata, sitemap, robots and JSON-LD.
 *
 * Set NEXT_PUBLIC_SITE_URL in production (e.g. https://bilal.dev). On Vercel the
 * production domain is picked up automatically, and local dev falls back to
 * localhost so nothing in metadata ever points at a made-up domain.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const siteUrl = resolveSiteUrl();

export const siteName = "BILAL | Creative Developer";

export const siteDescription =
  "Bilal Sanayu Majid — Creative Developer & Full Stack Web Developer from Surabaya. Immersive WebGL experiences, GSAP motion and full-stack products built with Next.js.";

export function absoluteUrl(path = "/"): string {
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}
