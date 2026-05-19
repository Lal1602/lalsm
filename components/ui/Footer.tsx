"use client";
import { useEffect, useRef, useState } from "react";

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
        <a href="mailto:bilal.lalsm@gmail.com" className="mega-link">LET&apos;S BUILD</a>

        <div className="footer-bottom">
          <div className="footer-nav">
            <ul>
              <li><a href="#home" className="footer-link">Home</a></li>
              <li><a href="#projects" className="footer-link">Work</a></li>
              <li><a href="#about" className="footer-link">About</a></li>
            </ul>
          </div>

          <div className="time-display">
            {/* @ts-ignore */}
            <ion-icon suppressHydrationWarning name="time-outline"></ion-icon>
            <span id="surabayaTime">{time}</span>
          </div>

          <div className="footer-socials">
            <a href="https://github.com/Lal1602" className="social-icon" aria-label="GitHub">
              {/* @ts-ignore */}
              <ion-icon suppressHydrationWarning name="logo-github"></ion-icon>
            </a>
            <a href="https://discordapp.com/users/535780117792817152" className="social-icon" aria-label="Discord">
              {/* @ts-ignore */}
              <ion-icon suppressHydrationWarning name="logo-discord"></ion-icon>
            </a>
            <a href="https://www.instagram.com/chocolal_s/" className="social-icon" aria-label="Instagram">
              {/* @ts-ignore */}
              <ion-icon suppressHydrationWarning name="logo-instagram"></ion-icon>
            </a>
          </div>
        </div>

        <p style={{ marginTop: "30px", fontSize: "0.8rem", color: "var(--text-muted)", opacity: 0.6 }}>
          &copy; 2025 Bilal. Engineered from caffeine and headaches.
        </p>
      </div>
    </footer>
  );
}
