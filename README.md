# 🚀 Bilal | Creative Developer Portfolio

<div align="center">

  <p align="center">
    <strong>An immersive, highly interactive, and next-generation creative developer portfolio.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-16.2.6-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
    <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://threejs.org"><img src="https://img.shields.io/badge/Three.js-WebGL-000000?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" /></a>
    <a href="https://gsap.com"><img src="https://img.shields.io/badge/GSAP-3.15-88CE02?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" /></a>
    <a href="https://ai.google.dev"><img src="https://img.shields.io/badge/Gemini_AI-API_2.3-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" /></a>
  </p>

</div>

---

## 🌟 Overview

Welcome to the personal portfolio of **Ahmad Bilal**, an Informatics Engineering student at **Politeknik Elektronika Negeri Surabaya (PENS / EEPIS)** and a passionate **Creative Developer**.

This project bridges bleeding-edge 3D WebGL graphics, GSAP scroll-driven animations, high-precision UI engineering, and real-time AI capabilities into a cohesive, cyberpunk/sci-fi aesthetic portfolio.

---

## ✨ Key Features & Experience Highlights

### 1. 🌌 Hero & 3D Celestial Environment
- **Interactive Three.js Starfield Canvas**: Dynamic background rendering 6,000 luminous particles and 50 floating wireframe icosahedrons with smooth mouse reactivity.
- **Organic Morphing Shape (`image-blob`)**: Custom CSS clip-path/border-radius morphing avatar frame with cyan neon glow and interactive hover states.
- **Glitch Typography (`glitch-text`)**: Cyan and magenta chromatic aberration text animations.
- **Live Stats Floating Badge**: Glassmorphic floating card highlighting 35+ shipped projects with smooth floating animations.

### 2. 🧩 "What I Build" (About Section)
- **Spatial Bento Architecture**: Modular grid showcasing creative development philosophies, UI/UX craftsmanship, and full-stack technical competencies.
- **Interactive Retro Terminal**: Interactive console simulation showcasing developer command-line capabilities and logs.
- **Canvas Holographic Visualizer**: Dynamic visual flair reinforcing creative engineering depth.

### 3. ⚡ "How I Work" (Process Steps)
- **Multi-Stage Development Lifecycle**: 4-phase interactive process tracking from concept ideation through deployment.
- **Tone Ramp Progression**: Real-time stage tone color transition with visual packets and drift effects.

### 4. 🛰️ "The Horizon" (Horizontal Scroll Cinema)
- **Pinned Horizontal Experience**: Custom GSAP ScrollTrigger timeline integrated with smooth Lenis scroll.
- **Cosmic Pixel Stars Backdrop**: Bespoke HTML5 canvas rendering thousands of twinkling pixel stars.
- **Career Pathway & CV Timeline (`CvTimelineSlide`)**: Interactive career trajectory timeline with institution details, tags, and downloadable CV modal.
- **Dynamic Project Estimator (`ProjectEstimatorSlide`)**: Interactive budget, scope, and timeline calculator for prospective clients.
- **Interactive Tech Graph (`TechGraphSlide`)**: Interactive visualization of frontend, 3D, and backend tech stacks.

### 5. 💼 Projects & Detail Dossier
- **Fluid Swiper Showcase**: Responsive multi-card slider highlighting enterprise applications, Web3 prototypes, and interactive experiences.
- **Project Detail Modal (`ProjectModal`)**: In-depth project dossier modals with tech tags, project goals, preview galleries, and live links.

### 6. 🏆 Achievements & Marquee
- **Infinite Kinetic Marquees**: High-speed, seamless infinite text & card runners highlighting certifications, competition wins, and milestones.

### 7. 🤖 "Ask Bilal AI" (Gemini AI Assistant)
- **Integrated Generative Chatbot**: Built using `@google/genai` (Google Gemini API).
- **Personalized Context**: Knowledgeable about Bilal's skills, history, education at PENS Surabaya, and project achievements.
- **Sci-Fi HUD Interface**: Sleek drawer overlay with streaming responses, suggested questions, and sound feedback.

### 8. 🎨 Theme Engine & Accessibility
- **Dual Theme Support**: Seamless switching between **Cyber Dark** (deep space, cyan & neon violet) and **Slate/Lilac Light** mode via Zustand store (`useThemeStore`).
- **Custom Tube / Magnetic Cursor**: Smooth trailing cursor with magnetic button attraction and scale morphing.
- **Reduced Motion Support**: Automatic detection and graceful fallback for users with OS-level `prefers-reduced-motion` enabled.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [TypeScript 5](https://www.typescriptlang.org/) |
| **3D & WebGL** | [Three.js](https://threejs.org/), [@react-three/fiber](https://r3f.docs.pmnd.rs/), [@react-three/drei](https://github.com/pmndrs/drei), [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) |
| **Motion & Scrolling** | [GSAP 3](https://gsap.com/) (ScrollTrigger), [@gsap/react](https://gsap.com/resources/React/), [Lenis](https://lenis.studiofreight.com/) |
| **Styling & UI** | Vanilla CSS Design System, [Tailwind CSS v4](https://tailwindcss.com/), [Swiper 12](https://swiperjs.com/) |
| **AI Integration** | [@google/genai](https://ai.google.dev/) (Google Gemini 2.0 / Flash API) |
| **State Management** | [Zustand 5](https://zustand-demo.pmnd.rs/) |

---

## 📂 Project Structure

```bash
lalsm/
├── app/
│   ├── layout.tsx              # Root layout with fonts, metadata, and theme attributes
│   ├── page.tsx                # Main entry point assembling all sections
│   ├── portfolio.css           # Global design tokens, animations, and theme rules
│   └── globals.css             # Tailwind base imports
├── components/
│   ├── scene/                  # Three.js 3D canvas scenes and WebGL models
│   └── ui/                     # Modular interface components
│       ├── AboutSection.tsx    # "What I Build" bento showcase
│       ├── AchievementsSection.tsx # Infinite marquee of achievements
│       ├── AiChatOverlay.tsx   # Google Gemini AI assistant drawer
│       ├── BackgroundPixelStars.tsx # Canvas-driven starfield
│       ├── ClientShell.tsx     # Dynamic client-only component wrapper
│       ├── ContactSection.tsx  # Interactive contact form and socials
│       ├── CvTimelineSlide.tsx # Horizontal career pathway & CV timeline
│       ├── CustomCursor.tsx    # Magnetic custom cursor
│       ├── GSAPEffects.tsx     # Global GSAP ScrollTrigger coordinator
│       ├── HeroSection.tsx     # Hero jumbotron with morphing blob & glitch typography
│       ├── HorizonShowcase.tsx # Horizontal scroll cinematic container
│       ├── LenisSetup.tsx      # Smooth momentum scroll initializer
│       ├── Navbar.tsx          # Navigation header with theme switch & mobile drawer
│       ├── ProcessSteps.tsx    # "How I Work" 4-stage lifecycle timeline
│       ├── ProjectEstimatorSlide.tsx # Interactive client project cost calculator
│       ├── ProjectsSection.tsx # Swiper project showcase
│       ├── ProjectModal.tsx    # Detailed project popup modal
│       ├── TechGraphSlide.tsx  # Interactive technology stack radar
│       └── ThreeBackground.tsx # Three.js canvas starfield & floating polyhedra
├── stores/
│   └── index.ts                # Zustand store (theme, AI chat state, modals)
├── lib/                        # Helper utilities & scroll event buses
├── public/                     # Static media, icons, and profile assets
└── types/                      # TypeScript declarations
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `v18.18.0` or higher
- **Package Manager**: `npm`, `yarn`, or `pnpm`

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lal1602/lalsm.git
   cd lalsm
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add your Google Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(You can obtain a free API key at [Google AI Studio](https://aistudio.google.com/))*

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to explore the portfolio.

---

## 📦 Build for Production

To create an optimized production build:

```bash
npm run build
npm run start
```

---

## 👤 Author

**Ahmad Bilal**
- **Institution**: Informatics Engineering, PENS (Politeknik Elektronika Negeri Surabaya)
- **Role**: Creative Developer / Full-Stack Engineer
- **Website**: [bilal-portfolio.vercel.app](http://localhost:3000)
- **GitHub**: [@Lal1602](https://github.com/Lal1602)
- **LinkedIn**: [Ahmad Bilal](https://linkedin.com)

---

## 📄 License

This project is licensed under the MIT License — feel free to explore, learn, and draw inspiration from the code!
