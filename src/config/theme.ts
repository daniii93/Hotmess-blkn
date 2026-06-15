export const hmColors = {
  ivory: "#F7F4EF",
  pearl: "#FDFBF8",
  champagne: "#D8B46A",
  softGold: "#C8A35D",
  antiqueGold: "#A9823A",
  red: "#B91C1C",
  redDark: "#7F1111",
  black: "#0F0F10",
  luxuryBlack: "#080808",
  charcoal: "#171717",
  deepCharcoal: "#232323",
  textPrimary: "#FAFAFA",
  textSecondary: "#B3B3B3",
  textMuted: "#777777",
  textDark: "#111111",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",
} as const;

export const hmSemanticColors = {
  background: "var(--hm-luxury-black)",
  surface: "var(--hm-charcoal)",
  surfaceStrong: "var(--hm-deep-charcoal)",
  landingLight: "var(--hm-pearl)",
  primaryCta: "var(--hm-champagne)",
  primaryCtaText: "var(--hm-text-dark)",
  secondaryCtaBorder: "var(--hm-border-strong)",
  secondaryCtaText: "var(--hm-champagne)",
  destructive: "var(--hm-red)",
  focus: "var(--hm-champagne)",
} as const;

export const hmRadii = {
  luxury: "24px",
  card: "28px",
  pill: "9999px",
} as const;

export const hmShadows = {
  luxury: "0 24px 80px rgba(0,0,0,0.35)",
  gold: "0 0 0 1px rgba(216,180,106,0.18)",
  soft: "0 12px 40px rgba(0,0,0,0.22)",
} as const;

export const hmTypography = {
  display: '"Cormorant Garamond", "Playfair Display", "Libre Baskerville", serif',
  body: '"Inter", Arial, Helvetica, sans-serif',
  labelLetterSpacing: "0.08em",
  headlineLineHeight: "0.95",
  bodyLineHeight: "1.6",
} as const;

export const hmComponentStyleRules = {
  buttons: {
    minHeight: "44px",
    primary: "champagneGoldPill",
    secondary: "transparentGoldBorder",
    destructive: "subtleRed",
  },
  cards: {
    radius: hmRadii.card,
    border: "var(--hm-border)",
    shadow: hmShadows.soft,
  },
  forms: {
    minHeight: "48px",
    focusColor: "var(--hm-champagne)",
    errorTone: "subtle",
  },
} as const;

