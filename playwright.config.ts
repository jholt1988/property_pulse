import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/smoke",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3100/__mock_api npm run dev -- -p 3100",
    port: 3100,
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
