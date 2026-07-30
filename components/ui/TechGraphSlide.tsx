"use client";
import React, { useState } from "react";

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  type: "tech" | "project";
}

interface Connection {
  tech: string;
  project: string;
}

const NODES: Node[] = [
  // Tech Nodes (Left Side)
  { id: "nextjs", name: "Next.js 14", x: 60, y: 50, type: "tech" },
  { id: "laravel", name: "Laravel / PHP", x: 60, y: 110, type: "tech" },
  { id: "threejs", name: "Three.js (WebGL)", x: 60, y: 170, type: "tech" },
  { id: "phaser", name: "Phaser.js (Game)", x: 60, y: 230, type: "tech" },
  { id: "typescript", name: "TypeScript", x: 60, y: 290, type: "tech" },
  { id: "tailwind", name: "Tailwind CSS", x: 60, y: 350, type: "tech" },

  // Project Nodes (Right Side)
  { id: "herbal", name: "Herbal Mart", x: 440, y: 50, type: "project" },
  { id: "alien", name: "Hunting Alien", x: 440, y: 110, type: "project" },
  { id: "math", name: "Math Fighter", x: 440, y: 170, type: "project" },
  { id: "memory", name: "Memory Game", x: 440, y: 230, type: "project" },
  { id: "aether", name: "Aether Dreamscape", x: 440, y: 290, type: "project" },
  { id: "creative", name: "Creative Programmer", x: 440, y: 350, type: "project" }
];

const CONNECTIONS: Connection[] = [
  { tech: "nextjs", project: "herbal" },
  { tech: "nextjs", project: "creative" },
  { tech: "laravel", project: "herbal" }, // Laravel used in backend
  { tech: "threejs", project: "aether" },
  { tech: "threejs", project: "creative" },
  { tech: "phaser", project: "alien" },
  { tech: "phaser", project: "memory" },
  { tech: "typescript", project: "alien" },
  { tech: "typescript", project: "memory" },
  { tech: "typescript", project: "aether" },
  { tech: "typescript", project: "creative" },
  { tech: "tailwind", project: "herbal" },
  { tech: "tailwind", project: "creative" }
];

export default function TechGraphSlide() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Helper to check if a node or connection is highlighted
  const isHighlighted = (nodeId: string) => {
    if (!hoveredNode) return true; // default state: everything visible
    if (hoveredNode === nodeId) return true;

    // Check if node is connected to the hovered node
    const isTech = NODES.find(n => n.id === nodeId)?.type === "tech";
    const isHoveredTech = NODES.find(n => n.id === hoveredNode)?.type === "tech";

    if (isHoveredTech) {
      // Tech is hovered. Highlight projects connected to it
      return CONNECTIONS.some(c => c.tech === hoveredNode && c.project === nodeId);
    } else {
      // Project is hovered. Highlight tech connected to it
      return CONNECTIONS.some(c => c.project === hoveredNode && c.tech === nodeId);
    }
  };

  const isConnectionHighlighted = (conn: Connection) => {
    if (!hoveredNode) return false;
    return conn.tech === hoveredNode || conn.project === hoveredNode;
  };

  return (
    <div className="horizon-slide slide--tech-map">
      {/* Background Ambient Glow */}
      <div 
        className="slide-background-glow glow--cyan"
        style={{
          position: "absolute",
          bottom: "10%",
          left: "30%",
          width: "450px",
          height: "450px",
          background: "rgba(0, 243, 255, 0.04)",
          borderRadius: "50%",
          filter: "blur(130px)",
          pointerEvents: "none",
          zIndex: 1
        }}
      ></div>

      <div className="horizon-slide-content" style={{ zIndex: 2 }}>
        <p className="slide-badge">// TECH STACK MAPPING</p>
        <h2 className="slide-title" style={{ fontFamily: "var(--font-display)", fontWeight: 800 }}>
          STACK <span style={{ color: "transparent", WebkitTextStroke: "1px rgba(255,255,255,0.7)" }}>CONNECTIVITY</span>
        </h2>
        <p className="slide-description">
          Hover over any developer core technology or portfolio project node to trace dependencies and active integrations.
        </p>

        {/* Node Graph Sandbox */}
        <div 
          style={{
            marginTop: "30px",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "16px",
            background: "rgba(8, 8, 14, 0.4)",
            padding: "20px",
            maxWidth: "1080px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            boxShadow: "inset 0 0 30px rgba(0, 243, 255, 0.01)"
          }}
        >
          <svg 
            viewBox="0 0 500 400" 
            style={{ 
              width: "100%", 
              maxWidth: "700px", 
              overflow: "visible",
              fontFamily: "var(--font-code)",
              fontSize: "11px"
            }}
          >
            <defs>
              <linearGradient id="connGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--accent-cyan)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="var(--accent-purple)" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Connection Paths (rendered first so nodes sit on top) */}
            <g>
              {CONNECTIONS.map((conn, idx) => {
                const techNode = NODES.find(n => n.id === conn.tech)!;
                const projNode = NODES.find(n => n.id === conn.project)!;

                // Bezier curve calculations for clean organic link lines
                const cx1 = techNode.x + 120;
                const cy1 = techNode.y;
                const cx2 = projNode.x - 120;
                const cy2 = projNode.y;

                const pathData = `M ${techNode.x} ${techNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${projNode.x} ${projNode.y}`;
                const highlighted = isConnectionHighlighted(conn);

                return (
                  <path
                    key={idx}
                    d={pathData}
                    fill="none"
                    stroke={highlighted ? "url(#connGlow)" : "rgba(255, 255, 255, 0.05)"}
                    strokeWidth={highlighted ? 2 : 1.2}
                    style={{
                      transition: "stroke 0.3s, stroke-width 0.3s",
                      strokeDasharray: highlighted ? "4, 4" : "none",
                      animation: highlighted ? "dashRun 15s linear infinite" : "none"
                    }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g>
              {NODES.map(node => {
                const highlighted = isHighlighted(node.id);
                const isHovered = hoveredNode === node.id;
                const isTech = node.type === "tech";

                return (
                  <g 
                    key={node.id}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      cursor: "pointer",
                      opacity: highlighted ? 1 : 0.18,
                      transition: "opacity 0.3s, transform 0.3s",
                      transform: isHovered ? "scale(1.04)" : "scale(1)",
                      transformOrigin: `${node.x}px ${node.y}px`
                    }}
                  >
                    {/* Glowing background aura on hover */}
                    {isHovered && (
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={24}
                        fill={isTech ? "rgba(0, 243, 255, 0.15)" : "rgba(188, 19, 254, 0.15)"}
                        filter="blur(4px)"
                      />
                    )}

                    {/* Node Dot */}
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={6}
                      fill={isTech ? "var(--accent-cyan)" : "var(--accent-purple)"}
                      stroke="var(--bg-color)"
                      strokeWidth={2}
                      style={{
                        boxShadow: isTech ? "0 0 10px var(--accent-cyan)" : "0 0 10px var(--accent-purple)"
                      }}
                    />

                    {/* Label Box (Outer borders) */}
                    <rect
                      x={isTech ? node.x - 110 : node.x + 12}
                      y={node.y - 12}
                      width={98}
                      height={24}
                      rx={6}
                      fill="rgba(255, 255, 255, 0.02)"
                      stroke={isHovered ? (isTech ? "var(--accent-cyan)" : "var(--accent-purple)") : "rgba(255,255,255,0.06)"}
                      strokeWidth={1}
                      style={{ transition: "stroke 0.2s" }}
                    />

                    {/* Label Text */}
                    <text
                      x={isTech ? node.x - 61 : node.x + 61}
                      y={node.y + 4}
                      fill={isHovered ? "white" : "var(--text-muted)"}
                      textAnchor="middle"
                      style={{ 
                        fontSize: "9px", 
                        letterSpacing: "0.05em",
                        transition: "fill 0.2s",
                        pointerEvents: "none"
                      }}
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* SVG Key / Explainer */}
          <div 
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginLeft: "30px",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              paddingLeft: "24px",
              justifyContent: "center",
              fontFamily: "var(--font-code)",
              fontSize: "0.75rem",
              color: "var(--text-muted)"
            }}
          >
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-cyan)" }}></span>
              Next.js & Backend core
            </p>
            <p style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--accent-purple)" }}></span>
              WebGL & Gaming core
            </p>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.4)" }}>
              // Hover a node to visualize lines connecting stack items to production implementations.
            </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes dashRun {
          to {
            stroke-dashoffset: -20;
          }
        }
      `}</style>
    </div>
  );
}
