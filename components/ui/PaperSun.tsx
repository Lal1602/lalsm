"use client";
import { useEffect } from "react";
import { profile } from "@/data/profile";
import { paperRamp, solarElevation, toHex, toTriple } from "@/lib/paperSun";

/** The sun moves a degree in four minutes; a colour that changes by a level or two needs no more than this. */
const EVERY_MS = 10 * 60 * 1000;

/**
 * Sets the four steps of the light theme's paper (--p0 .. --p3) from where the sun is over Surabaya
 * (lib/paperSun.ts), now and every ten minutes. They are written on <html>, so they win over the
 * stylesheet's noon values and the whole theme follows, because every light rule is written against
 * those tokens. Renders nothing. `data-sun` carries the elevation (whole degrees) for anyone who wants to read it.
 */
export default function PaperSun() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const elevation = solarElevation(new Date(), profile.coordinates.lat, profile.coordinates.lon);
      paperRamp(elevation).forEach((c, i) => {
        root.style.setProperty(`--p${i}`, toHex(c));
        root.style.setProperty(`--p${i}-rgb`, toTriple(c));
      });
      root.setAttribute("data-sun", String(Math.round(elevation)));
    };
    apply();
    const id = window.setInterval(apply, EVERY_MS);
    return () => {
      window.clearInterval(id);
      for (let i = 0; i < 4; i++) {
        root.style.removeProperty(`--p${i}`);
        root.style.removeProperty(`--p${i}-rgb`);
      }
      root.removeAttribute("data-sun");
    };
  }, []);
  return null;
}
