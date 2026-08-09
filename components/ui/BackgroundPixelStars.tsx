"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { useThemeStore } from "@/stores";

// 16-bit color palette — tinted towards cyan/violet to match portfolio theme
const STAR_COLORS = [
  "#FFFFFF", // White
  "#AAFFFF", // Light cyan  (matches --accent-cyan vibe)
  "#FFFFAA", // Light yellow
  "#AAAAFF", // Light blue-violet
  "#FFAAFF", // Light purple (matches --accent-violet vibe)
  "#AAFFAA", // Light green
  "#FFAAAA", // Light red
] as const;

const LIGHT_STAR_COLORS = [
  "#1a1a2e", // Dark navy/near-black
  "#2c3e50", // Dark slate
  "#34495e", // Wet asphalt
  "#444466", // Muted purple-grey
  "#005a99", // Dark cyan
] as const;

// ─── Configuration ───────────────────────────────────────────────
const STAR_DENSITY = 0.000045;     // slightly denser for 100vw × 100vh area
const TWINKLE_PROBABILITY = 0.7;
const MIN_TWINKLE_SPEED = 2;
const MAX_TWINKLE_SPEED = 4;
const PIXEL_SIZE = 5;
const STAR_REGEN_INTERVAL_MS = 5000;
const REGEN_PERCENT = 0.15;
const SHOOTING_STAR_PIXEL_SIZE = 2;
const TARGET_FPS = 16; // retro chunky feel

// ─── Types ────────────────────────────────────────────────────────
type BackgroundStar = {
  x: number;
  y: number;
  color: string;
  baseOpacity: number;
  currentOpacity: number;
  twinkle: boolean;
  twinkleSpeed: number;
  twinkleDirection: number; // -1 fading out, 1 fading in
  twinkleTimer: number;
};

type TrailPoint = { x: number; y: number; opacity: number };

type ShootingStar = {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
  trail: TrailPoint[];
};

// ─── Props ────────────────────────────────────────────────────────
interface BackgroundPixelStarsProps {
  /**
   * Width of the canvas in px. Defaults to the element's offsetWidth
   * (use "100%" via the container, component will measure it).
   */
  width?: number;
  /**
   * Height of the canvas in px. Defaults to the element's offsetHeight.
   */
  height?: number;
  /**
   * Extra inline styles merged onto the <canvas> element.
   * Position / sizing are handled internally; use this for z-index etc.
   */
  style?: React.CSSProperties;
}

/**
 * BackgroundPixelStars
 *
 * Canvas-based retro 16-bit pixel star field with twinkling & shooting stars.
 * Adapted from the retrostar briefing; Tailwind classes removed and replaced
 * with inline styles so it works inside the LALSM CSS-Variable design system.
 *
 * Usage in a relative-positioned container:
 *   <div style={{ position: "relative", width: "100%", height: "100%" }}>
 *     <BackgroundPixelStars />
 *   </div>
 *
 * The canvas will fill the container absolutely.
 */
export const BackgroundPixelStars = memo(
  ({ width, height, style }: BackgroundPixelStarsProps) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const regenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const theme = useThemeStore((state) => state.theme);

    const backgroundStarsRef = useRef<BackgroundStar[]>([]);
    const shootingStarsRef = useRef<ShootingStar[]>([]);
    const lastRenderTimeRef = useRef<number>(0);
    const frameInterval = 1000 / TARGET_FPS;

    // ── Helpers ───────────────────────────────────────────────────

    const getCanvasSize = useCallback((): { w: number; h: number } => {
      // The component lives inside .horizon-container (100vw × 100vh).
      // Use window dimensions directly — simple and always correct.
      if (width !== undefined && height !== undefined) return { w: width, h: height };
      return {
        w: window.innerWidth,
        h: window.innerHeight,
      };
    }, [width, height]);

    const getRandomStartPoint = useCallback((canvasW: number) => {
      const x = Math.random() * canvasW;
      const angle = 45 + Math.random() * 90; // 45-135°, 90° = straight down
      return { x, y: 0, angle };
    }, []);

    const createNewShootingStar = useCallback(
      (canvasW: number): ShootingStar => {
        const { x, y, angle } = getRandomStartPoint(canvasW);
        return {
          id: Date.now() + Math.random(),
          x, y, angle,
          scale: 1,
          speed: Math.random() * 5 + 8,
          distance: 0,
          trail: [],
        };
      },
      [getRandomStartPoint],
    );

    const initBackgroundStars = useCallback((): void => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      backgroundStarsRef.current = [];
      const area = canvas.width * canvas.height;
      const numStars = Math.floor(area * STAR_DENSITY);
      const currentThemeType = useThemeStore.getState().theme.type;
      const palette = currentThemeType === "light" ? LIGHT_STAR_COLORS : STAR_COLORS;
      for (let i = 0; i < numStars; i++) {
        const gridX = Math.floor(Math.random() * (canvas.width / PIXEL_SIZE)) * PIXEL_SIZE;
        const gridY = Math.floor(Math.random() * (canvas.height / PIXEL_SIZE)) * PIXEL_SIZE;
        const baseOpacity = currentThemeType === "light" ? (Math.random() * 0.4 + 0.2) : (Math.random() * 0.5 + 0.5);
        backgroundStarsRef.current.push({
          x: gridX,
          y: gridY,
          color: palette[Math.floor(Math.random() * palette.length)]!,
          baseOpacity,
          currentOpacity: baseOpacity,
          twinkle: Math.random() < TWINKLE_PROBABILITY,
          twinkleSpeed: MIN_TWINKLE_SPEED + Math.random() * (MAX_TWINKLE_SPEED - MIN_TWINKLE_SPEED),
          twinkleDirection: -1,
          twinkleTimer: 0,
        });
      }
    }, []);

    const regenerateBackgroundStars = useCallback((): void => {
      const canvas = canvasRef.current;
      if (!canvas || backgroundStarsRef.current.length === 0) return;
      const count = Math.max(1, Math.floor(backgroundStarsRef.current.length * REGEN_PERCENT));
      const currentThemeType = useThemeStore.getState().theme.type;
      const palette = currentThemeType === "light" ? LIGHT_STAR_COLORS : STAR_COLORS;
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * backgroundStarsRef.current.length);
        const gridX = Math.floor(Math.random() * (canvas.width / PIXEL_SIZE)) * PIXEL_SIZE;
        const gridY = Math.floor(Math.random() * (canvas.height / PIXEL_SIZE)) * PIXEL_SIZE;
        const baseOpacity = currentThemeType === "light" ? (Math.random() * 0.4 + 0.2) : (Math.random() * 0.5 + 0.5);
        backgroundStarsRef.current[idx] = {
          x: gridX,
          y: gridY,
          color: palette[Math.floor(Math.random() * palette.length)]!,
          baseOpacity,
          currentOpacity: baseOpacity,
          twinkle: Math.random() < TWINKLE_PROBABILITY,
          twinkleSpeed: MIN_TWINKLE_SPEED + Math.random() * (MAX_TWINKLE_SPEED - MIN_TWINKLE_SPEED),
          twinkleDirection: -1,
          twinkleTimer: 0,
        };
      }
    }, []);

    // ── Main render loop ──────────────────────────────────────────

    const animateCanvas = useCallback(
      (timestamp: number): void => {
        if (timestamp - lastRenderTimeRef.current < frameInterval) {
          animationFrameRef.current = requestAnimationFrame(animateCanvas);
          return;
        }
        lastRenderTimeRef.current = timestamp;

        const canvas = canvasRef.current;
        if (!canvas) { animationFrameRef.current = requestAnimationFrame(animateCanvas); return; }

        const ctx = canvas.getContext("2d");
        if (!ctx) { animationFrameRef.current = requestAnimationFrame(animateCanvas); return; }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw background stars
        backgroundStarsRef.current.forEach((star) => {
          ctx.fillStyle = star.color;
          ctx.globalAlpha = star.currentOpacity;
          ctx.fillRect(star.x, star.y, PIXEL_SIZE, PIXEL_SIZE);

          if (star.twinkle) {
            star.twinkleTimer += 1 / TARGET_FPS;
            if (star.twinkleTimer >= star.twinkleSpeed) {
              star.twinkleTimer = 0;
              star.twinkleDirection *= -1;
            }
            const progress = star.twinkleTimer / star.twinkleSpeed;
            star.currentOpacity =
              progress < 0.5
                ? star.twinkleDirection < 0 ? star.baseOpacity : star.baseOpacity * 0.3
                : star.twinkleDirection < 0 ? star.baseOpacity * 0.3 : star.baseOpacity;
          }
        });

        // Update + draw shooting stars
        if (shootingStarsRef.current.length) {
          shootingStarsRef.current = shootingStarsRef.current
            .map((star) => {
              const newX = star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
              const newY = star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
              const newDistance = star.distance + star.speed;
              const newTrail = [...star.trail];
              if (newDistance % 8 < star.speed) {
                newTrail.push({ x: star.x, y: star.y, opacity: 1.0 });
              }
              const updatedTrail = newTrail
                .map((p) => ({ ...p, opacity: p.opacity - 0.1 }))
                .filter((p) => p.opacity > 0);
              return { ...star, x: newX, y: newY, distance: newDistance, trail: updatedTrail };
            })
            .filter(
              (star) =>
                star.x >= -30 && star.x <= canvas.width + 30 &&
                star.y >= -30 && star.y <= canvas.height + 30,
            );

          const currentThemeType = useThemeStore.getState().theme.type;
          
          shootingStarsRef.current.forEach((star) => {
            // Draw trail
            star.trail.forEach((point) => {
              ctx.save();
              ctx.translate(point.x, point.y);
              ctx.rotate((star.angle * Math.PI) / 180);
              ctx.translate(-point.x, -point.y);
              ctx.fillStyle = currentThemeType === "light" ? `rgba(44, 62, 80, ${point.opacity})` : `rgba(180, 242, 255, ${point.opacity})`;
              ctx.fillRect(point.x, point.y, SHOOTING_STAR_PIXEL_SIZE, SHOOTING_STAR_PIXEL_SIZE);
              ctx.restore();
            });

            // Draw star head (4×2 pixel cross)
            ctx.save();
            ctx.translate(star.x, star.y);
            ctx.rotate((star.angle * Math.PI) / 180);
            ctx.translate(-star.x, -star.y);
            ctx.fillStyle = currentThemeType === "light" ? "#1a1a2e" : "#ffffff";
            ctx.globalAlpha = 1.0;
            for (let py = 0; py < 2; py++) {
              for (let px = 0; px < 4; px++) {
                if ((px === 0 && py === 1) || (px === 3 && py === 0)) continue;
                ctx.fillRect(
                  star.x + px * SHOOTING_STAR_PIXEL_SIZE,
                  star.y + py * SHOOTING_STAR_PIXEL_SIZE,
                  SHOOTING_STAR_PIXEL_SIZE,
                  SHOOTING_STAR_PIXEL_SIZE,
                );
              }
            }
            ctx.restore();
          });
        }

        // Reset globalAlpha so nothing bleeds out
        ctx.globalAlpha = 1;
        animationFrameRef.current = requestAnimationFrame(animateCanvas);
      },
      [frameInterval],
    );

    // ── Mount / resize ────────────────────────────────────────────

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      let shootingStarTimeoutId: ReturnType<typeof setTimeout>;
      let initRafId: number;

      // ── Shooting star scheduler (defined before use) ──
      const scheduleShootingStar = (): void => {
        const newStar = createNewShootingStar(canvas.width);
        shootingStarsRef.current = [...shootingStarsRef.current, newStar];
        shootingStarTimeoutId = setTimeout(scheduleShootingStar, Math.random() * 4000 + 2000);
      };

      // ── Resize handler ──
      const handleResize = (): void => {
        if (!canvas) return;
        const { w: rw, h: rh } = getCanvasSize();
        canvas.width = rw;
        canvas.height = rh;
        initBackgroundStars();
      };

      // Defer one frame so the browser resolves the parent's 200vw CSS layout
      // before we read containerRef.current.offsetWidth for canvas pixel dimensions.
      // Without this, offsetWidth may return 0 on first paint.
      initRafId = requestAnimationFrame(() => {
        const { w, h } = getCanvasSize();
        canvas.width = w;
        canvas.height = h;

        initBackgroundStars();
        animationFrameRef.current = requestAnimationFrame(animateCanvas);

        scheduleShootingStar();
        regenIntervalRef.current = setInterval(regenerateBackgroundStars, STAR_REGEN_INTERVAL_MS);
        window.addEventListener("resize", handleResize);
      });

      const unsub = useThemeStore.subscribe(() => {
        initBackgroundStars();
      });

      return () => {
        cancelAnimationFrame(initRafId);
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (regenIntervalRef.current) clearInterval(regenIntervalRef.current);
        clearTimeout(shootingStarTimeoutId);
        window.removeEventListener("resize", handleResize);
        unsub();
      };
    }, [animateCanvas, createNewShootingStar, getCanvasSize, initBackgroundStars, regenerateBackgroundStars]);

    return (
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          // ── Retro pixel dot grid overlay ──────────────────────────────────
          // NO solid background here — TubesCursor WebGL provides the dark bg.
          // Only the subtle dot grid remains as a retro LCD-screen texture.
          // Dots are very faint so they don't overwhelm the neon tubes below.
          backgroundImage: theme.type === 'light'
            ? "radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px)"
            : "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
          backgroundPosition: "0 0",
          // Transparent — tubes WebGL bg shows through the gaps between stars.
          backgroundColor: "transparent",
        }}
      >
        <canvas
          ref={canvasRef}
          style={{
            display: "block",
            // CSS width/height stretch the canvas display to fill the container.
            // The actual pixel resolution is set via canvas.width / canvas.height
            // in the useEffect, measured from containerRef.current.offsetWidth.
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            ...style,
          }}
        />
      </div>
    );
  },
  // Re-render when theme changes to update the grid background color
  (prevProps, nextProps) => {
    return prevProps.width === nextProps.width && prevProps.height === nextProps.height;
  }
);

BackgroundPixelStars.displayName = "BackgroundPixelStars";

export default BackgroundPixelStars;
