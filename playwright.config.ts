import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env.local") });
process.env.NEXT_PUBLIC_ENABLE_GEOFENCING = "false";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  globalSetup: require.resolve("./e2e/global.setup"),
  globalTeardown: require.resolve("./e2e/global.teardown"),
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    extraHTTPHeaders: {
      "x-playwright-test": "true"
    }
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
        permissions: ["geolocation"],
        geolocation: { latitude: -6.1714, longitude: 106.8687 },
      },
      dependencies: ["setup"],
      testMatch: ["**/auth.spec.ts", "**/user-journey.spec.ts"],
    },
    {
      name: "chromium-admin",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/admin.json" },
      dependencies: ["setup", "chromium"],
      testMatch: "**/admin-journey.spec.ts",
    },
    {
      name: "chromium-superadmin",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/superadmin.json" },
      dependencies: ["setup"],
      testMatch: "**/superadmin-journey.spec.ts",
    },
  ],
});
