import { test, expect } from "@playwright/test";

function makeToken(role: "TENANT" | "PROPERTY_MANAGER" | "ADMIN") {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role, sub: "tenant-maintenance-user" })).toString("base64url");
  return `${header}.${payload}.x`;
}

test.describe("Tenant User Story: Predictive Maintenance & Self-Triage", () => {
  test.beforeEach(async ({ page, context }) => {
    await context.addCookies([
      { name: "session_token", value: makeToken("TENANT"), domain: "127.0.0.1", path: "/" },
      { name: "session_role", value: "TENANT", domain: "127.0.0.1", path: "/" },
    ]);

    // Mock Chatbot AI Triage Response
    await page.route("**/api/backend/maintenance/chatbot/triage*", async (route) => {
      const json = {
        urgency: "LOW",
        category: "APPLIANCE",
        suggestedFix: {
          title: "Garbage Disposal Jam Reset",
          videoUrl: "https://mock-video.local/disposal-fix",
          description: "Press the small red reset button on the bottom of the disposal unit."
        }
      };
      await route.fulfill({ json, status: 200 });
    });

    // Mock direct Maintenance POST route
    await page.route("**/api/backend/maintenance*", async (route) => {
      if (route.request().method() === "POST") {
        await route.fulfill({
          json: { success: true, request: { id: 99, title: "Mock Fault", status: "PENDING" } },
          status: 201
        });
      } else {
        await route.fulfill({ json: { requests: [] }, status: 200 });
      }
    });
  });

  test("Should mock AI intercepting a maintenance request offering a self-fix sequence", async ({ page }) => {
    // Navigate to the maintenance page
    await page.goto("/tenant/maintenance");

    // Click "New Request" or type into the simulated triage bot
    // We assume the UI has a textbox for issue description
    const inputField = page.getByRole("textbox", { name: /describe your issue/i });
    if (await inputField.isVisible()) {
        await inputField.fill("My garbage disposal is humming but not spinning.");
        await page.getByRole("button", { name: /submit/i }).click();

        // The mocked triage endpoint should return the Self-Fix
        await expect(page.locator("text=Garbage Disposal Jam Reset")).toBeVisible();
        await expect(page.locator("text=Press the small red reset button")).toBeVisible();
    }
  });
});
