import gsap from "gsap";
import Image from "next/image";
import { useEffect, useState } from "react";

import { usePortalStore, useScrollStore, useThemeStore } from "@/stores";

export const ScrollHint = () => {
  const themeType = useThemeStore((state) => state.theme.type);
  const [hintText, setHintText] = useState('');
  const [showScrollHint, setShowScrollHint] = useState(false);
  const portal = usePortalStore((state) => state.activePortalId);
  const scrollProgress = useScrollStore((state) => state.scrollProgress);

  // Show 'Scroll' for Hero and work portals, 'Pan' for Projects portal.
  useEffect(() => {
    if (!portal) {
      if (scrollProgress === 0) {
        setHintText('SCROLL');
        setShowScrollHint(true);
      } else {
        setShowScrollHint(false);
      }
    } else {
      if (portal === 'work') {
        setHintText('SCROLL');
        setShowScrollHint(scrollProgress === 0);
      } else {
        setHintText('PAN');
        setShowScrollHint(true);
      }
    }
  }, [portal, scrollProgress]);

  useEffect(() => {
    if (showScrollHint) {
      gsap.to('.scroll-hint', {
        opacity: 1,
        duration: 1.5,
        delay: 1.5,
      });
    } else {
      gsap.killTweensOf('.scroll-hint');
      gsap.to('.scroll-hint', {
        opacity: 0,
        duration: 0.5,
      });
    }
  }, [showScrollHint]);

  const svgSrc = hintText === 'PAN' ? 'icons/chevrons-left-right.svg' : 'icons/chevrons-up-down.svg';

  return (
    <div className="fixed w-full bottom-5 scroll-hint" style={{ opacity: 0 }}>
      <div className="flex items-center justify-center animate-pulse">
        { showScrollHint }
        <Image src={svgSrc} width={18} height={18} alt="scroll hint" loading="lazy" style={{ filter: themeType === "light" ? "invert(1)" : "none", transition: "filter 0.3s" }} />
        <span style={{ color: "var(--text-main)", marginLeft: "6px", transition: "color 0.3s" }}>{hintText}</span>
      </div>
    </div>
  );
}