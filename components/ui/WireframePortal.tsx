"use client";
import React from "react";

interface WireframePortalProps {
  active: boolean;
}

export default function WireframePortal({ active }: WireframePortalProps) {
  return (
    <div
      className={`wireframe-portal-window ${active ? "active" : ""}`}
      id="wireframe-portal-portal"
      style={{
        position: "absolute",
        bottom: "16px",
        left: "50%",
        transform: active ? "translateX(-50%) scale(1)" : "translateX(-50%) scale(0.75)",
        width: "92px",
        height: "92px",
        borderRadius: "16px",
        background: "rgba(8, 8, 14, 0.75)",
        backdropFilter: "blur(15px)",
        WebkitBackdropFilter: "blur(15px)",
        border: active ? "1px solid rgba(0, 243, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.05)",
        boxShadow: active ? "0 10px 30px rgba(0, 243, 255, 0.18)" : "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        zIndex: 5,
        opacity: active ? 1 : 0,
        transition: "opacity 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
      }}
    >
      {/* 3D Wireframe Polyhedron */}
      <svg width="64" height="64" viewBox="0 0 100 100" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="polyhedronPortalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f3ff" />
            <stop offset="100%" stopColor="#bc13fe" />
          </linearGradient>
        </defs>
        <g className="spin-slow" style={{ transformOrigin: "50px 50px" }}>
          {/* Main wireframe polygons */}
          <polygon points="50,15 25,40 50,55" fill="none" stroke="url(#polyhedronPortalGrad)" strokeWidth="0.8" />
          <polygon points="50,15 75,40 50,55" fill="none" stroke="url(#polyhedronPortalGrad)" strokeWidth="0.8" />
          <polygon points="50,85 25,60 50,45" fill="none" stroke="url(#polyhedronPortalGrad)" strokeWidth="0.8" />
          <polygon points="50,85 75,60 50,45" fill="none" stroke="url(#polyhedronPortalGrad)" strokeWidth="0.8" />
          <polygon points="25,40 25,60 50,55" fill="none" stroke="url(#polyhedronPortalGrad)" strokeWidth="0.8" />
          <polygon points="75,40 75,60 50,55" fill="none" stroke="url(#polyhedronPortalGrad)" strokeWidth="0.8" />
          
          <polygon points="50,15 25,40 75,40" fill="none" stroke="rgba(0, 243, 255, 0.35)" strokeWidth="0.5" />
          <polygon points="50,85 25,60 75,60" fill="none" stroke="rgba(188, 19, 254, 0.35)" strokeWidth="0.5" />
        </g>
      </svg>
      <style jsx>{`
        .spin-slow {
          animation: spinPortal 10s linear infinite;
        }
        @keyframes spinPortal {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
