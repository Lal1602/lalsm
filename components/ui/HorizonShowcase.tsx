"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Creative3DScene from "./CreativeBlob";

const CvTimelineSlide = dynamic(() => import("./CvTimelineSlide"), { ssr: false });
const ProjectEstimatorSlide = dynamic(() => import("./ProjectEstimatorSlide"), { ssr: false });
const TechGraphSlide = dynamic(() => import("./TechGraphSlide"), { ssr: false });

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
      aria-label="Horizon Showcase Section"
    >
      {/* 3D Concave optical depth backdrop */}
      <div className="horizon-concave-backdrop" />

      <div className="horizon-wrapper">
        {/* Continuous moving grid backdrop (0.8 opacity) spanning all slides */}
        <div className="horizon-grid-backdrop" />
        
        {/* SLIDE 1: THE IMMERSIVE HOBERMAN SPHERE PLAYGROUND */}
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

        {/* SLIDE 2: INTERACTIVE CV / TIMELINE */}
        {mounted && <CvTimelineSlide />}

        {/* SLIDE 3: PROJECT CALCULATOR / ESTIMATOR */}
        {mounted && <ProjectEstimatorSlide />}

        {/* SLIDE 4: TECH CONNECTIVITY MAP */}
        {mounted && <TechGraphSlide />}

      </div>
    </section>
  );
}
