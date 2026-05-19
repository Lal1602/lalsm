"use client";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinksRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const handleNavLink = () => setMenuOpen(false);
    const links = document.querySelectorAll(".nav-link");
    links.forEach((l) => l.addEventListener("click", handleNavLink));
    return () => links.forEach((l) => l.removeEventListener("click", handleNavLink));
  }, []);

  return (
    <nav className="navbar" aria-label="Main Navigation">
      <a href="#home" className="logo">
        BILAL<span style={{ color: "var(--accent-cyan)" }}>.</span>
      </a>

      <div
        className="menu-toggle"
        aria-label="Toggle Menu"
        role="button"
        tabIndex={0}
        onClick={() => setMenuOpen((v) => !v)}
      >
        {/* @ts-ignore */}
        <ion-icon suppressHydrationWarning name={menuOpen ? "close-outline" : "menu-outline"} aria-hidden="true"></ion-icon>
      </div>

      <ul className={`nav-links${menuOpen ? " active" : ""}`} ref={navLinksRef}>
        <li><a href="#home" className="nav-link">Home</a></li>
        <li><a href="#about" className="nav-link">About</a></li>
        <li><a href="#projects" className="nav-link">Projects</a></li>
        <li>
          <a href="#achievements" className="nav-link btn-achievements">
            Achievements
          </a>
        </li>
        <li><a href="#contact" className="nav-link">Contact</a></li>
      </ul>
    </nav>
  );
}
