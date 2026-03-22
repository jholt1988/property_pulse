import { test, expect } from "@playwright/test";

function makeToken(role: "TENANT" | "PROPERTY_MANAGER" | "ADMIN") {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role, sub: "smoke-user" })).toString("base64url");
  return `${header}.${payload}.x`;
}

test("tenant smoke: core routes render", async ({ page, context }) => {
  await context.addCookies([
    { name: "session_token", value: makeToken("TENANT"), domain: "127.0.0.1", path: "/" },
    { name: "session_role", value: "TENANT", domain: "127.0.0.1", path: "/" },
  ]);

  await page.goto("/tenant/dashboard");
  await expect(page.getByRole("heading", { name: /tenant dashboard/i })).toBeVisible();

  await page.goto("/tenant/maintenance");
  await expect(page.getByRole("heading", { name: /maintenance requests/i })).toBeVisible();

  await page.goto("/tenant/payments");
  await expect(page.getByRole("heading", { name: /payments & billing/i })).toBeVisible();

  await page.goto("/tenant/inspections");
  await expect(page.getByRole("heading", { name: /inspections/i })).toBeVisible();
});

test("manager smoke: manager routes render", async ({ page, context }) => {
  await context.addCookies([
    { name: "session_token", value: makeToken("ADMIN"), domain: "127.0.0.1", path: "/" },
    { name: "session_role", value: "ADMIN", domain: "127.0.0.1", path: "/" },
  ]);

  await page.goto("/manager/dashboard");
  await expect(page.getByRole("heading", { name: /manager dashboard/i })).toBeVisible();

  await page.goto("/manager/properties");
  await expect(page.getByRole("heading", { name: /manager properties/i })).toBeVisible();

  await page.goto("/manager/leases");
  await expect(page.getByRole("heading", { name: /manager leases/i })).toBeVisible();

  await page.goto("/manager/users");
  await expect(page.getByRole("heading", { name: /manager users/i })).toBeVisible();
});
