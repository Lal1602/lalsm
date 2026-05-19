"use client";
import { useEffect } from "react";

export default function CardStackInteractions() {
  useEffect(() => {
    const stack = document.querySelector<HTMLElement>(".about-card-stack");
    if (!stack) return;

    const cards = Array.from(stack.querySelectorAll<HTMLElement>(".about-layer-card"));
    const dots = Array.from(stack.querySelectorAll<HTMLButtonElement>(".stack-dot"));
    const THROW_THRESHOLD = 80;
    const TILT_FACTOR = 0.06;
    let order = [0, 1, 2];
    let busy = false;

    function front() { return cards[order[0]]; }
    function mid() { return cards[order[1]]; }
    function back() { return cards[order[2]]; }

    function updateDots() {
      dots.forEach((dot) => {
        const active = parseInt(dot.dataset.index!) === order[0];
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", String(active));
      });
    }

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        if (busy) return;
        const target = parseInt(dot.dataset.index!);
        const steps = order.indexOf(target);
        if (steps === 0) return;
        let thrown = 0;
        function doThrow() {
          throwCard("left");
          thrown++;
          if (thrown < steps) setTimeout(doThrow, 460);
        }
        doThrow();
      });
    });

    function applyDrag(dx: number) {
      const tilt = dx * TILT_FACTOR;
      const prog = Math.min(Math.abs(dx) / THROW_THRESHOLD, 1);
      const ease = prog * prog;
      front().style.transform = `translateX(${dx}px) rotateY(${tilt}deg)`;
      mid().style.transform = `translateX(0px) translateY(${8 - ease * 8}px) translateZ(${-50 + ease * 50}px) rotateY(-2.5deg) scale(${0.97 + ease * 0.03})`;
      back().style.transform = `translateX(0px) translateY(${16 - ease * 8}px) translateZ(${-100 + ease * 50}px) rotateY(-5deg) scale(${0.94 + ease * 0.03})`;
    }

    function clearDragStyles() { cards.forEach((c) => (c.style.transform = "")); }

    function throwCard(direction: "left" | "right") {
      if (busy) return;
      busy = true;
      stack!.classList.add("interacted");
      const f = front();
      clearDragStyles();
      f.classList.remove("is-front");
      f.classList.add(direction === "right" ? "is-flying-right" : "is-flying-left");
      mid().classList.replace("is-mid", "is-front");
      back().classList.replace("is-back", "is-mid");
      setTimeout(() => {
        f.classList.remove("is-flying-left", "is-flying-right");
        f.classList.add("is-back");
        order = [order[1], order[2], order[0]];
        updateDots();
        busy = false;
      }, 450);
    }

    stack.addEventListener("pointerdown", (e: PointerEvent) => {
      if (busy || e.pointerType === "touch") return;
      const startX = e.clientX;
      let moved = false;

      function onMove(e: PointerEvent) {
        const dx = e.clientX - startX;
        if (Math.abs(dx) > 4) {
          if (!moved) { moved = true; front().classList.add("is-dragging"); }
          applyDrag(dx);
        }
      }
      function onUp(e: PointerEvent) {
        document.removeEventListener("pointermove", onMove as EventListener);
        document.removeEventListener("pointerup", onUp as EventListener);
        front().classList.remove("is-dragging");
        const dx = e.clientX - startX;
        if (Math.abs(dx) >= THROW_THRESHOLD) throwCard(dx > 0 ? "right" : "left");
        else clearDragStyles();
      }
      document.addEventListener("pointermove", onMove as EventListener);
      document.addEventListener("pointerup", onUp as EventListener);
    });

    let t0 = 0;
    stack.addEventListener("touchstart", (e: TouchEvent) => { t0 = e.touches[0].clientX; }, { passive: true });
    stack.addEventListener("touchend", (e: TouchEvent) => {
      if (busy) return;
      const dx = e.changedTouches[0].clientX - t0;
      if (Math.abs(dx) >= THROW_THRESHOLD) throwCard(dx > 0 ? "right" : "left");
    }, { passive: true });
  }, []);

  return null;
}
