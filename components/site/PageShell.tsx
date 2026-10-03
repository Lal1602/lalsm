import Link from "next/link";
import "./page-shell.css";
import { profile } from "@/data/profile";

/**
 * Lightweight frame for the secondary routes (/blog, /projects/[slug], /cv).
 * The home page is a WebGL experience with its own navbar, cursor and smooth
 * scroll; these pages are for reading and sharing, so they stay plain: native
 * cursor, native scroll, no canvas. Colours come from the same CSS variables, so
 * the light/dark theme still applies.
 */

const NAV = [
  { href: "/", label: "Home" },
  { href: "/#projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/cv", label: "CV" },
];

export default function PageShell({
  children,
  width = "reading",
}: {
  children: React.ReactNode;
  width?: "reading" | "wide";
}) {
  return (
    <div className="ps-root">
      <header className="ps-header">
        <Link href="/" className="ps-logo" aria-label="Back to home">
          BILAL<span aria-hidden="true">.</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="ps-nav">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main id="content" tabIndex={-1} className={`ps-main ps-main--${width}`}>
        {children}
      </main>

      <footer className="ps-footer">
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          {" · "}
          <a href={profile.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
