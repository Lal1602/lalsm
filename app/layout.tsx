import type { Metadata, Viewport } from "next";
import "./portfolio.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "BILAL | Creative Developer",
  description:
    "Bilal - Creative Developer & Full Stack Engineer Portfolio. Showcasing immersive web experiences and modern tech stacks.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#050505",
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
          Font stack trimmed to what's actually used (was loading 6 families,
          3 of which — Syne, Plus Jakarta Sans, JetBrains Mono — appeared
          nowhere in the CSS). Orbitron (generic sci-fi display font) swapped
          for Space Grotesk to move away from the stock "cyberpunk template"
          look while keeping a distinct, technical display voice.
        */}
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@300;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/b-logo.jpg" type="image/jpg" />
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
        <div id="main-content-wrapper">
          <div className="grain-overlay" aria-hidden="true"></div>
          {children}
        </div>
      </body>
    </html>
  );
}
