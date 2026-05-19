# 🌌 Phase 2 Briefing: 3D Interactive Website (Frontend)

## 🎯 Purpose

To take the existing reference 3D portfolio and upgrade it to connect dynamically with our new Backend API, integrating data-driven components and seamless AI interactions directly within the 3D environment.

## 🛠️ Tech Stack

- **Framework**: Next.js / React (based on the reference)
- **3D Libraries**: Three.js, React Three Fiber, GSAP
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Network**: Axios or native `fetch` to talk to our API

## 🌐 Features to Develop

### 🔗 1. Dynamic Data Integration

- Replace hardcoded project data with API calls to `GET /api/projects`.
- Map the JSON response to the 3D meshes (e.g., dynamically render floating cards, images, or 3D text based on database contents).

### 🤖 2. Interactive AI UI Components

- **AI Chatbot Overlay**: A sleek, glass-morphism chat window where users can talk to the AI Portfolio Assistant.
- **Dynamic Difficulty Toggle**: A UI element attached to project details that fetches different explanation levels from the AI (`POST /api/ai/explain`).
- **"Next Project" Recommender**: A visual cue or 3D element that pops up after interaction, recommending the next project based on the AI's suggestion.

### 📊 3. Interaction Tracking

- Wire up the Three.js mesh `onClick` and `onPointerOver` events to send an API request (`POST /api/analytics/view` or `click`) whenever the user interacts with 3D elements.

## 🚀 Next Steps

1. Create the `frontend-website` folder and copy the reference codebase into it.
2. Clean up unused assets, rewrite `package.json` to reflect your ownership, and install any missing network libraries.
3. Build the UI components for the AI Chat and Explanation Toggles.
4. Hook up the existing 3D scene to the live data stream.
