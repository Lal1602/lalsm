"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import horizonScrollState from "@/lib/horizonScrollState";

gsap.registerPlugin(ScrollTrigger);

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

function runHackerEffect(target: HTMLElement) {
  let iterations = 0;
  if (!target.dataset.value) target.dataset.value = target.innerText;
  const orig = target.dataset.value!;
  // Scramble off the stored string and write with textContent: reading
  // .innerText back each tick forced a layout 33 times a second.
  const interval = setInterval(() => {
    let out = "";
    for (let index = 0; index < orig.length; index++) {
      out += index < iterations ? orig[index] : LETTERS[Math.floor(Math.random() * 26)];
    }
    target.textContent = out;
    if (iterations >= orig.length) clearInterval(interval);
    iterations += 1 / 3;
  }, 30);
}

export default function GSAPEffects() {
  useEffect(() => {
    const preexisting = new Set(ScrollTrigger.getAll());

    // Respect the OS-level "reduce motion" setting: skip/soften every
    // non-essential animation below (parallax, scramble text, magnetic
    // buttons, 3D tilt, scroll-linked reveals) instead of forcing them on
    // everyone regardless of preference.
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scroll progress. The bar element and the page height are looked up once
    // instead of per scroll event — re-reading scrollHeight on every event
    // forced a layout each time — and writes are batched into a frame.
    const progressBar = document.querySelector<HTMLElement>(".scroll-progress-bar");
    let maxScroll = 0;
    let progressFrame = 0;

    function measurePageHeight() {
      maxScroll =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
    }

    function writeProgress() {
      progressFrame = 0;
      if (!progressBar || maxScroll <= 0) return;
      const scrollTop = window.scrollY;
      progressBar.style.width = (scrollTop / maxScroll) * 100 + "%";
    }

    function updateProgress() {
      if (!progressFrame) progressFrame = requestAnimationFrame(writeProgress);
    }

    const handleViewportChange = () => {
      measurePageHeight();
      ScrollTrigger.refresh();
    };

    measurePageHeight();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    if (typeof window !== "undefined" && window.visualViewport) {
      window.visualViewport.addEventListener("resize", handleViewportChange);
    }
    // Pinned sections change the document height, so re-measure when GSAP does
    ScrollTrigger.addEventListener("refresh", measurePageHeight);

    // Parallax — skipped entirely under reduced motion (purely decorative)
    if (!prefersReducedMotion) {
      gsap.to(".parallax-text", {
        yPercent: 30,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".image-blob", {
        yPercent: 15,
        ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
      gsap.to(".stats-badge", {
        y: -80, x: -20, rotate: -5, ease: "none",
        scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
      });
    }

    // Section title glow — under reduced motion, apply the end state once
    // instead of toggling it on every scroll in/out of view.
    gsap.utils.toArray<HTMLElement>(".section-title").forEach((title) => {
      if (prefersReducedMotion) {
        gsap.set(title, {
          textShadow: "0 0 20px var(--accent-cyan), 0 0 40px var(--accent-cyan)",
          color: "#fff",
        });
        return;
      }
      gsap.to(title, {
        textShadow: "0 0 20px var(--accent-cyan), 0 0 40px var(--accent-cyan)",
        color: "#fff",
        duration: 1,
        scrollTrigger: {
          trigger: title,
          start: "top 80%",
          end: "top 20%",
          toggleActions: "play reverse play reverse",
        },
      });
    });

    // Detect mobile via CSS media query — reliable cross-browser, no UA sniffing
    const isMobileDevice = typeof window !== "undefined" &&
      window.matchMedia("(max-width: 768px)").matches;
    // Mobile already shows content instantly instead of scroll-revealing it —
    // reduced motion gets the same instant treatment.
    const skipScrollReveals = isMobileDevice || prefersReducedMotion;

    if (!skipScrollReveals) {
      // Desktop: staggered fade-in driven by scroll position
      gsap.utils.toArray<HTMLElement>("[data-scroll]").forEach((elem) => {
        gsap.fromTo(elem,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: elem,
              start: "top 90%",   // wider threshold so elements near viewport edge don't get stuck
              toggleActions: "play none none none",  // never reverse — elements stay visible once seen
            }
          }
        );
      });
    } else {
      // Mobile / reduced motion: show everything immediately — no scroll-trigger dependency
      gsap.set("[data-scroll]", { y: 0, opacity: 1, clearProps: "transform" });
    }

    // Recalculate all ScrollTrigger positions after CSS layout settles
    // This is critical after any layout-affecting CSS hot-reload or page load
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 350);


    // Marquee — under reduced motion this stays static rather than looping
    // forever (continuous auto-scrolling text is exactly what that OS
    // setting asks sites to avoid).
    if (!prefersReducedMotion) {
      gsap.to(".marquee-wrapper", { xPercent: -50, repeat: -1, duration: 15, ease: "linear" });
      const marqueeProxy = { skew: 0 };
      const marqueeSkewSetter = gsap.quickSetter(".marquee-text", "skewX", "deg");
      const marqueeClamp = gsap.utils.clamp(-20, 20);
      ScrollTrigger.create({
        onUpdate: (self) => {
          const skew = marqueeClamp(self.getVelocity() / -300);
          if (Math.abs(skew) > Math.abs(marqueeProxy.skew)) {
            marqueeProxy.skew = skew;
            gsap.to(marqueeProxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => marqueeSkewSetter(marqueeProxy.skew) });
          }
        },
      });
    }

    if (!skipScrollReveals) {
      // Achievements reveal
      gsap.fromTo(".achievements-marquee-wrapper",
        { scale: 0.4, y: 200, rotationX: 45, opacity: 0, transformPerspective: 1000, transformOrigin: "center center" },
        { scale: 1, y: 0, rotationX: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".ach-marquee-section", start: "top 90%", end: "top 40%", scrub: 1 } }
      );
    } else {
      // Direct instant display on mobile
      gsap.set(".achievements-marquee-wrapper", { scale: 1, y: 0, rotationX: 0, opacity: 1 });
    }

    // Horizon Showcase — Desktop only: horizontal scroll pinning + 3D concave track
    // On mobile we skip ALL GSAP pinning; the slide is plain document flow with CSS swipe.
    const horizonWrapper = document.querySelector<HTMLElement>(".horizon-wrapper");
    const isHorizonMobile = window.matchMedia("(max-width: 968px)").matches;

    if (horizonWrapper && !isHorizonMobile) {
      const slides = Array.from(horizonWrapper.querySelectorAll<HTMLElement>(".horizon-slide"));
      const totalSlides = slides.length;
      const getSlideWidth = () => slides[0]?.offsetWidth || window.innerWidth;
      const totalScrollWidth = () => (totalSlides - 1) * getSlideWidth();

      // 3D Concave Track calculation:
      // Computes distance of each slide from viewport center and applies 3D rotation (rotateY)
      // and Z depth (translateZ) so slides glide along an inward-curving cylinder.
      const updateConcaveTrack = () => {
        // Reduced motion: keep the horizontal navigation (still needed to
        // reach the content) but skip the cosmetic 3D tilt/perspective wobble.
        if (prefersReducedMotion) return;
        const wrapperX = (gsap.getProperty(horizonWrapper, "x") as number) || 0;
        const viewportWidth = getSlideWidth();
        const viewportCenter = viewportWidth / 2;

        slides.forEach((slide, i) => {
          const slideLeft = wrapperX + i * viewportWidth;
          const slideCenter = slideLeft + viewportWidth / 2;
          const distanceFromCenter = slideCenter - viewportCenter;
          const normDist = distanceFromCenter / viewportWidth;

          // Clamp normalized distance between -1.5 and 1.5 to keep offscreen rotation clean
          const clampedNormDist = gsap.utils.clamp(-1.5, 1.5, normDist);

          // 3D concave cylinder illusion with minimal perspective foreshortening
          const rotateY = -clampedNormDist * 18; // degrees

          gsap.set(slide, {
            rotationY: rotateY,
            z: 0,
            transformPerspective: 5000,
            transformOrigin: "50% 50%",
            overwrite: "auto",
          });
        });
      };

      // Set initial 3D concave positions before scroll begins
      updateConcaveTrack();

      gsap.to(horizonWrapper, {
        x: () => -totalScrollWidth(),
        ease: "none",
        onUpdate: updateConcaveTrack,
        scrollTrigger: {
          trigger: ".horizon-container",
          pin: true,
          scrub: 0.8,
          start: "top top",
          end: () => `+=${totalScrollWidth()}`,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          preventOverlaps: true,
          onUpdate: (self) => {
            // Pipe progress to shared state; CvTimelineSlide, HorizonHud and
            // HorizonShowcase all subscribe to it.
            horizonScrollState.emit(self.progress);
          },
          snap: {
            snapTo: (value) => {
              const step = 1 / (totalSlides - 1);
              const currentX = Math.abs((gsap.getProperty(horizonWrapper, "x") as number) || 0);
              const totalW = totalScrollWidth();
              const visualProgress = totalW > 0 ? currentX / totalW : value;
              const targetIndex = Math.round(visualProgress / step);
              return targetIndex * step;
            },
            duration: { min: 0.2, max: 0.5 },
            ease: "power2.out",
            inertia: false,
            directional: false,
          },
          onRefresh: (self) => {
            horizonScrollState.start = self.start;
            horizonScrollState.end = self.end;
            updateConcaveTrack();
          },
        },
      });
    }



    // Footer auto-glow
    ScrollTrigger.create({ trigger: ".mega-link", start: "top 65%", toggleClass: "active" });

    // Hacker text on scroll — kept only on section titles (the one place it
    // reads as a deliberate reveal moment), and skipped under reduced motion.
    if (!prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>("h2.section-title, h1.glitch-text").forEach((title) => {
        ScrollTrigger.create({
          trigger: title,
          start: "top 80%",
          onEnter: () => runHackerEffect(title),
        });
      });
    }

    // Hacker text on hover — dropped from .nav-link (navigation should feel
    // instant and stable, not re-scramble on every hover) and scoped to
    // elements that explicitly opt in via .hacker-text.
    if (!prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>(".hacker-text").forEach((el) => {
        el.addEventListener("mouseover", () => runHackerEffect(el));
      });
    }

    // Magnetic buttons — skipped under reduced motion
    const magnetCleanups: Array<() => void> = [];
    if (!prefersReducedMotion) {
      document.querySelectorAll<HTMLElement>(".btn, .social-icon, .nav-link, .btn-quick-view").forEach((magnet) => {
        // quickTo reuses one tween per axis; the old code allocated a fresh
        // tween on every single mousemove event.
        const xTo = gsap.quickTo(magnet, "x", { duration: 0.3, ease: "power2.out" });
        const yTo = gsap.quickTo(magnet, "y", { duration: 0.3, ease: "power2.out" });

        const onMove = (e: MouseEvent) => {
          const bounding = magnet.getBoundingClientRect();
          const newX = (e.clientX - bounding.left) / magnet.offsetWidth - 0.5;
          const newY = (e.clientY - bounding.top) / magnet.offsetHeight - 0.5;
          xTo(newX * 20);
          yTo(newY * 20);
        };
        const onLeave = () => {
          gsap.to(magnet, { duration: 1, x: 0, y: 0, ease: "elastic.out(1.2, 0.4)" });
        };

        magnet.addEventListener("mousemove", onMove);
        magnet.addEventListener("mouseleave", onLeave);
        magnetCleanups.push(() => {
          magnet.removeEventListener("mousemove", onMove);
          magnet.removeEventListener("mouseleave", onLeave);
        });
      });
    }

    const owned = ScrollTrigger.getAll().filter((t) => !preexisting.has(t));

    return () => {
      clearTimeout(refreshTimer);
      if (progressFrame) cancelAnimationFrame(progressFrame);
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", handleViewportChange);
      if (typeof window !== "undefined" && window.visualViewport) {
        window.visualViewport.removeEventListener("resize", handleViewportChange);
      }
      ScrollTrigger.removeEventListener("refresh", measurePageHeight);
      magnetCleanups.forEach((fn) => fn());
      owned.forEach((t) => t.kill());
    };
  }, []);

  return null;
}
