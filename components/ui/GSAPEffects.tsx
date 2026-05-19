"use client";
import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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

    // Detect if device is a mobile or touch-enabled device
    const isMobileDevice = typeof window !== "undefined" && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      navigator.maxTouchPoints > 0
    );

    if (!isMobileDevice) {
      // Staggered fade-in
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
              start: "top 85%",
              toggleActions: "play none none reverse",
            }
          }
        );
      });
    } else {
      // Direct instant display on mobile to ensure 100% visibility
      gsap.set("[data-scroll]", { y: 0, opacity: 1 });
    }

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
      window.removeEventListener("scroll", updateProgress);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return null;
}
