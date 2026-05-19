"use client";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="hero" id="home" aria-label="Hero Section">
      <div className="parallax-text" style={{ top: "20%", right: "10%" }} data-speed="0.2">
        FUTURE
      </div>

      <div className="container">
        <div className="hero-wrapper">
          {/* Image Side */}
          <div className="hero-image-container">
            <div className="image-blob">
              <Image src="/me7.jpeg" alt="Bilal Profile" width={350} height={350} priority />
            </div>
            <div className="stats-badge">
              {/* @ts-ignore */}
              <ion-icon suppressHydrationWarning
                name="checkmark-done-circle"
                style={{ color: "var(--accent-purple)", fontSize: "2.5rem" }}
                aria-hidden="true"
              ></ion-icon>
              <div>
                <strong style={{ fontSize: "1.4rem", display: "block", color: "white" }}>35+</strong>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Projects Done
                </span>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="hero-content">
            <h1 className="glitch-text" data-text="Creative Developer.">
              Creative Developer.
            </h1>
            <p className="hero-subtitle">
              Hello! I&apos;m Bilal, an Informatics Engineering student at EPIS (PENS) in Surabaya.
              Crafting immersive web experiences with modern technologies like Three.js and React.
            </p>
            <div className="btn-group">
              <a
                href="#projects"
                className="btn"
                style={{ background: "var(--accent-purple)", borderColor: "var(--accent-purple)" }}
              >
                See My Works
              </a>
              <a href="#contact" className="btn" style={{ marginLeft: "15px" }}>
                Contact Me
              </a>
            </div>
          </div>
        </div>
      </div>

      <a href="#about" className="scroll-indicator" aria-label="Scroll to About">
        {/* @ts-ignore */}
        <ion-icon suppressHydrationWarning name="chevron-down-outline" aria-hidden="true"></ion-icon>
      </a>
    </section>
  );
}
