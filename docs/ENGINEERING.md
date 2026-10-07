# Engineering notes

> The long-form technical companion to the [README](../README.md): how each section works, how it stays smooth, the house rules, and how to check it. Written for someone about to change the code.

A single-page portfolio that is also a piece of engineering: every section on the page is a working
instrument rather than a description, and the whole thing is held to a frame budget.

Built with Next.js 16 (App Router), React 19, TypeScript, Motion, GSAP + Lenis, and a handful of
hand-written WebGL renderers. Content, case studies, a blog, a CV in English and Indonesian (page and PDF) and a Gemini-backed
assistant sit behind the same data files.

---

## What is on the page

| Section | What it is |
| --- | --- |
| **Hero** | A type-specimen headline over the starfield, with a **lens** that follows the pointer and shows each letter's skeleton as a constellation; over the **O** the lens finds a wall clock whose hands are the real time in Surabaya (the readout says `WIB hh:mm:ss`). A dot-matrix portrait with rings round it, and a ledger of facts that are true (archive size, local time, coordinates). |
| **What I Build** | An **exploded view**: three plates, one for each discipline, tied by wires. Pick one and it rises while the plates above it open upward to uncover it; each tool of that discipline is a small drawing on it, and the legend beside it says what the tool is for and, where the public archive shows it, in how many of its projects it appears (a real count from `data/projects.ts`, the projects named). Pointing at a tool lights its drawing and the other way round; left alone it steps through the tools. The plates hold no text, and only the open plate moves by itself, and only on screen on a device that is not struggling. |
| **How I Work** | The **Flight Deck**: four stages on a route map. Scroll flies the ship, drag the map to scrub, hold a bay's button to engage it. Built on Motion with springs and an odometer; on a phone the bays become a swipe rail. |
| **Creative Playground** | A pinned horizontal run (GSAP ScrollTrigger on Lenis): an observation deck over a tube-cursor WebGL background, then the career pathway. |
| **Projects** | The **Observatory Plates**: one draw call renders the plate carousel from a texture atlas. Every project also has a static case-study page. |
| **Achievements / Contact** | Kinetic marquee; contact form (Web3Forms) and socials. |
| **CV** | `/cv` and `/cv/id` (English and Indonesian) and the PDFs `/cv.pdf` and `/cv-id.pdf`, all from `data/cv.ts`. It is easy to find: a CV pill in the nav bar (on phones too), a third button in the hero, a tab on the right edge that follows the visitor (it says once per visit, when the achievements come into view, "Seen the work? Take the CV with you."), a row in Contact, and the card on the career slide. Every one opens the same chooser of the two editions: each card carries a thumbnail drawn from that CV's real sections and entries, and the chosen one is stamped as it downloads. |
| **Ask Bilal** | **B.I.L.A.L.**, the assistant: a launcher (or Ctrl K) opens a panel that floats at the right edge and does not push the page. It knows which section the visitor is in, answers from Gemini when `GEMINI_API_KEY` is set and from offline rules otherwise (and says which, from `GET /api/ai/chat`), renders markdown with copy-able code, shows what it points at as cards (a project, a certificate, the CV chooser), understands slash commands (`/projects /skills /certificates /cv /contact /tour /theme /tone /export /clear /help`), has a scripted tour, a tone setting, Indonesian and English, speech in and out where the browser has it, Stop and Answer again, and exports or sends the conversation to Bilal. |

Light and dark themes, a **Lite mode** (below), and full keyboard and reduced-motion support.

### The two themes are two media

The dark theme is the night sky: light added to black. The light theme is the same sky as a **printed
star atlas**: ink on paper, from the hero to the footer (nothing stays black). There is no white in it:
the lightest surface is a warm paper at luminance 0.81 (the old theme's cards were 0.95), text is indigo
ink, and every accent used as text is a pigment that clears 4.5:1 on the paper. The tokens (`--p0..p3`,
`--ink`, `--teal`...) are one block in `C0-nav-and-theme.css`, and every light rule is written against
them (`D0-paper-night.css` holds the light skin of the sections that were drawn for the dark).

- **Nebula and stars in ink**: the shared seam renderer has a paper mode (`uPaper` in
  `lib/space/*.frag.ts`): the same field is read as pigment with density as opacity, stars become
  specks of ink. The Playground's tubes come from a library that clears to opaque black, so on paper
  its canvas is inverted and multiplied onto the page (neon in, ink out).
- **The paper follows the sun over Surabaya** (`lib/paperSun.ts`, `PaperSun.tsx`): noon is the
  stylesheet's paper; toward the horizon it warms, after dark it is dimmed a few percent and warmed
  further, like a sheet under a lamp. Never lighter than noon; `data-sun` on `<html>` is the elevation.
- **Switching theme** spreads the new theme from the toggle as a circle (View Transitions API; a plain
  switch where it is missing or the visitor asked for calm). While it happens `<html data-theme-switching>`
  turns every CSS transition off (the page's 0.4s colour fades on nearly every element are for hovers; during
  the switch they made thousands of elements re-style and repaint for a colour the picture already shows,
  which was a slideshow: 14 frames in the first 1.5 s, now about 145).

---

## How it stays smooth

- **Quality governor** (`lib/quality.ts`, `lib/qualityGovernor.ts`): one rAF sampler watches frame
  times and publishes a tier 0–3 as `<html data-q>`. Effects read it (nebula resolution, tube
  resolution, particle counts, idle frame rate) and get cheaper, never absent. Lite reads as tier 3.
- **Warm-up behind the splash** (`lib/warmup.ts`, `lib/warmupTasks.ts`): eight systems are prepared
  while the splash is up: the hero's portrait dots, fonts, the code of every lazily mounted part, the
  certificates, the shared WebGL context and shaders, a first draw of each of the four nebula seams,
  the tubes' first frame, and the plate atlas with its plates. Arriving at a section is an animation, not
  a stall. The heavy ones run one at a time with a frame between (the `gpu` lane), so the screen in front
  keeps painting; progress is weighted by cost.
- **The splash is in the first paint** (`components/ui/PreloaderShell.tsx`, `lib/splash.ts`): it is
  server-rendered markup, so it covers the page from the first pixel, before any script, and for every
  visitor (Lite and reduced motion included, with a shorter, calmer version). The controller
  (`Preloader.tsx`) only writes real numbers into it: the dial's 120 ticks, one arc per system, the
  odometer, the readout. It opens along the horizon in two halves (transforms only), and the hero's
  entrance starts as it opens. With scripts off it is not shown at all.
- **Nebula seams**: the glow that joins two sections is two canvases (one in each section) drawn by a
  single renderer (`lib/space/SpaceRenderer.ts`) from one shared world-space field, so the halves match.
  The cloud itself is redrawn only a dozen times a second (its drift needs no more); the pointer's push on it
  is applied in the cheap full-resolution pass instead (`lib/space/lens.ts`, `stars.frag.ts`), so while the
  pointer moves over a seam only that pass runs, at up to 60 frames a second, on the cloud as last drawn.
  Section boundaries are snapped to an 80 px grid (`lib/seamGrid.ts`, `useSeamSnap`) so they land on a
  whole device pixel at fractional zoom, which is what keeps the join invisible.
- **No scroll-jacking beyond the one pin**: the Playground is the only pinned section, and ScrollTrigger
  snapping is deliberately off because it fights Lenis.
- **Lite mode** (`lib/liteBoot.ts`): decided before first paint from reduced motion, Save-Data, a weak
  device, or the visitor's choice. Sets `<html data-lite>`; drops the WebGL starfield, tube cursor,
  seam animation and backdrop blur, uses native scrolling, and swaps the plates for a plain grid.

---

## Stack

| Layer | Technologies |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript 5 |
| Motion | Motion (`motion/react`, LazyMotion), GSAP + ScrollTrigger, Lenis |
| WebGL | Three.js (starfield, tube cursor build), custom raw-WebGL renderers for the nebula and plates |
| Styling | One flat cascade in `app/styles/*.css` (order matters), Tailwind v4 for resets |
| AI | `@google/genai`, NDJSON streaming, per-IP rate limit (optional Upstash Redis) |
| Content | MDX blog (`@next/mdx`), typed `data/*.ts`, `pdf-lib` for the generated CV |
| State | Zustand |
| Tests | Vitest (unit), Playwright (e2e and perf) |

---

## Project structure

```
app/
  page.tsx, layout.tsx          Home page and root layout (lite/theme boot script lives here)
  styles/                       The stylesheet, split by section. Numeric prefixes set the cascade order.
  api/ai/chat/                  Streaming assistant endpoint
  projects/, blog/, cv/         Case studies, MDX blog, the CV (/cv, /cv/id) and its PDFs (/cv.pdf, /cv-id.pdf)
components/
  ui/                           Sections and effects (AboutSection, ProcessSteps, HorizonShowcase, ...)
  ui/hiw/                       How I Work: FlightDeck, Station, Ship, StageBay, HiwSky
  ui/wb/                        What I Build: the three plates (Plates.tsx) and the drawing of every tool (features.tsx)
  motion/                       MotionRoot (shared LazyMotion), feature bundle
  site/                         Shell for the non-home pages
lib/
  space/, plates/               The two WebGL renderers (shaders, layout, atlas)
  flight/, build/               Pure logic behind How I Work and What I Build: the stack and archive counts, the isometric geometry (unit-tested)
  quality*.ts, warmup*.ts       Quality governor and the warm-up pipeline
  seamGrid.ts                   Section-boundary grid
  chat/, cv/, blog/             Assistant (pure logic: markdown, commands, cards, copy, context, tour, prompt), CV (the PDF builder) and blog plumbing
data/                           projects.ts, achievements.ts, profile.ts, cv.ts (the CV in EN and ID): the single source of truth
content/blog/                   MDX posts (each exports a `meta` object; the file name is the slug)
stores/                         Zustand stores
tests/unit, e2e, perf           Vitest, Playwright, frame-budget runs
```

---

## Getting started

Node 20.9+ and npm.

```bash
npm install
cp .env.example .env     # everything is optional; see the file
npm run dev              # http://localhost:3000
```

Without `GEMINI_API_KEY` the assistant answers from a built-in keyword simulation.

### Production build

```bash
npm run build
npm run start
```

Set `NEXT_PUBLIC_SITE_URL` to the real domain before building: it feeds canonical URLs, the sitemap,
robots.txt, Open Graph tags and JSON-LD.

---

## Checks

| Command | What it does |
| --- | --- |
| `npm run lint` | ESLint (Next, TypeScript, React Compiler rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest: chat validation, rate limiter, stream and action parsers, CV, Lite boot, quality governor, warm-up, seam grid, and the pure logic of the flight deck and of What I Build (its stack, the archive counts, the isometric geometry) |
| `npm run test:e2e` | Playwright against a production build (`npm run build` first; `PW_CHANNEL=chrome` reuses an installed Chrome). Covers the sections, seams at fractional pixel ratios, Lite, reduced motion, phones and keyboard |
| `npm run perf` | Scrolls the whole page on a CPU-throttled Chrome and prints frame times per section; `PERF_ASSERT=1` fails over budget. Headless Chrome may use a software GL stack, so compare runs on the same machine rather than reading absolute GPU numbers |
| `npm run check` | lint + typecheck + unit tests |

Run the e2e suite with `--workers=1` if you see timeouts: several tests are real-time and a loaded
machine makes parallel runs flaky.

---

## Working in the code

- **Content** lives in `data/`. Add a project once and it appears in the plates, the case-study pages,
  the sitemap and the assistant's knowledge. The CV is its own file, `data/cv.ts`, with every line in English
  and Indonesian; the page and both PDFs read it, and a unit test keeps the two languages in step.
- **Styles are one flat cascade.** Generic class names silently lose on source order, so namespace new
  sections (`hiw-`, `fd-`, `wb-`, `plate-`, `seam-`, `lite-`).
- **Per-frame values** (anything driven by scroll, pointer or a loop) are written to leaf elements through
  motion values or refs, never CSS transitions and never React state.
- **Hydration**: anything that reads a browser preference must use `useSyncExternalStore` with a server
  snapshot (see `useMediaQuery` in `components/ui/hiw/hooks.ts`). Motion's `useReducedMotion` does not
  and causes a mismatch for visitors who have reduced motion on.
- **Analytics** are off by default; set `NEXT_PUBLIC_ANALYTICS_PROVIDER` (plausible, umami or vercel).

---

## Author

**Bilal Sanayu Majid** · Informatics Engineering, PENS (Politeknik Elektronika Negeri Surabaya)
[GitHub @Lal1602](https://github.com/Lal1602)

## License

MIT. Explore, learn, and take what is useful.
