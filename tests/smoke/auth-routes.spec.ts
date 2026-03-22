import { test, expect } from "@playwright/test";

function makeToken(role: "TENANT" | "PROPERTY_MANAGER" | "ADMIN") {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ role, sub: "smoke-user" })).toString("base64url");
  return `${header}.${payload}.x`;
}

test.beforeEach(async ({ page }) => {
  await page.route("**/__mock_api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace("/__mock_api", "");
    const method = route.request().method();

    if (method === "POST" && path === "/auth/login") {
      const body = route.request().postDataJSON() as { username?: string };
      const role = body?.username === "admin" ? "ADMIN" : "TENANT";
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ access_token: makeToken(role as any) }),
      });
    }

    const ok = (data: any) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(data) });

    if (method === "GET" && path === "/tenant/dashboard") return ok({ maintenanceRequests: { total: 3, pending: 1, inProgress: 1, completed: 1, urgent: 0 } });
    if (method === "GET" && path === "/maintenance") return ok([]);
    if (method === "GET" && path === "/payments/invoices") return ok([]);
    if (method === "GET" && path === "/leases/my-lease") return ok({ id: 1, status: "ACTIVE", startDate: new Date().toISOString(), endDate: new Date(Date.now() + 86400000).toISOString() });
    if (method === "GET" && path === "/messaging/conversations") return ok([]);
    if (method === "GET" && path === "/inspections") return ok([]);

    if (method === "GET" && path === "/dashboard/metrics") return ok({ occupancy: { percentage: 95, occupied: 19, total: 20 }, financials: { monthlyRevenue: 40000, collectedThisMonth: 38000, overdueAmount: 2000 }, maintenance: { total: 5, pending: 1, overdue: 0 }, applications: { total: 4, pending: 2 } });
    if (method === "GET" && path === "/properties") return ok([]);
    if (method === "GET" && path === "/leases") return ok([]);
    if (method === "GET" && path === "/users") return ok({ data: [] });

    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
});

test("tenant smoke: login + core routes", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("tenant");
  await page.getByLabel("Password").fill("Tenant123!@#");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/tenant\/dashboard/);
  await expect(page.getByRole("heading", { name: /tenant dashboard/i })).toBeVisible();

  await page.goto("/tenant/maintenance");
  await expect(page.getByRole("heading", { name: /maintenance requests/i })).toBeVisible();

  await page.goto("/tenant/payments");
  await expect(page.getByRole("heading", { name: /payments & billing/i })).toBeVisible();

  await page.goto("/tenant/inspections");
  await expect(page.getByRole("heading", { name: /inspections/i })).toBeVisible();
});

test("manager smoke: login + manager routes", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("Admin123!@#");
  await page.getByRole("button", { name: /sign in/i }).click();

  await page.goto("/manager/dashboard");
  await expect(page.getByRole("heading", { name: /manager dashboard/i })).toBeVisible();

  await page.goto("/manager/properties");
  await expect(page.getByRole("heading", { name: /manager properties/i })).toBeVisible();

  await page.goto("/manager/leases");
  await expect(page.getByRole("heading", { name: /manager leases/i })).toBeVisible();

  await page.goto("/manager/users");
  await expect(page.getByRole("heading", { name: /manager users/i })).toBeVisible();
});
