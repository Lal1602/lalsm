import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests against a production build (what visitors actually get).
 *
 *   npm run build && npm run test:e2e
 *
 * Locally you can reuse an installed Chrome instead of downloading Chromium:
 *   PW_CHANNEL=chrome npm run test:e2e
 */
const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: process.env.PW_CHANNEL || undefined },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    // No API key in tests: the chat endpoint answers from the local simulation.
    env: { GEMINI_API_KEY: "" },
  },
});
