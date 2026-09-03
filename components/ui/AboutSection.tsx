"use client";
import React, { useState, useRef, useEffect } from "react";

interface TechItem {
  icon: string;
  label: string;
  highlight?: boolean;
}

interface CardData {
  number: string;
  accent: "cyan" | "purple" | "green";
  icon: string;
  eyebrow: string;
  title: [string, string];
  desc: string;
  tech: TechItem[];
  hoverPrompt: string;
}

const CARDS: CardData[] = [
  {
    number: "01",
    accent: "cyan",
    icon: "code-slash-outline",
    eyebrow: "// DISCIPLINE_01",
    title: ["Frontend", "Engineering"],
    desc: "Architecting pixel-perfect, immersive web experiences with modern frameworks and WebGL interactions.",
    tech: [
      { icon: "logo-javascript",    label: "JavaScript"   },
      { icon: "logo-react",         label: "React.js"     },
      { icon: "triangle-outline",   label: "Next.js 14"   },
      { icon: "code-slash-outline", label: "TypeScript"   },
      { icon: "color-wand-outline", label: "Tailwind CSS" },
      { icon: "flash-outline",      label: "GSAP",        highlight: true },
      { icon: "cube-outline",       label: "Three.js",    highlight: true },
      { icon: "layers-outline",     label: "WebGL",       highlight: true },
    ],
    hoverPrompt: "INITIALIZE",
  },
  {
    number: "02",
    accent: "purple",
    icon: "server-outline",
    eyebrow: "// DISCIPLINE_02",
    title: ["Backend &", "DevOps"],
    desc: "Building robust server-side logic, scalable APIs, and managing cloud infrastructure end-to-end.",
    tech: [
      { icon: "logo-nodejs",      label: "Node.js"    },
      { icon: "logo-docker",      label: "Docker"     },
      { icon: "logo-firebase",    label: "Firebase"   },
      { icon: "server-outline",   label: "PHP 8+"     },
      { icon: "server-outline",   label: "Laravel"    },
      { icon: "database-outline", label: "MySQL"      },
      { icon: "database-outline", label: "PostgreSQL" },
      { icon: "logo-github",      label: "Git"        },
    ],
    hoverPrompt: "EXECUTE",
  },
  {
    number: "03",
    accent: "green",
    icon: "layers-outline",
    eyebrow: "// DISCIPLINE_03",
    title: ["Mobile &", "Game Dev"],
    desc: "Expanding digital horizons through cross-platform apps and interactive game mechanics.",
    tech: [
      { icon: "logo-react",              label: "React Native"   },
      { icon: "logo-android",            label: "Android Studio" },
      { icon: "logo-figma",              label: "Figma"          },
      { icon: "phone-portrait-outline",  label: "Flutter"        },
      { icon: "game-controller-outline", label: "Phaser.js", highlight: true },
      { icon: "brush-outline",           label: "Canvas API"     },
    ],
    hoverPrompt: "DEPLOY",
  },
];

export default function AboutSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      // 5px buffer to account for sub-pixel rounding
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    // Check initial scroll state when component mounts and on resize
    handleScroll();
    window.addEventListener('resize', handleScroll);
    return () => window.removeEventListener('resize', handleScroll);
  }, []);

  const scrollByAmount = (amount: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <section className="section about-spatial-section" id="about" aria-label="About Section">
      <div
        className="parallax-text"
        style={{ top: "50px", left: "-50px" }}
        data-speed="-0.1"
      >
        ABOUT
      </div>

      <div className="container about-container-inner">
        {/* ── Left heading ──────────────────────────────────────────────────── */}
        <div className="about-spatial-label">
          <p className="about-spatial-eyebrow">// ABOUT ME</p>
          <h2 className="section-title about-spatial-heading" data-scroll>
            What I <em>Build.</em>
          </h2>
          <div className="about-spatial-cue" aria-hidden="true">
            <span className="about-spatial-cue-arrow" />
            <span className="about-spatial-cue-text">hover to reveal</span>
          </div>
        </div>

        {/* ── Cards ─────────────────────────────────────────────────────────── */}
        <div className="about-cards-container">
          {/* Scroll Indicator Arrows */}
          <div 
            className={`scroll-indicator-arrow left ${canScrollLeft ? 'visible' : ''}`}
            onClick={() => scrollByAmount(-300)}
            aria-hidden="true"
          >
            <ion-icon suppressHydrationWarning name="chevron-back-outline"></ion-icon>
          </div>
          
          <div 
            className={`scroll-indicator-arrow right ${canScrollRight ? 'visible' : ''}`}
            onClick={() => scrollByAmount(300)}
            aria-hidden="true"
          >
            <ion-icon suppressHydrationWarning name="chevron-forward-outline"></ion-icon>
          </div>

          <div 
            className="about-cards-wrapper" 
            id="about-cards-wrapper"
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {CARDS.map((card) => (
          <article
            key={card.number}
            className={`about-spatial-card about-spatial-card--${card.accent}`}
            aria-label={`${card.title[0]} ${card.title[1]}`}
            tabIndex={0}
            id={`about-card-${card.number}`}
          >
            {/* Cursor spotlight overlay */}
            <div className="about-spatial-card-spotlight" aria-hidden="true" />

            {/* Ambient glow orb */}
            <div className="about-spatial-glow" aria-hidden="true" />

            {/* Watermark number */}
            <div className="about-spatial-watermark" aria-hidden="true">
              {card.number}
            </div>

            {/* Creative Hover Prompt (Visible when Idle) */}
            <div className="about-spatial-hover-prompt" aria-hidden="true">
              <div className="hover-prompt-icon">
                <ion-icon suppressHydrationWarning name="scan-outline"></ion-icon>
              </div>
              <div className="hover-prompt-main">HOVER ME</div>
              <div className="hover-prompt-sub">// TO REVEAL CONTENT //</div>
            </div>

            {/* Card content */}
            <div className="about-spatial-content">
              <div className="about-spatial-icon-wrap">
                <ion-icon
                  suppressHydrationWarning
                  name={card.icon}
                  aria-hidden="true"
                />
              </div>
              <p className="about-spatial-eyebrow-card">{card.eyebrow}</p>
              <h3 className="about-spatial-card-title">
                {card.title[0]}<em>{card.title[1]}</em>
              </h3>
              <p className="about-spatial-card-desc">{card.desc}</p>

              {/* Terminal tech box */}
              <div className="about-spatial-terminal">
                <p className="about-spatial-terminal-header">
                  <span className="about-spatial-terminal-dot" />
                  <span className="about-spatial-terminal-dot" />
                  <span className="about-spatial-terminal-dot" />
                  {" "}[ SYS.STACK ]
                </p>
                <div className="about-spatial-badges">
                  {card.tech.map(({ icon, label, highlight }) => (
                    <span
                      key={label}
                      className={`about-spatial-badge${highlight ? " highlight" : ""}`}
                    >
                      <ion-icon
                        suppressHydrationWarning
                        name={icon}
                        aria-hidden="true"
                      />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
          </div>
        </div>
      </div>
    </section>
  );
}
