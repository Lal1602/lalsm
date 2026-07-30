"use client";
import React, { useState, useEffect } from "react";

interface EstimatorFeature {
  id: string;
  name: string;
  weeks: number;
  costRating: number;
}

const FEATURES: EstimatorFeature[] = [
  { id: "auth", name: "User Auth & Security (JWT/OAuth)", weeks: 2, costRating: 1 },
  { id: "database", name: "Relational Database (SQL/Prisma)", weeks: 2, costRating: 1 },
  { id: "three", name: "WebGL/3D Graphics (Three.js/R3F)", weeks: 3, costRating: 2 },
  { id: "dashboard", name: "Admin Portal & Analytics Panel", weeks: 2, costRating: 1 },
  { id: "payments", name: "Payments Gateway (Stripe/Midtrans)", weeks: 3, costRating: 2 },
  { id: "websockets", name: "Real-time Messaging / WebSockets", weeks: 2, costRating: 2 }
];

export default function ProjectEstimatorSlide() {
  const [projectType, setProjectType] = useState("web-app");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [weeks, setWeeks] = useState(2);
  const [complexity, setComplexity] = useState("Low");
  const [costRating, setCostRating] = useState("$");

  const toggleFeature = (id: string) => {
    setSelectedFeatures(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Base estimation depending on project type
    let baseWeeks = 2;
    let baseCost = 1;

    switch (projectType) {
      case "web-app":
        baseWeeks = 3;
        baseCost = 2;
        break;
      case "mobile-app":
        baseWeeks = 4;
        baseCost = 2;
        break;
      case "3d-game":
        baseWeeks = 5;
        baseCost = 3;
        break;
      case "e-commerce":
        baseWeeks = 4;
        baseCost = 2;
        break;
    }

    // Add selected features overhead
    let extraWeeks = 0;
    let extraCost = 0;
    
    selectedFeatures.forEach(featId => {
      const feat = FEATURES.find(f => f.id === featId);
      if (feat) {
        extraWeeks += feat.weeks;
        extraCost += feat.costRating;
      }
    });

    const totalWeeks = baseWeeks + extraWeeks;
    const totalCostRating = baseCost + extraCost;

    setWeeks(totalWeeks);

    // Calculate complexity description
    if (totalWeeks <= 4) {
      setComplexity("Low");
    } else if (totalWeeks <= 8) {
      setComplexity("Moderate");
    } else {
      setComplexity("High / Enterprise");
    }

    // Cost rating display
    if (totalCostRating <= 2) {
      setCostRating("$ (Budget)");
    } else if (totalCostRating <= 5) {
      setCostRating("$$ (Standard)");
    } else {
      setCostRating("$$$ (Premium)");
    }
  }, [projectType, selectedFeatures]);

  const handleGenerateBrief = () => {
    const featureNames = selectedFeatures.map(id => {
      const f = FEATURES.find(feat => feat.id === id);
      return f ? f.name : "";
    }).filter(Boolean);

    const typeLabel = 
      projectType === "web-app" ? "Modern Web Application" :
      projectType === "mobile-app" ? "Mobile Application" :
      projectType === "3d-game" ? "Immersive 3D/Canvas Web Game" : "E-Commerce Platform";

    const brief = 
`Hi Bilal,

I am interested in collaborating on a project!
- Project Type: ${typeLabel}
- Selected Features:
${featureNames.map(name => `  * ${name}`).join("\n") || "  * Base Setup only"}
- Target Complexity: ${complexity}
- Estimated Timeline: ~${weeks} weeks

Let's connect and discuss the roadmap!`;

    const textarea = document.getElementById("contact-message") as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = brief;
      // Scroll smoothly to contact section
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div className="horizon-slide slide--estimator">
      {/* Background Ambient Glow */}
      <div 
        className="slide-background-glow glow--purple"
        style={{
          position: "absolute",
          top: "15%",
          right: "20%",
          width: "400px",
          height: "400px",
          background: "rgba(188, 19, 254, 0.05)",
          borderRadius: "50%",
          filter: "blur(120px)",
          pointerEvents: "none",
          zIndex: 1
        }}
      ></div>

      <div className="horizon-slide-content" style={{ zIndex: 2 }}>
        <p className="slide-badge">// ROADMAP & SCOPE ESTIMATOR</p>
        <h2 className="slide-title" style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
          PROJECT <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.7)" }}>PLANNER</span>
        </h2>
        <p className="slide-description">
          Choose a baseline project model and toggle specialized systems to estimate timeline scope in real-time.
        </p>

        <div 
          style={{
            display: "flex",
            gap: "40px",
            marginTop: "30px",
            alignItems: "stretch",
            maxWidth: "1080px",
            width: "100%"
          }}
        >
          {/* Left Panel: Options Form */}
          <div 
            style={{
              flex: "1.2 1 0px",
              display: "flex",
              flexDirection: "column",
              gap: "20px"
            }}
          >
            {/* Dropdown Input */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label 
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase"
                }}
              >
                // Baseline Project Type
              </label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "white",
                  fontSize: "0.9rem",
                  fontFamily: "var(--font-body)",
                  outline: "none",
                  cursor: "pointer"
                }}
              >
                <option value="web-app" style={{ backgroundColor: "#0c0c14" }}>Modern Web Application</option>
                <option value="mobile-app" style={{ backgroundColor: "#0c0c14" }}>Mobile Cross-Platform App</option>
                <option value="3d-game" style={{ backgroundColor: "#0c0c14" }}>3D Interactive Web / Game</option>
                <option value="e-commerce" style={{ backgroundColor: "#0c0c14" }}>E-Commerce Platform</option>
              </select>
            </div>

            {/* Checklist of Features */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label 
                style={{
                  fontFamily: "var(--font-code)",
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                  marginBottom: "4px"
                }}
              >
                // Integrated System Modules
              </label>
              <div 
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px"
                }}
              >
                {FEATURES.map(feat => {
                  const isChecked = selectedFeatures.includes(feat.id);
                  return (
                    <button
                      key={feat.id}
                      onClick={() => toggleFeature(feat.id)}
                      style={{
                        textAlign: "left",
                        background: isChecked ? "rgba(188, 19, 254, 0.08)" : "rgba(255,255,255,0.02)",
                        border: isChecked ? "1px solid rgba(188, 19, 254, 0.4)" : "1px solid rgba(255,255,255,0.06)",
                        borderRadius: "8px",
                        padding: "12px",
                        color: isChecked ? "white" : "var(--text-muted)",
                        fontSize: "0.85rem",
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div 
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "3px",
                            border: isChecked ? "none" : "1px solid rgba(255, 255, 255, 0.3)",
                            backgroundColor: isChecked ? "var(--accent-purple)" : "transparent",
                            boxShadow: isChecked ? "0 0 8px var(--accent-purple)" : "none",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "8px"
                          }}
                        >
                          {isChecked && "✓"}
                        </div>
                        {feat.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Holographic HUD Display */}
          <div 
            className="glass-card"
            style={{
              flex: "0.8 1 0px",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              background: "rgba(12, 12, 20, 0.4)",
              borderRadius: "16px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              boxShadow: "inset 0 0 20px rgba(255,255,255,0.02)"
            }}
          >
            <div>
              <p style={{ fontFamily: "var(--font-code)", fontSize: "0.7rem", color: "var(--accent-purple)", margin: 0 }}>
                // SYS.PLANNER_CALCULATION
              </p>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", fontWeight: 700, color: "white", marginTop: "12px", marginBottom: "20px" }}>
                SCOPE SUMMARY
              </h3>

              {/* Data Items */}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>ESTIMATED DURATION</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "white", fontFamily: "var(--font-code)" }}>
                    ~{weeks} Weeks
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>COMPLEXITY SCALE</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--accent-purple)" }}>
                    {complexity}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "8px" }}>
                  <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>ESTIMATED SCALE RATING</span>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "white", fontFamily: "var(--font-code)" }}>
                    {costRating}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerateBrief}
              className="btn"
              style={{
                background: "var(--accent-purple)",
                borderColor: "var(--accent-purple)",
                color: "white",
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "0.9rem",
                padding: "12px",
                width: "100%",
                textAlign: "center",
                cursor: "pointer",
                marginTop: "20px",
                boxShadow: "0 4px 15px rgba(188, 19, 254, 0.2)"
              }}
            >
              Generate Project Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
