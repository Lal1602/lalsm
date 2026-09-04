"use client";
import React from "react";
import { useThemeStore } from "@/stores";

interface InfinityNodeDiagramProps {
  activeIndex: number;
  hexColor: string;
}

export default function InfinityNodeDiagram({ activeIndex, hexColor }: InfinityNodeDiagramProps) {
  const themeType = useThemeStore((state) => state.theme.type);
  return (
    <div className="node-network-box" style={{ width: "100%", height: "160px", marginTop: "24px", position: "relative" }}>
      {/* Dynamic graphic rendering based on the active workflow phase */}
      {activeIndex === 0 && (
        <div className="workflow-lab-art fade-in-art">
          <svg className="network-svg" viewBox="0 0 400 150" style={{ overflow: "visible", width: "100%", height: "100%" }}>
            {/* Rotating Technical Coordinate Grid */}
            <g className="spin-slow" style={{ transformOrigin: "200px 75px" }}>
              <circle cx="200" cy="75" r="55" fill="none" stroke={themeType === "light" ? "rgba(0,122,204,0.2)" : "rgba(0, 243, 255, 0.12)"} strokeWidth="0.8" strokeDasharray="3 5" />
              <circle cx="200" cy="75" r="35" fill="none" stroke={themeType === "light" ? "rgba(0,122,204,0.3)" : "rgba(0, 243, 255, 0.22)"} strokeWidth="0.5" />
              <line x1="120" y1="75" x2="280" y2="75" stroke={themeType === "light" ? "rgba(0,122,204,0.2)" : "rgba(0, 243, 255, 0.12)"} strokeWidth="0.8" />
              <line x1="200" y1="10" x2="200" y2="140" stroke={themeType === "light" ? "rgba(0,122,204,0.2)" : "rgba(0, 243, 255, 0.12)"} strokeWidth="0.8" />
              
              <circle cx="200" cy="20" r="2.5" fill={themeType === "light" ? "#007acc" : "#00f3ff"} />
              <circle cx="200" cy="130" r="2.5" fill={themeType === "light" ? "#007acc" : "#00f3ff"} />
              <circle cx="145" cy="75" r="2.5" fill={themeType === "light" ? "#007acc" : "#00f3ff"} />
              <circle cx="255" cy="75" r="2.5" fill={themeType === "light" ? "#007acc" : "#00f3ff"} />
            </g>

            {/* Static high-end editorial boundary boxes */}
            <rect x="135" y="45" width="130" height="60" rx="5" fill={themeType === "light" ? "rgba(255,255,255,0.7)" : "rgba(8, 8, 14, 0.5)"} stroke={themeType === "light" ? "rgba(0,122,204,0.4)" : "rgba(0, 243, 255, 0.3)"} strokeWidth="1" />
            <text x="200" y="72" fill={themeType === "light" ? "#1a1a2e" : "#ffffff"} fontSize="9" fontFamily="var(--font-code)" fontWeight="700" letterSpacing="0.1em" textAnchor="middle">DISCOVERY // CORE</text>
            <text x="200" y="86" fill={themeType === "light" ? "rgba(0,122,204,0.8)" : "rgba(0, 243, 255, 0.6)"} fontSize="7" fontFamily="var(--font-code)" textAnchor="middle">[ SCOPE // DEFINED ]</text>
            
            {/* Architectural crosshairs */}
            <path d="M 120 30 L 120 20 L 130 20" fill="none" stroke={themeType === "light" ? "rgba(0,122,204,0.4)" : "rgba(0, 243, 255, 0.25)"} strokeWidth="1" />
            <path d="M 280 30 L 280 20 L 270 20" fill="none" stroke={themeType === "light" ? "rgba(0,122,204,0.4)" : "rgba(0, 243, 255, 0.25)"} strokeWidth="1" />
            <path d="M 120 120 L 120 130 L 130 130" fill="none" stroke={themeType === "light" ? "rgba(0,122,204,0.4)" : "rgba(0, 243, 255, 0.25)"} strokeWidth="1" />
            <path d="M 280 120 L 280 130 L 270 130" fill="none" stroke={themeType === "light" ? "rgba(0,122,204,0.4)" : "rgba(0, 243, 255, 0.25)"} strokeWidth="1" />
          </svg>
        </div>
      )}

      {activeIndex === 1 && (
        <div className="workflow-lab-art fade-in-art">
          <svg className="network-svg" viewBox="0 0 400 150" style={{ overflow: "visible", width: "100%", height: "100%" }}>
            {/* Elegant luxury gold background radial gradient */}
            <defs>
              <radialGradient id="designThemeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor={themeType === "light" ? "#d97706" : "#ffd700"} stopOpacity="0.16" />
                <stop offset="100%" stopColor={themeType === "light" ? "#d97706" : "#ffd700"} stopOpacity="0" />
              </radialGradient>
            </defs>
            <circle cx="200" cy="75" r="70" fill="url(#designThemeGlow)" />
            
            {/* Rotating Geometric Octahedron wireframe */}
            <g className="spin-slow" style={{ transformOrigin: "200px 75px" }}>
              {/* Upper pyramid */}
              <polygon points="200,25 165,75 200,75" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.35)"} strokeWidth="0.8" />
              <polygon points="200,25 235,75 200,75" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.35)"} strokeWidth="0.8" />
              {/* Lower pyramid */}
              <polygon points="200,125 165,75 200,75" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.35)"} strokeWidth="0.8" />
              <polygon points="200,125 235,75 200,75" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.35)"} strokeWidth="0.8" />
              {/* Outer frame */}
              <polygon points="200,25 165,75 200,125 235,75" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.8)" : "rgba(255, 215, 0, 0.7)"} strokeWidth="1.2" />
            </g>

            {/* Overlapping minimalist editorial guidelines */}
            <line x1="100" y1="75" x2="300" y2="75" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.25)" : "rgba(255, 215, 0, 0.15)"} strokeWidth="0.8" strokeDasharray="5 5" />
            <text x="200" y="142" fill={themeType === "light" ? "rgba(217, 119, 6, 0.9)" : "rgba(255, 215, 0, 0.8)"} fontSize="8.5" fontFamily="var(--font-code)" letterSpacing="0.08em" textAnchor="middle">GOLDEN // GEOMETRIC BALANCE</text>
            
            {/* Figma style layout bounds */}
            <path d="M 90 40 L 90 30 L 100 30" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.3)"} strokeWidth="1" />
            <path d="M 310 40 L 310 30 L 300 30" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.3)"} strokeWidth="1" />
            <path d="M 90 110 L 90 120 L 100 120" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.3)"} strokeWidth="1" />
            <path d="M 310 110 L 310 120 L 300 120" fill="none" stroke={themeType === "light" ? "rgba(217, 119, 6, 0.4)" : "rgba(255, 215, 0, 0.3)"} strokeWidth="1" />
          </svg>
        </div>
      )}

      {activeIndex === 2 && (
        <div className="workflow-lab-art fade-in-art">
          <svg className="network-svg" viewBox="0 0 400 150" style={{ overflow: "visible", width: "100%", height: "100%" }}>
            {/* Trigonometric vector precision lines */}
            <path d="M 50 75 Q 125 15, 200 75 T 350 75" fill="none" stroke={themeType === "light" ? "rgba(181, 137, 0, 0.3)" : "rgba(188, 19, 254, 0.22)"} strokeWidth="1.2" />
            <path d="M 50 75 Q 125 135, 200 75 T 350 75" fill="none" stroke={themeType === "light" ? "rgba(181, 137, 0, 0.3)" : "rgba(188, 19, 254, 0.22)"} strokeWidth="1.2" strokeDasharray="3 3" />
            
            {/* Active flowing mathematical wave curve */}
            <path 
              d="M 50 75 Q 125 35, 200 75 T 350 75" 
              fill="none" 
              stroke={themeType === "light" ? "#b58900" : "#bc13fe"} 
              strokeWidth="2" 
              className="wave-flow-line" 
            />
            
            {/* High-contrast plotted coordinates */}
            <circle cx="125" cy="45" r="3.5" fill={themeType === "light" ? "#1a1a2e" : "#ffffff"} stroke={themeType === "light" ? "#b58900" : "#bc13fe"} strokeWidth="1.2" />
            <circle cx="275" cy="105" r="3.5" fill={themeType === "light" ? "#1a1a2e" : "#ffffff"} stroke={themeType === "light" ? "#b58900" : "#bc13fe"} strokeWidth="1.2" />
            
            {/* Clean mathematical annotation typography */}
            <text x="50" y="25" fill={themeType === "light" ? "rgba(0,0,0,0.4)" : "rgba(255, 255, 255, 0.3)"} fontSize="7.5" fontFamily="var(--font-code)">F(x) = sin(x) * cos(2.4x)</text>
            <text x="350" y="25" fill={themeType === "light" ? "rgba(181, 137, 0, 0.9)" : "rgba(188, 19, 254, 0.9)"} fontSize="7.5" fontFamily="var(--font-code)" textAnchor="end">[ TYPE-SAFE ]</text>
            <text x="200" y="142" fill={themeType === "light" ? "#1a1a2e" : "#ffffff"} fontSize="8" fontFamily="var(--font-code)" letterSpacing="0.05em" textAnchor="middle">ENGINEERING 60FPS GRAPHICS</text>
          </svg>
        </div>
      )}

      {activeIndex === 3 && (
        <div className="workflow-lab-art fade-in-art">
          <svg className="network-svg" viewBox="0 0 400 150" style={{ overflow: "visible", width: "100%", height: "100%" }}>
            {/* Minimalist Data Server Node Racks */}
            <g transform="translate(45, 0)">
              {/* Server rack 1 */}
              <rect x="15" y="25" width="90" height="24" rx="4" fill={themeType === "light" ? "rgba(255,255,255,0.7)" : "rgba(8, 8, 14, 0.7)"} stroke={themeType === "light" ? "rgba(194, 65, 12, 0.4)" : "rgba(255, 80, 0, 0.3)"} strokeWidth="1" />
              <circle cx="32" cy="37" r="2.5" fill="#00ff88" className="blink-fast" />
              <text x="46" y="40" fill={themeType === "light" ? "rgba(0,0,0,0.65)" : "rgba(255, 255, 255, 0.65)"} fontSize="7.5" fontFamily="var(--font-code)">BUILD</text>
              
              {/* Server rack 2 */}
              <rect x="15" y="60" width="90" height="24" rx="4" fill={themeType === "light" ? "rgba(255,255,255,0.7)" : "rgba(8, 8, 14, 0.7)"} stroke={themeType === "light" ? "rgba(194, 65, 12, 0.4)" : "rgba(255, 80, 0, 0.3)"} strokeWidth="1" />
              <circle cx="32" cy="72" r="2.5" fill="#00ff88" className="blink-slow" />
              <text x="46" y="75" fill={themeType === "light" ? "rgba(0,0,0,0.65)" : "rgba(255, 255, 255, 0.65)"} fontSize="7.5" fontFamily="var(--font-code)">DEPLOY</text>
              
              {/* Server rack 3 */}
              <rect x="15" y="95" width="90" height="24" rx="4" fill={themeType === "light" ? "rgba(255,255,255,0.7)" : "rgba(8, 8, 14, 0.7)"} stroke={themeType === "light" ? "rgba(194, 65, 12, 0.4)" : "rgba(255, 80, 0, 0.3)"} strokeWidth="1" />
              <circle cx="32" cy="107" r="2.5" fill={themeType === "light" ? "#d97706" : "#ffd700"} />
              <text x="46" y="110" fill={themeType === "light" ? "rgba(0,0,0,0.65)" : "rgba(255, 255, 255, 0.65)"} fontSize="7.5" fontFamily="var(--font-code)">MONITOR</text>
            </g>

            {/* Seamless, elegant data pipeline connections */}
            <path d="M 150 37 C 190 37, 190 73, 240 73" fill="none" stroke={themeType === "light" ? "rgba(194, 65, 12, 0.35)" : "rgba(255, 80, 0, 0.25)"} strokeWidth="1" strokeDasharray="3 3" />
            <path d="M 150 72 Q 195 72, 240 72" fill="none" stroke={themeType === "light" ? "rgba(194, 65, 12, 0.6)" : "rgba(255, 80, 0, 0.5)"} strokeWidth="1.2" />
            <path d="M 150 107 C 190 107, 190 73, 240 73" fill="none" stroke={themeType === "light" ? "rgba(194, 65, 12, 0.35)" : "rgba(255, 80, 0, 0.25)"} strokeWidth="1" strokeDasharray="3 3" />

            {/* High-fidelity Main Server Console node */}
            <g transform="translate(240, 48)">
              <rect x="0" y="0" width="100" height="48" rx="5" fill={themeType === "light" ? "rgba(194, 65, 12, 0.08)" : "rgba(255, 80, 0, 0.06)"} stroke={themeType === "light" ? "#c2410c" : "#ff5000"} strokeWidth="1.2" />
              <text x="50" y="20" fill={themeType === "light" ? "#1a1a2e" : "#ffffff"} fontSize="8.5" fontWeight="700" fontFamily="var(--font-code)" textAnchor="middle">CLOUD_SERVER</text>
              <text x="50" y="34" fill="#00ff88" fontSize="7.5" fontFamily="var(--font-code)" textAnchor="middle">SHIPPED // LIVE</text>
            </g>
          </svg>
        </div>
      )}

      {/* Embedded High-Performance CSS animations for Awwwards level smoothness */}
      <style jsx>{`
        .spin-slow {
          animation: spinSlow 24s linear infinite;
        }
        
        .fade-in-art {
          animation: fadeInArt 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }

        .wave-flow-line {
          stroke-dasharray: 600;
          stroke-dashoffset: 600;
          animation: waveDraw 2.4s cubic-bezier(0.22, 1, 0.36, 1) forwards, waveFloat 4s ease-in-out infinite 2.4s;
        }

        .blink-fast {
          animation: blinkLight 1.2s infinite ease-in-out;
        }

        .blink-slow {
          animation: blinkLight 2.2s infinite ease-in-out 0.4s;
        }

        @keyframes spinSlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes fadeInArt {
          0% { opacity: 0; transform: scale(0.96); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes waveDraw {
          to { stroke-dashoffset: 0; }
        }

        @keyframes waveFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes blinkLight {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
