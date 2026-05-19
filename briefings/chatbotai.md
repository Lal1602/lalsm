# NEXT.JS REAL AI CHATBOT INTEGRATION BRIEFING

## 1. ROLE & OBJECTIVE

Act as an Expert Next.js Fullstack Architect and AI Integrator. I want to replace my local, static `getSimulatedReply` function with a REAL AI Chatbot using the **Vercel AI SDK** and **Google Gemini API** (`gemini-1.5-flash`).

I already have the UI built (a floating glassmorphism chat overlay), but I need you to wire it up to a real Next.js Route Handler so the AI streams responses back to the frontend dynamically.

## 2. TECH STACK REQUIREMENTS

- **Framework:** Next.js (App Router)
- **AI SDK:** `ai` (Vercel AI SDK) and `@ai-sdk/google`
- **Frontend Hook:** `useChat` from `@ai-sdk/react` (or `ai/react`)
- **Styling:** Keep my existing CSS/Tailwind classes for the chat UI. Absolute visual parity is required.

## 3. BACKEND: ROUTE HANDLER (`app/api/chat/route.ts`)

Create the Next.js API route.

- Use the `streamText` function from the Vercel AI SDK.
- Use the `google('gemini-1.5-flash')` model.
- **CRITICAL - SYSTEM PROMPT:** You MUST inject the following system prompt into the AI's context so it knows who I am:
  "Kamu adalah asisten virtual resmi untuk Muhammad Bilal Sanayu Majid. Bilal adalah seorang mahasiswa D3 Teknik Informatika di PENS (Politeknik Elektronika Negeri Surabaya) angkatan 2025-2028. Dia adalah seorang Creative & Fullstack Web Developer yang sangat mahir menggunakan Next.js, React, GSAP, dan WebGL/Three.js untuk membuat website interaktif sekelas Awwwards. Dia juga bisa menggunakan Python untuk Computer Vision. Jawab pertanyaan pengunjung web dengan ramah, profesional, dan sedikit antusias. Gunakan bahasa Indonesia. Jangan pernah memberikan instruksi coding atau menjawab hal-hal terlarang di luar konteks portofolio, IT, atau profil Bilal. Jika ditanya harga, arahkan untuk mengisi form kontak."

Set the temperature parameter in the streamText function to 0.7. This ensures the AI gives naturally varied and non-repetitive responses when asked similar questions multiple times, while still remaining factual.

APPEND TO SYSTEM PROMPT: "Gunakan variasi kalimat yang natural, luwes, dan tidak kaku layaknya manusia yang sedang mengobrol santai namun tetap profesional. Hindari menjawab dengan template struktur kalimat yang sama berulang-ulang."

## 4. FRONTEND: CHAT COMPONENT (`components/ui/AiChatOverlay.tsx`)

Refactor my existing chat component to use the Vercel AI SDK.

- Replace any custom state (`messages`, `input`, `handleInputChange`, `handleSubmit`) with the destructured values from `const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();`
- Ensure the `messages` map correctly to my UI (e.g., checking `message.role === 'user'` to apply the correct CSS class for user bubbles vs AI bubbles).
- Add a visual loading indicator (e.g., "AI is thinking...") using the `isLoading` boolean.
- Ensure the chat container auto-scrolls to the bottom when new messages stream in.

## 5. EXECUTION PLAN (THINKING PHASE)

Use `<thinking>` to plan:

1. The exact terminal command I need to run to install the Vercel AI SDK (`npm i ai @ai-sdk/google`).
2. The structure of the `route.ts` file.
3. How to seamlessly inject `useChat` into my existing UI without breaking the glassmorphism design.

After thinking, output the code in this exact order:

1. The bash command to install dependencies.
2. The `.env` variable required (`GOOGLE_GENERATIVE_AI_API_KEY=...`).
3. The complete code for `app/api/chat/route.ts`.
4. The complete refactored code for the Chat Overlay component.
