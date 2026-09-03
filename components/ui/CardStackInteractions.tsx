"use client";
import { useEffect } from "react";

/**
 * CardStackInteractions — Spatial Hologram Blueprint
 *
 * Replaces the old drag-stack mechanic with a pure CSS-class-toggle
 * 3D hover reveal system.
 *
 * Export name kept as `CardStackInteractions` so ClientShell.tsx
 * does NOT need to be changed.
 *
 * Responsibilities:
 * 1. mouseenter/mouseleave → toggle .is-active on hovered card,
 *    add .has-hover to wrapper (triggers CSS dimmed state on others)
 * 2. mousemove → update --spot-x, --spot-y CSS vars for cursor spotlight
 * 3. focus/blur → keyboard accessibility (same behaviour as hover)
 * 4. Mobile (≤968px) → classList.add('is-active') on all cards immediately,
 *    no 3D — everything visible flat
 */
export default function CardStackInteractions() {
  useEffect(() => {
    const wrapper = document.getElementById("about-cards-wrapper");
    if (!wrapper) return;

    const cards = Array.from(
      wrapper.querySelectorAll<HTMLElement>(".about-spatial-card")
    );
    if (cards.length === 0) return;

    const isMobile = window.matchMedia("(max-width: 968px)").matches;

    // ── Mobile: skip all 3D logic, show all cards flat ─────────────────────
    if (isMobile) {
      cards.forEach((card) => card.classList.add("is-active"));
      return;
    }

    // ── Activate a single card ──────────────────────────────────────────────
    function activateCard(target: HTMLElement) {
      wrapper!.classList.add("has-hover");
      cards.forEach((card) => {
        card.classList.toggle("is-active", card === target);
      });
    }

    // ── Deactivate all ──────────────────────────────────────────────────────
    function deactivateAll() {
      wrapper!.classList.remove("has-hover");
      cards.forEach((card) => card.classList.remove("is-active"));
    }

    // ── Track cursor spotlight position inside each card ────────────────────
    // Coalesced to one getBoundingClientRect() + style write per animation
    // frame — native mousemove can fire far more often than the display
    // repaints, and each call was forcing a synchronous layout read.
    function trackSpotlight(e: MouseEvent, card: HTMLElement) {
      const rect = card.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      card.style.setProperty("--spot-x", `${xPct}%`);
      card.style.setProperty("--spot-y", `${yPct}%`);
    }

    // ── Attach events + collect cleanups ───────────────────────────────────
    const cleanups: (() => void)[] = [];

    cards.forEach((card) => {
      let rafId = 0;
      const onEnter = () => activateCard(card);
      const onLeave = () => {
        deactivateAll();
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      };
      const onMove = (e: Event) => {
        const evt = e as MouseEvent;
        if (rafId) return;
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          trackSpotlight(evt, card);
        });
      };
      const onFocus = () => activateCard(card);
      const onBlur = () => deactivateAll();

      card.addEventListener("mouseenter", onEnter);
      card.addEventListener("mouseleave", onLeave);
      card.addEventListener("mousemove",  onMove);
      card.addEventListener("focus",      onFocus);
      card.addEventListener("blur",       onBlur);

      cleanups.push(() => {
        card.removeEventListener("mouseenter", onEnter);
        card.removeEventListener("mouseleave", onLeave);
        card.removeEventListener("mousemove",  onMove);
        card.removeEventListener("focus",      onFocus);
        card.removeEventListener("blur",       onBlur);
        if (rafId) cancelAnimationFrame(rafId);
      });
    });

    // ── Cleanup on unmount ─────────────────────────────────────────────────
    return () => cleanups.forEach((fn) => fn());
  }, []);

  return null;
}
