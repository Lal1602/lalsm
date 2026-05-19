"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function Preloader() {
  const counterRef = useRef<HTMLDivElement>(null);
  const preloaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const counter = counterRef.current;
    const preloader = preloaderRef.current;
    if (!counter || !preloader) return;

    document.body.style.overflow = "hidden";
    let currentValue = 0;

    function updateCounter() {
      const increment = Math.floor(Math.random() * 10) + 1;
      currentValue = Math.min(currentValue + increment, 100);
      if (counter) counter.textContent = currentValue + "%";

      if (currentValue < 100) {
        requestAnimationFrame(updateCounter);
      } else {
        setTimeout(() => {
          gsap.to(preloader, {
            yPercent: -100,
            duration: 1.5,
            ease: "power4.inOut",
            onComplete: () => {
              document.body.style.overflow = "";
              if (preloader) preloader.style.display = "none";
            },
          });
          gsap.fromTo(".hero h1, .hero p, .hero .btn-group",
            { y: 100, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 1.3,
              stagger: 0.2,
              delay: 0.5,
              ease: "power3.out",
            }
          );
        }, 500);
      }
    }
    requestAnimationFrame(updateCounter);
  }, []);

  return (
    <div className="preloader" ref={preloaderRef}>
      <div className="loader-content">
        <div className="counter" ref={counterRef}>0</div>
        <div className="loading-text">INITIALIZING SYSTEM...</div>
      </div>
    </div>
  );
}
