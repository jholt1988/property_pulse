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
          properties: "#60A5FA"
        }
      },
      borderRadius: {
        xl2: "20px",
        xl3: "24px"
      },
      boxShadow: {
        subtle: "0 0 0 1px rgba(255,255,255,0.04)"
      }
    }
  },
  plugins: []
};

export default config;
