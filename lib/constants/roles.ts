export const ROLES = {
  tenant: "TENANT",
  manager: "PROPERTY_MANAGER",
  admin: "ADMIN",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];
