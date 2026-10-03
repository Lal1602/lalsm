"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

export default function Footer() {
  const [time, setTime] = useState("00:00:00");

  useEffect(() => {
    function update() {
      const now = new Date();
      const str = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Jakarta",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }).format(now);
      setTime(str + " WIB");
    }
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="mega-footer">
      <div className="footer-grid-bg"></div>
      <div className="container footer-content">
        <a href={`mailto:${profile.email}`} className="mega-link">LET&apos;S BUILD</a>

        <div className="footer-bottom">
          <div className="footer-nav">
            <ul>
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#projects" className="footer-link">Work</a></li>
              <li><a href="#about" className="footer-link">About</a></li>
              <li><Link href="/blog" className="footer-link">Blog</Link></li>
              <li><Link href="/cv" className="footer-link">CV</Link></li>
            </ul>
          </div>

          <div className="time-display">
            <ion-icon suppressHydrationWarning name="time-outline"></ion-icon>
            <span id="surabayaTime">{time}</span>
          </div>

          <div className="footer-socials">
            <a href={profile.github} className="social-icon" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
              <ion-icon suppressHydrationWarning name="logo-github"></ion-icon>
            </a>
            <a href={profile.discord} className="social-icon" aria-label="Discord" target="_blank" rel="noopener noreferrer">
              <ion-icon suppressHydrationWarning name="logo-discord"></ion-icon>
            </a>
            <a href={profile.instagram} className="social-icon" aria-label="Instagram" target="_blank" rel="noopener noreferrer">
              <ion-icon suppressHydrationWarning name="logo-instagram"></ion-icon>
            </a>
          </div>
        </div>

        <p style={{ marginTop: "30px", fontSize: "0.8rem", color: "var(--text-muted)", opacity: 0.6 }}>
          &copy; {new Date().getFullYear()} Bilal. Engineered from caffeine and headaches.
        </p>
      </div>
    </footer>
  );
}
