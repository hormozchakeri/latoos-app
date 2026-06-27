export const theme = {
  colors: {
    // ── Brand (teal) ──────────────────────────────────────
    primary: {
      50:  "#F0FDFA",
      100: "#CCFBF1",
      400: "#2DD4BF",
      500: "#14B8A6",
      600: "#0D9488",
      700: "#0F766E",
    },
    // ── Neutral / slate ───────────────────────────────────
    ink: {
      900: "#0F172A",
      700: "#334155",
      500: "#64748B",
      400: "#94A3B8",
      300: "#CBD5E1",
      200: "#E2E8F0",
      100: "#F1F5F9",
      50:  "#F8FAFC",
    },
    // ── Status ────────────────────────────────────────────
    success: "#10B981",
    warning: "#F59E0B",
    danger:  "#EF4444",
    info:    "#3B82F6",
    // ── Hero background (teal — brand) ────────────────────
    hero: "#0D9488",
    // ── Accent (orange — CTAs: Enroll, Practice, key actions) ──
    accent: "#f76e2b",
    // ── Base ──────────────────────────────────────────────
    white: "#FFFFFF",
    black: "#000000",
  },
  // ── Spacing / radius tokens (use directly in inline styles when needed) ──
  radius: {
    sm:  8,
    md:  12,
    lg:  16,
    xl:  24,
    full: 9999,
  },
  font: {
    xs:   11,
    sm:   12,
    base: 14,
    md:   16,
    lg:   20,
    xl:   26,
  },
} as const;

export type Theme = typeof theme;
