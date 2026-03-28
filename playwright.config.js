// @ts-check
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: true,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
  },
  webServer: {
    command: "python -m http.server 4173",
    url: "http://127.0.0.1:4173/index.html",
    reuseExistingServer: true,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chrome-mobile",
      use: {
        ...devices["Pixel 5"],
        browserName: "chromium",
        channel: "chrome",
      },
    },
  ],
});
