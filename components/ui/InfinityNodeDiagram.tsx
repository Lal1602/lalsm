"use client";
import React from "react";

interface InfinityNodeDiagramProps {
  activeIndex: number;
  hexColor: string;
}

export default function InfinityNodeDiagram({ activeIndex, hexColor }: InfinityNodeDiagramProps) {
  // Nodes left-to-right mapping matching the requested structure (cumulative active states)
  const nodesData = [
    { id: 0, cx: 40, cy: 75, label: "Core", steps: [0, 1, 2, 3] },
    { id: 1, cx: 110, cy: 35, label: "Strategy", steps: [0, 1, 2, 3] },
    { id: 2, cx: 110, cy: 115, label: "UI/UX", steps: [0, 1, 2, 3] },
    { id: 3, cx: 200, cy: 75, label: "Architecture", steps: [1, 2, 3] },
    { id: 4, cx: 290, cy: 35, label: "Codebase", steps: [2, 3] },
    { id: 5, cx: 290, cy: 115, label: "Testing", steps: [2, 3] },
    { id: 6, cx: 360, cy: 75, label: "Cloud", steps: [3] }
  ];

  const linksData = [
    { from: 0, to: 1 },
    { from: 0, to: 2 },
    { from: 1, to: 3 },
    { from: 2, to: 3 },
    { from: 3, to: 4 },
    { from: 3, to: 5 },
    { from: 4, to: 6 },
    { from: 5, to: 6 }
  ];

  return (
    <div className="node-network-box">
      <svg className="network-svg" viewBox="0 0 400 150" style={{ overflow: "visible", width: "100%", height: "100%" }}>
        <defs>
          <radialGradient id={`glowGrad-diagram-${activeIndex}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={hexColor} stopOpacity="1" />
            <stop offset="100%" stopColor={hexColor} stopOpacity="0" />
          </radialGradient>
          
          <filter id="diagramPulseGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Overlapping wavy infinity loop strands (sine waves) */}
        {linksData.map((link, idx) => {
          const startNode = nodesData[link.from];
          const endNode = nodesData[link.to];
          const isActive = startNode.steps.includes(activeIndex) && endNode.steps.includes(activeIndex);
          
          const x1 = startNode.cx;
          const y1 = startNode.cy;
          const x2 = endNode.cx;
          const y2 = endNode.cy;
          const dx = (x2 - x1) / 3;

          // Braided wave strand paths mimicking infinity loop weaves
          const pathA = `M ${x1} ${y1} C ${x1 + dx} ${y1 - 10}, ${x2 - dx} ${y2 + 10}, ${x2} ${y2}`;
          const pathB = `M ${x1} ${y1} C ${x1 + dx} ${y1 + 10}, ${x2 - dx} ${y2 - 10}, ${x2} ${y2}`;
          
          const strokeColor = isActive ? hexColor : "rgba(255, 255, 255, 0.07)";
          const strokeW = isActive ? 1.6 : 0.8;
          
          return (
            <g key={`link-${idx}`}>
              {/* Strand A */}
              <path
                className="network-link-strand"
                d={pathA}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeW}
                style={{
                  transition: "stroke 0.4s ease, stroke-width 0.4s ease"
                }}
              />
              {/* Strand B */}
              <path
                className="network-link-strand"
                d={pathB}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeW}
                style={{
                  transition: "stroke 0.4s ease, stroke-width 0.4s ease"
                }}
              />
            </g>
          );
        })}

        {/* Glowing halos around active nodes */}
        {nodesData.map((node) => {
          const isActive = node.steps.includes(activeIndex);
          if (!isActive) return null;

          return (
            <circle
              key={`halo-${node.id}`}
              cx={node.cx}
              cy={node.cy}
              r="14"
              fill={`url(#glowGrad-diagram-${activeIndex})`}
              opacity="0.45"
              style={{
                transformOrigin: `${node.cx}px ${node.cy}px`,
                animation: "pulseHalo 2.2s infinite ease-in-out"
              }}
            />
          );
        })}

        {/* Glowing active energy pulses traveling from Core to Cloud */}
        {linksData.map((link, idx) => {
          const startNode = nodesData[link.from];
          const endNode = nodesData[link.to];
          const isActive = startNode.steps.includes(activeIndex) && endNode.steps.includes(activeIndex);
          if (!isActive) return null;

          const x1 = startNode.cx;
          const y1 = startNode.cy;
          const x2 = endNode.cx;
          const y2 = endNode.cy;
          const dx = (x2 - x1) / 3;

          const pathA = `M ${x1} ${y1} C ${x1 + dx} ${y1 - 10}, ${x2 - dx} ${y2 + 10}, ${x2} ${y2}`;
          const pathB = `M ${x1} ${y1} C ${x1 + dx} ${y1 + 10}, ${x2 - dx} ${y2 - 10}, ${x2} ${y2}`;

          return (
            <g key={`signals-${idx}`}>
              {/* Pulse riding Strand A */}
              <circle
                className="network-signal"
                r="2.5"
                fill={hexColor}
                filter="url(#diagramPulseGlow)"
              >
                <animateMotion
                  path={pathA}
                  dur={`${1.3 + idx * 0.22}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Pulse riding Strand B */}
              <circle
                className="network-signal"
                r="2.5"
                fill={hexColor}
                filter="url(#diagramPulseGlow)"
              >
                <animateMotion
                  path={pathB}
                  dur={`${1.6 + idx * 0.28}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          );
        })}

        {/* Nodes (Circles + Labels) */}
        {nodesData.map((node) => {
          const isActive = node.steps.includes(activeIndex);
          return (
            <g key={`node-group-${node.id}`}>
              <circle
                className="network-node"
                cx={node.cx}
                cy={node.cy}
                r="6"
                stroke={isActive ? hexColor : "rgba(255, 255, 255, 0.16)"}
                fill={isActive ? hexColor : "#08080e"}
                style={{
                  transformOrigin: `${node.cx}px ${node.cy}px`,
                  filter: isActive ? "url(#diagramPulseGlow)" : "none",
                  transition: "stroke 0.4s ease, fill 0.4s ease"
                }}
              />
              <text
                x={node.cx}
                y={node.cy + 18}
                fill={isActive ? "#ffffff" : "rgba(255, 255, 255, 0.32)"}
                fontSize="8.5"
                fontWeight={isActive ? 700 : 300}
                fontFamily="var(--font-code)"
                textAnchor="middle"
                style={{
                  pointerEvents: "none",
                  letterSpacing: "0.05em",
                  transition: "fill 0.4s ease"
                }}
              >
                {node.label}
              </text>
            </g>
          );
        })}
      </svg>

      <style jsx global>{`
        @keyframes pulseHalo {
          0%, 100% { transform: scale(0.85); opacity: 0.3; }
          50% { transform: scale(1.22); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
