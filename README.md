# 🚀 Bilal | Creative Developer Portfolio

An immersive, highly interactive, and visually striking personal portfolio built by Bilal. This project showcases advanced front-end development skills, merging 3D graphics, fluid animations, and AI-powered interactions to create a next-generation web experience.

## ✨ Key Features

- **Immersive 3D Experiences**: Built with `Three.js` and `React Three Fiber`, featuring atmospheric waves, holographic cards, and interactive 3D nodes.
- **Fluid Animations**: Complex scroll-driven and kinetic animations powered by `GSAP` and smooth scrolling with `Lenis`.
- **AI Chatbot Integration**: A built-in AI assistant powered by the `@google/genai` (Gemini API) that can answer questions about my background, projects, and skills.
- **Custom UI/UX**: Includes a dynamic custom tubes cursor, kinetic marquees, and a fully custom aesthetic (Dark/Light mode support).
- **Interactive Showcases**: Project sliders using `Swiper`, dynamic process dashboards, and an interactive CV timeline.
- **Modern Tech Stack**: Leveraging the latest Next.js 16 (App Router), React 19, and Tailwind CSS v4.

## 🛠️ Tech Stack

**Core**
- [Next.js (v16)](https://nextjs.org/) - React Framework
- [React (v19)](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Static Typing
- [Tailwind CSS (v4)](https://tailwindcss.com/) - Utility-first CSS

**3D & WebGL**
- [Three.js](https://threejs.org/) - 3D JavaScript Library
- [React Three Fiber](https://r3f.docs.pmnd.rs/) - React renderer for Three.js
- [React Three Drei](https://github.com/pmndrs/drei) - Useful helpers for R3F
- [React Three Postprocessing](https://github.com/pmndrs/react-postprocessing) - Post-processing effects

**Animations & UI**
- [GSAP (@gsap/react)](https://gsap.com/) - Professional-grade animations
- [Lenis](https://lenis.studiofreight.com/) - Smooth scrolling
- [Swiper](https://swiperjs.com/) - Modern touch sliders

**AI & State**
- [@google/genai](https://ai.google.dev/) - Gemini AI Integration
- [Zustand](https://zustand-demo.pmnd.rs/) - Bear necessities for state management

## 🚀 Getting Started

First, clone the repository and install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up your environment variables by creating a `.env` file in the root directory (especially for the Gemini API key):

```env
GEMINI_API_KEY=your_api_key_here
```

Then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📁 Project Structure

- `app/` - Next.js App Router (pages and layouts)
- `components/ui/` - React components (Hero, About, Projects, Custom Cursor, AI Chat, 3D Backgrounds, etc.)
- `components/scene/` - Three.js specific scenes and models
- `stores/` - Zustand state management stores
- `lib/` - Utility functions
- `public/` - Static assets

## 🤝 Let's Connect

Feel free to reach out if you want to collaborate or just say hi!
