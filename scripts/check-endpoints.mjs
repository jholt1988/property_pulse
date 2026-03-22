#!/usr/bin/env node

const base = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || "";

const endpoints = [
  ["GET", "/auth/password-policy"],
  ["GET", "/tenant/dashboard"],
  ["GET", "/maintenance"],
  ["GET", "/payments/invoices"],
  ["GET", "/leases/my-lease"],
  ["GET", "/messaging/conversations"],
  ["GET", "/inspections"],
  ["GET", "/properties/public"],
  ["GET", "/dashboard/metrics"],
  ["GET", "/properties"],
  ["GET", "/leases"],
  ["GET", "/rental-applications"],
  ["GET", "/users"],
  ["GET", "/security-events?limit=1"],
];

if (!base) {
  console.error("Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL or API_BASE_URL.");
  process.exit(2);
}

const run = async () => {
  const rows = [];
  for (const [method, path] of endpoints) {
    const url = `${base}${path}`;
    try {
      const res = await fetch(url, { method });
      rows.push({ method, path, status: res.status, ok: res.ok });
    } catch (e) {
      rows.push({ method, path, status: "ERR", ok: false, error: String(e?.message || e) });
    }
  }

  console.table(rows);
  const failed = rows.filter((r) => r.status === "ERR" || (typeof r.status === "number" && r.status >= 500));
  process.exit(failed.length ? 1 : 0);
};

run();
