"use client";
import React from "react";

interface TimelineItem {
  year: string;
  role: string;
  institution: string;
  desc: string;
  badge?: string;
}

const TIMELINE_DATA: TimelineItem[] = [
  {
    year: "2024 - Present",
    role: "Informatics Engineering Student",
    institution: "EPIS / PENS Surabaya",
    desc: "Focusing on software architecture, algorithms, dynamic web applications, and immersive 3D/WebGL experiences.",
    badge: "EPIS (PENS)"
  },
  {
    year: "2024",
    role: "Juara Harapan 2 — Web Tech",
    institution: "LKS Competition Surabaya",
    desc: "Won 2nd Runner-up Merit Prize at city level in Web Technologies, building modular frontends and scaling backend systems under time constraints.",
    badge: "Competition"
  },
  {
    year: "2024",
    role: "Certified Junior Programmer",
    institution: "BNSP Indonesia",
    desc: "National competency certificate validating expertise in programming, databases, and software design standards.",
    badge: "National Cert"
  },
  {
    year: "2023 - 2024",
    role: "Game & Android Graduate",
    institution: "Timedoor Academy",
    desc: "Completed advanced training courses in Javascript game development (Phaser 3) and mobile app development (Android Studio).",
    badge: "Academy Graduate"
  }
];

export default function CvTimelineSlide() {
  return (
    <div className="horizon-slide slide--cv">
      {/* Background Ambient Glow */}
      <div 
        className="slide-background-glow glow--cyan"
        style={{
          position: "absolute",
          top: "10%",
          left: "20%",
          width: "400px",
          height: "400px",
          background: "rgba(0, 243, 255, 0.05)",
          borderRadius: "50%",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1
        }}
      ></div>

      <div className="horizon-slide-content" style={{ zIndex: 2 }}>
        <p className="slide-badge">// EXPERIENCE & TIMELINE</p>
        <h2 className="slide-title" style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
          CAREER <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.7)" }}>PATHWAY</span>
        </h2>
        <p className="slide-description">
          A brief overview of my academic background at PENS, official certification records, and student competency achievements.
        </p>

        {/* Timeline Horizontal Layout */}
        <div 
          className="timeline-horizontal-wrapper"
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "40px",
            position: "relative",
            width: "100%",
            maxWidth: "1080px",
            overflow: "visible"
          }}
        >
          {/* Main Timeline Line */}
          <div 
            style={{
              position: "absolute",
              top: "24px",
              left: "0",
              right: "0",
              height: "2px",
              background: "linear-gradient(90deg, var(--accent-cyan) 0%, rgba(255, 255, 255, 0.05) 100%)",
              zIndex: 1
            }}
          ></div>

          {TIMELINE_DATA.map((item, idx) => (
            <div 
              key={idx} 
              style={{
                flex: "1 1 0px",
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start"
              }}
            >
              {/* Timeline Connector Dot */}
              <div 
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  backgroundColor: "var(--bg-color)",
                  border: idx === 0 ? "3px solid var(--accent-cyan)" : "2px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: idx === 0 ? "0 0 10px var(--accent-cyan)" : "none",
                  marginLeft: "12px",
                  marginBottom: "16px",
                  transition: "all 0.3s"
                }}
              ></div>

              {/* Year & Badge */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontFamily: "var(--font-code)",
                  fontSize: "0.75rem",
                  color: "var(--accent-cyan)",
                  marginBottom: "8px"
                }}
              >
                <span>{item.year}</span>
                {item.badge && (
                  <span 
                    style={{
                      fontSize: "0.6rem",
                      padding: "2px 6px",
                      border: "1px solid rgba(0, 243, 255, 0.25)",
                      borderRadius: "4px",
                      backgroundColor: "rgba(0, 243, 255, 0.05)",
                      textTransform: "uppercase"
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Title & Desc */}
              <h3 
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "white",
                  margin: "0 0 6px 0",
                  lineHeight: "1.2"
                }}
              >
                {item.role}
              </h3>
              <p 
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255, 255, 255, 0.4)",
                  fontFamily: "var(--font-body)",
                  margin: "0 0 12px 0",
                  letterSpacing: "0.05em",
                  fontWeight: 600
                }}
              >
                {item.institution}
              </p>
              <p 
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-main)",
                  lineHeight: "1.5",
                  margin: 0
                }}
              >
                {item.desc}
              </p>
            </div>
          ))}

          {/* Blueprint CV Download Card */}
          <div 
            className="glass-card"
            style={{
              flex: "0 0 220px",
              position: "relative",
              zIndex: 2,
              padding: "20px",
              border: "1px dashed rgba(255,255,255,0.15)",
              background: "rgba(255, 255, 255, 0.01)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "200px"
            }}
          >
            <div>
              <p style={{ fontFamily: "var(--font-code)", fontSize: "0.65rem", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                // FILE_DOCUMENT
              </p>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: "0.95rem", fontWeight: 700, color: "white", marginTop: "8px", marginBottom: "4px" }}>
                CURRICULUM VITAE
              </h4>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                Download professional resume summary (PDF format, ~180 KB).
              </p>
            </div>
            <a 
              href="https://drive.google.com/file/d/16mvFW569lf6yUzMRpEQUMY-NVJ4t41kZ/view?usp=sharing" 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn"
              style={{
                fontSize: "0.75rem",
                padding: "8px 12px",
                textAlign: "center",
                display: "block",
                background: "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.1)",
                color: "white"
              }}
            >
              Get Resume PDF
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
