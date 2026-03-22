export const motionTokens = {
  fast: "120ms",
  base: "180ms",
  slow: "260ms",
  panel: "320ms",
  easing: {
    standard: "cubic-bezier(0.2, 0.8, 0.2, 1)",
    entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
    exit: "cubic-bezier(0.4, 0, 1, 1)",
  },
} as const;
