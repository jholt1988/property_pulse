import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        keyring: {
          core: "#3B82F6",
          navy: "#0B1220",
          panel: "#111827",
          card: "#1F2937",
          gray: "#94A3B8",
          inspect: "#14B8A6",
          lease: "#8B5CF6",
          finance: "#10B981",
          ai: "#22D3EE",
          tenants: "#F59E0B",
          properties: "#60A5FA",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
          info: "#3B82F6",
          pending: "#A78BFA"
        }
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        10: "40px",
        12: "48px",
        16: "64px"
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        xl2: "20px",
        xl3: "24px"
      },
      transitionDuration: {
        fast: "120ms",
        base: "180ms",
        slow: "260ms",
        panel: "320ms"
      },
      boxShadow: {
        subtle: "0 0 0 1px rgba(255,255,255,0.04)"
      }
    }
  },
  plugins: []
};

export default config;
