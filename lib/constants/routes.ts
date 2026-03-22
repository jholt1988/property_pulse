export const ROUTES = {
  public: {
    login: "/login",
    signup: "/signup",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },
  tenant: {
    dashboard: "/tenant/dashboard",
    maintenance: "/tenant/maintenance",
    payments: "/tenant/payments",
    lease: "/tenant/lease",
    inspections: "/tenant/inspections",
    messages: "/tenant/messages",
    application: "/tenant/application",
  },
  manager: {
    dashboard: "/manager/dashboard",
    properties: "/manager/properties",
    leases: "/manager/leases",
    applications: "/manager/applications",
    reporting: "/manager/reporting",
    users: "/manager/users",
    audit: "/manager/audit",
  },
  legal: {
    privacy: "/legal/privacy",
    terms: "/legal/terms",
  },
} as const;
