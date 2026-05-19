# Project Showcase - Backend API Briefing

This document outlines the API endpoints required by the Frontend Phase 2 application (3D Interactive Website). Ensure the `Project Showcase API` implements these endpoints with the specified JSON payloads to ensure seamless frontend integration.

## 1. Projects Data Endpoint

Used to dynamically load 3D project meshes and details in the 3D portfolio.

**Endpoint:** `GET /api/projects`
**Description:** Fetches an array of all available projects.

**Expected Response (JSON):**

```json
[
	{
		"id": 1,
		"slug": "smart-locker",
		"title": "Smart Locker App",
		"description": "IoT based application for locker access.",
		"techStack": ["React Native", "Node.js", "Zustand"],
		"previewImageUrl": "https://example.com/assets/smart-locker.png",
		"githubUrl": "https://github.com/...",
		"liveUrl": "https://...",
		"features": ["IoT Integration", "QR Authentication"]
	}
	// ... more projects
]
```

## 2. Dynamic AI Explainer Endpoint

Used specifically for the "Dynamic Difficulty Toggle" feature. The user can request simpler or more complex explanations of a project.

**Endpoint:** `POST /api/ai/explain`
**Description:** Generates an AI-driven explanation of a project based on a requested difficulty level.

**Request Body (JSON):**

```json
{
	"projectId": 1,
	"difficulty": "beginner" // Options: "beginner", "intermediate", "expert"
}
```

**Expected Response (JSON):**

```json
{
	"projectId": 1,
	"explanation": "This project is essentially a secure electronic locker system that lets you unlock doors using an app on your phone..."
}
```

## 3. Analytics Tracking Endpoint

Used to passively track user behaviour when interacting with 3D elements in the GSAP / Three.js environment.

**Endpoint:** `POST /api/analytics/interaction`
**Description:** Logs an interaction (`view` or `click`) for a specific project.

**Request Body (JSON):**

```json
{
	"projectId": 1,
	"interactionType": "hover", // Options: "hover", "click", "view"
	"timestamp": "2026-04-25T16:00:00Z"
}
```

**Expected Response (JSON):**

```json
{
	"success": true
}
```
