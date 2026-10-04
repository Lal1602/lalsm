import { defineConfig, devices } from "@playwright/test";

/**
 * Frame-budget measurements. Kept out of the default e2e run because they are
 * slow and their numbers depend on the machine.
 *
 *   npm run build && npm run perf            (report only)
 *   PERF_LABEL=phase1 npm run perf           (writes test-results/perf-phase1.json)
 *   PERF_ASSERT=1 npm run perf               (fails when a section blows its budget)
 *   PW_CHANNEL=chrome npm run perf           (use the installed Chrome and its real GPU)
 */
const PORT = 3101;

export default defineConfig({
  testDir: "tests/perf",
  timeout: 180_000,
  reporter: "list",
  workers: 1,
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        channel: process.env.PW_CHANNEL || undefined,
        launchOptions: { args: ["--ignore-gpu-blocklist", "--enable-gpu-rasterization"] },
      },
    },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 60_000,
    env: { GEMINI_API_KEY: "" },
  },
});
