"use client";
import { useEffect, useState } from "react";
import Creative3DScene from "./CreativeBlob";

export default function HorizonShowcase() {
  // Client WebGL mounting states to prevent SSR mismatches
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section 
      className="horizon-container" 
      id="playground" 
      aria-label="Horizon Playground Section"
    >
      <div className="horizon-wrapper">
        
        {/* SINGLE PLAYGROUND SLIDE: THE IMMERSIVE HOBERMAN SPHERE */}
        <div className="horizon-slide slide--kinetic">
          <div className="slide-background-glow glow--violet"></div>
          {mounted && <Creative3DScene />}
          
          <div className="horizon-slide-content">
            <p className="slide-badge">// PLAYGROUND</p>
            <h2 className="kinetic-hero-title">
              CREATIVE<br />
              <span className="text-hollow">PLAYGROUND</span>
            </h2>
            <p className="slide-description">
              Tap and drag the volumetric Hoberman sphere to warp gravity, trigger core compression, and explore interactive kinetic aesthetics.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
