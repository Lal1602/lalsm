"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useThemeStore } from "@/stores";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const mobileLinksRef = useRef<HTMLUListElement>(null);
  const { theme, nextTheme } = useThemeStore();

  const toggleTheme = () => {
    nextTheme();
  };

  // Close mobile menu on navigation click
  useEffect(() => {
    const handleNavLink = () => setMenuOpen(false);
    
    // Bind click handlers to both desktop and mobile link nodes
    const links = document.querySelectorAll(".nav-link, .mobile-nav-link");
    links.forEach((l) => l.addEventListener("click", handleNavLink));
    return () => links.forEach((l) => l.removeEventListener("click", handleNavLink));
  }, [menuOpen]);

  // GSAP staggered animation when mobile menu opens
  useEffect(() => {
    if (!mobileLinksRef.current) return;
    const items = mobileLinksRef.current.querySelectorAll("li");

    if (menuOpen) {
      document.body.style.overflow = "hidden";
      gsap.killTweensOf(items);
      gsap.fromTo(
        items,
        { opacity: 0, y: 35, rotateX: -20 },
        { 
          opacity: 1, 
          y: 0, 
          rotateX: 0,
          duration: 0.45, 
          stagger: 0.07, 
          ease: "power2.out", 
          delay: 0.15 
        }
      );
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav className={`navbar${menuOpen ? " menu-active" : ""}`} aria-label="Main Navigation">
        <a href="#home" className="logo">
          BILAL<span style={{ color: "var(--accent-cyan)" }}>.</span>
        </a>

        {/* Desktop Navigation Links */}
        <ul className="nav-links">
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

        {/* Group Controls (Theme Toggle + Hamburger) */}
        <div className="navbar-actions">
          <button
            className={`theme-toggle-switch ${theme.type}`}
            onClick={toggleTheme}
            aria-label={`Switch to ${theme.type === "dark" ? "light" : "dark"} theme`}
          >
            {/* Moon Icon (Left) */}
            <span className="theme-icon moon-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </span>
            
            {/* Sun Icon (Right) */}
            <span className="theme-icon sun-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </span>

            {/* Slider knob */}
            <span className="theme-toggle-knob"></span>
          </button>

          {/* Premium Custom Hamburger Toggle (Mobile Only) */}
          <button
            className={`menu-toggle-btn${menuOpen ? " active" : ""}`}
            aria-label="Toggle Navigation Menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="hamburger-line line-1"></span>
            <span className="hamburger-line line-2"></span>
            <span className="hamburger-line line-3"></span>
          </button>
        </div>
      </nav>

      {/* Immersive Mobile Fullscreen High-Tech Drawer */}
      <div className={`nav-overlay-panel${menuOpen ? " active" : ""}`}>
        <div className="overlay-grid-bg"></div>
        <div className="overlay-glow glow-cyan"></div>
        <div className="overlay-glow glow-purple"></div>

        <ul className="mobile-nav-links-list" ref={mobileLinksRef}>
          <li>
            <a href="#home" className="mobile-nav-link">
              <span className="link-num">// 01</span> Home
            </a>
          </li>
          <li>
            <a href="#about" className="mobile-nav-link">
              <span className="link-num">// 02</span> About
            </a>
          </li>
          <li>
            <a href="#projects" className="mobile-nav-link">
              <span className="link-num">// 03</span> Projects
            </a>
          </li>
          <li>
            <a href="#achievements" className="mobile-nav-link mobile-btn-achievements">
              <span className="link-num">// 04</span> Achievements
            </a>
          </li>
          <li>
            <a href="#contact" className="mobile-nav-link">
              <span className="link-num">// 05</span> Contact
            </a>
          </li>
        </ul>

        {/* Mobile Menu Footer Sci-Fi HUD */}
        <div className="overlay-hud-footer">
          <span className="hud-code-label">SECURE_NAV_LINK // ONLINE</span>
          <span className="hud-pulse-dot"></span>
        </div>
      </div>
    </>
  );
}
