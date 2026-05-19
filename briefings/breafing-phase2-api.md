# 🌌 Phase 2 Briefing: Backend API System

## 🎯 Purpose

This API will serve as the brain and data layer for the 3D Interactive Portfolio. It will be completely detached from the frontend website, allowing for better scalability, security, and the ability to manage 2 separate repositories.

## 🛠️ Tech Stack Proposition

- **Runtime**: Node.js
- **Framework**: Express.js (or NestJS / FastAPI)
- **Database ORM**: Prisma
- **Database**: SQLite (for ease of local development without complex setup)
- **AI Integration**: Google Gemini (via `@google/genai`)

## 🌐 Features to Develop

### 🗂️ 1. Project Management Endpoints (CRUD)

- `GET /api/projects`: Fetch all projects to be displayed in the 3D environment.
- `GET /api/projects/:id`: Fetch specific project details.

### 🤖 2. AI Intelligence Endpoints

- `POST /api/ai/chat`: Handles user queries about the portfolio and returns context-aware AI responses.
- `POST /api/ai/explain`: Receives a project ID and a target level (beginner/intermediate/advanced) and returns an AI-generated explanation.
- `POST /api/ai/recommend`: Analyzes user interaction history and recommends the next best project to view based on similarity and interest.

### 📊 3. Telemetry & User Interaction Endpoints

- `POST /api/analytics/view`: Logs when a user views or focuses on a project in the 3D space.
- `POST /api/analytics/click`: Logs when a user actively clicks/interacts with an item.
- `GET /api/analytics/insights`: Returns general statistics (e.g., most popular projects).

## 🚀 Next Steps

1. Initialize the `backend-api` repository and install dependencies.
2. Set up the Prisma Database schema (`Project`, `Interaction`, `Feedback`).
3. Build the core routes.
4. Integrate the Gemini AI functionality securely.
