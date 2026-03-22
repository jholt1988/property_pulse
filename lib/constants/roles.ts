export const ROLES = {
  tenant: "tenant",
  manager: "manager",
  admin: "admin",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
