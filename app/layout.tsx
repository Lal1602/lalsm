import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BILAL | Creative Developer",
  description:
    "Bilal - Creative Developer & Full Stack Engineer Portfolio. Showcasing immersive web experiences and modern tech stacks.",
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
        <link
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;500;700&family=Roboto+Mono:wght@300;500&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/B-logo.jpg" type="image/jpg" />
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
      <body>{children}</body>
    </html>
  );
}
