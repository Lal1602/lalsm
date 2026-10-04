import type { Metadata, Viewport } from "next";
// Site styles, split by section. ORDER MATTERS: one flat cascade, later files
// override earlier ones. Namespace the class names of anything you add.
import "./styles/00-base.css";
import "./styles/10-navbar-hero.css";
import "./styles/11-hero.css";
import "./styles/20-marquee-footer.css";
import "./styles/30-about.css";
import "./styles/31-workbench.css";
import "./styles/40-process.css";
import "./styles/41-flightdeck.css";
import "./styles/50-gallery-and-modals.css";
import "./styles/60-contact.css";
import "./styles/70-preloader-and-spotlight.css";
import "./styles/80-achievements.css";
import "./styles/90-horizon.css";
import "./styles/95-seam-and-career.css";
import "./styles/A0-projects.css";
import "./styles/B0-responsive.css";
import "./styles/C0-nav-and-theme.css";
import "./styles/D0-paper-night.css";
import "./globals.css";
import Analytics from "@/components/ui/Analytics";
import { profile } from "@/data/profile";
import { LITE_BOOT_SCRIPT } from "@/lib/liteBoot";
import { HERO_BOOT_SCRIPT } from "@/lib/entrance";
import { SPLASH_BOOT_SCRIPT } from "@/lib/splash";
import PreloaderShell from "@/components/ui/PreloaderShell";
import { siteDescription, siteName, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: "%s | Bilal" },
  description: siteDescription,
  applicationName: "Bilal Portfolio",
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    "Bilal Sanayu Majid",
    "creative developer",
    "full stack developer",
    "Next.js",
    "Three.js",
    "GSAP",
    "WebGL",
    "portfolio",
    "Surabaya",
    "PENS",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: { index: true, follow: true },
  icons: { icon: "/b-logo.jpg" },
};

// Pinch-zoom stays enabled: locking the viewport scale fails WCAG 1.4.4.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#050505",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  url: siteUrl,
  image: `${siteUrl}/mee.jpeg`,
  jobTitle: profile.role,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Surabaya", addressCountry: "ID" },
  alumniOf: [
    { "@type": "CollegeOrUniversity", name: "Politeknik Elektronika Negeri Surabaya" },
    { "@type": "HighSchool", name: "SMKN 10 Surabaya" },
  ],
  knowsAbout: ["Next.js", "React", "Three.js", "GSAP", "WebGL", "TypeScript", "Node.js", "Laravel"],
  sameAs: [profile.github, profile.instagram],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/*
          The Horizon showcase pulls a ~757KB WebGL module (self-hosted in
          public/vendor, so it no longer depends on a third-party CDN). Left to
          its own import it finished downloading around the time the user was
          already scrolling toward the section, so the parse landed as a stall
          right on the transition. Fetching it up front moves that cost to the
          hero, where there is idle time to absorb it. (jsdelivr stays
          preconnected because ionicons still loads from there.)
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link
          rel="modulepreload"
          href="/vendor/tubes1.min.js"
          crossOrigin="anonymous"
        />
        {/*
          Font stack trimmed to what's actually used (was loading 6 families,
          3 of which — Syne, Plus Jakarta Sans, JetBrains Mono — appeared
          nowhere in the CSS). Orbitron (generic sci-fi display font) swapped
          for Space Grotesk to move away from the stock "cyberpunk template"
          look while keeping a distinct, technical display voice.
        */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout: the font loads for every route */}
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Space+Grotesk:wght@400;500;600;700&family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@300;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/b-logo.jpg" type="image/jpeg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var themeStr = localStorage.getItem('theme-storage');
                var theme = 'dark';
                if (themeStr) {
                  try {
                    theme = JSON.parse(themeStr).state.theme.type;
                  } catch(e) {}
                }
                document.documentElement.setAttribute('data-theme', theme);
              })();
            `,
          }}
        />
        {/* Lite mode flag (data-lite on <html>), set before first paint. */}
        <script dangerouslySetInnerHTML={{ __html: LITE_BOOT_SCRIPT }} />
        {/* Hero entrance flag (data-hero on <html>), set before first paint. See lib/entrance. */}
        <script dangerouslySetInnerHTML={{ __html: HERO_BOOT_SCRIPT }} />
        {/* Splash flag (data-splash on <html>: the scroll is locked, the page starts at the top). See lib/splash. */}
        <script dangerouslySetInnerHTML={{ __html: SPLASH_BOOT_SCRIPT }} />
        {/* Without scripts nothing would ever lift the splash: it is not shown at all. */}
        <noscript>
          <style>{".preloader{display:none!important}html[data-splash] body{overflow:auto!important}"}</style>
        </noscript>
        <script
          type="module"
          src="https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.esm.js"
          async
        ></script>
        <script
          noModule
          src="https://cdn.jsdelivr.net/npm/ionicons@7.1.0/dist/ionicons/ionicons.js"
          async
        ></script>
      </head>
      <body>
        <a className="skip-link" href="#content">
          Skip to main content
        </a>
        {/* The splash is part of the HTML, so it is in the first paint: nothing of the page shows before it. */}
        <PreloaderShell />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
        />
        <Analytics />
        <div id="main-content-wrapper">
          <div className="grain-overlay" aria-hidden="true"></div>
          {children}
        </div>
      </body>
    </html>
  );
}
