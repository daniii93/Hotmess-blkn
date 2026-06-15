import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./*.php", "./app/**/*.php"],
  theme: {
    extend: {
      colors: {
        hm: {
          ivory: "var(--hm-ivory)",
          porcelain: "var(--hm-porcelain)",
          champagne: "var(--hm-champagne)",
          gold: "var(--hm-gold)",
          goldDeep: "var(--hm-gold-deep)",
          ink: "var(--hm-ink)",
          inkSoft: "var(--hm-ink-soft)",
          success: "var(--hm-success)",
          error: "var(--hm-error)",
          dating: "var(--hm-dating)",
          business: "var(--hm-business)",
          admin: "var(--hm-admin)",
          scannerBg: "var(--hm-scanner-bg)",
          border: "var(--hm-border)",
          borderSoft: "var(--hm-border-soft)",
        },
      },
      borderRadius: {
        luxury: "1rem",
        card: "1rem",
        pill: "9999px",
      },
      boxShadow: {
        luxury: "var(--hm-shadow-soft)",
        gold: "0 0 0 1px rgba(198, 163, 93, 0.28)",
        soft: "0 8px 30px rgba(28,25,21,.08)",
      },
      letterSpacing: {
        luxury: "0.08em",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Playfair Display", "Libre Baskerville", "serif"],
        sans: ["Inter", "Arial", "Helvetica", "sans-serif"],
      },
    },
  },
} satisfies Config;
