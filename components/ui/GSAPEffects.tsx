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
  const orig = target.dataset.value;
  const interval = setInterval(() => {
    target.innerText = target.innerText
      .split("")
      .map((_, index) => {
        if (index < iterations) return orig![index];
        return LETTERS[Math.floor(Math.random() * 26)];
      })
      .join("");
    if (iterations >= orig!.length) clearInterval(interval);
    iterations += 1 / 3;
  }, 30);
}

export default function GSAPEffects() {
  useEffect(() => {
    // Scroll progress
    function updateProgress() {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const pct = (scrollTop / scrollHeight) * 100;
      const bar = document.querySelector<HTMLElement>(".scroll-progress-bar");
      if (bar) bar.style.width = pct + "%";
    }
    window.addEventListener("scroll", updateProgress);

    // Parallax
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

    // Section title glow
    gsap.utils.toArray<HTMLElement>(".section-title").forEach((title) => {
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

    if (!isMobileDevice) {
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
      // Mobile: show everything immediately — no scroll-trigger dependency
      gsap.set("[data-scroll]", { y: 0, opacity: 1, clearProps: "transform" });
    }

    // Recalculate all ScrollTrigger positions after CSS layout settles
    // This is critical after any layout-affecting CSS hot-reload or page load
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh(true);
    }, 350);

    // Marquee
    gsap.to(".marquee-wrapper", { xPercent: -50, repeat: -1, duration: 15, ease: "linear" });
    let marqueeProxy = { skew: 0 };
    const marqueeSkewSetter = gsap.quickSetter(".marquee-text", "skewX", "deg");
    const marqueeClamp = gsap.utils.clamp(-20, 20);
    ScrollTrigger.create({
      onUpdate: (self) => {
        let skew = marqueeClamp(self.getVelocity() / -300);
        if (Math.abs(skew) > Math.abs(marqueeProxy.skew)) {
          marqueeProxy.skew = skew;
          gsap.to(marqueeProxy, { skew: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => marqueeSkewSetter(marqueeProxy.skew) });
        }
      },
    });

    if (!isMobileDevice) {
      // Achievements reveal
      gsap.fromTo(".achievements-marquee-wrapper",
        { scale: 0.4, y: 200, rotationX: 45, opacity: 0, transformPerspective: 1000, transformOrigin: "center center" },
        { scale: 1, y: 0, rotationX: 0, opacity: 1, ease: "none", scrollTrigger: { trigger: ".ach-marquee-section", start: "top 90%", end: "top 40%", scrub: 1 } }
      );
    } else {
      // Direct instant display on mobile
      gsap.set(".achievements-marquee-wrapper", { scale: 1, y: 0, rotationX: 0, opacity: 1 });
    }

    // Horizon Showcase Horizontal Scroll Pinning & 3D Concave Track
    const horizonWrapper = document.querySelector<HTMLElement>(".horizon-wrapper");
    const isHorizonMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 968px)").matches;
    if (horizonWrapper && !isHorizonMobile) {
      const slides = Array.from(horizonWrapper.querySelectorAll<HTMLElement>(".horizon-slide"));
      const totalSlides = slides.length;
      const getSlideWidth = () => slides[0]?.offsetWidth || window.innerWidth;
      const totalScrollWidth = () => (totalSlides - 1) * getSlideWidth();

      // 3D Concave Track calculation:
      // Computes distance of each slide from viewport center and applies 3D rotation (rotateY)
      // and Z depth (translateZ) so slides glide along an inward-curving cylinder.
      const updateConcaveTrack = () => {
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
          // rotateY: 18deg max (was 35) + transformPerspective: 5000 (was 1500)
          // Near-edge enlargement: ~6% at max rotation vs ~58% before — virtually imperceptible
          const rotateY = -clampedNormDist * 18; // degrees
          const translateZ = 0; // px

          gsap.set(slide, {
            rotationY: rotateY,
            z: translateZ,
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
            // Pipe progress to shared state so CvTimelineSlide can subscribe
            horizonScrollState.progress = self.progress;
            if (horizonScrollState.onProgressUpdate) {
              horizonScrollState.onProgressUpdate(self.progress);
            }
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

    // Hacker text on scroll
    document.querySelectorAll<HTMLElement>("h2.section-title, h1.glitch-text").forEach((title) => {
      ScrollTrigger.create({
        trigger: title,
        start: "top 80%",
        onEnter: () => runHackerEffect(title),
      });
    });

    // Hacker text on hover
    document.querySelectorAll<HTMLElement>(".hacker-text, .nav-link").forEach((el) => {
      el.addEventListener("mouseover", () => runHackerEffect(el));
    });

    // Magnetic buttons
    document.querySelectorAll<HTMLElement>(".btn, .social-icon, .nav-link, .btn-quick-view").forEach((magnet) => {
      magnet.addEventListener("mousemove", (e) => {
        const bounding = magnet.getBoundingClientRect();
        const newX = (e.clientX - bounding.left) / magnet.offsetWidth - 0.5;
        const newY = (e.clientY - bounding.top) / magnet.offsetHeight - 0.5;
        gsap.to(magnet, { duration: 0.3, x: newX * 20, y: newY * 20, ease: "power2.out" });
      });
      magnet.addEventListener("mouseleave", () => {
        gsap.to(magnet, { duration: 1, x: 0, y: 0, ease: "elastic.out(1.2, 0.4)" });
      });
    });

    return () => {
      clearTimeout(refreshTimer);
      window.removeEventListener("scroll", updateProgress);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
