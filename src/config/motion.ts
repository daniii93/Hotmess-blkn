export const motionConfig = {
  durationFast: 0.25,
  durationNormal: 0.45,
  durationSlow: 0.75,
  easeLuxury: [0.22, 1, 0.36, 1],
} as const;

export const motionVariants = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  riseIn: {
    initial: { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 10 },
  },
  cardHover: {
    rest: { y: 0, scale: 1 },
    hover: { y: -4, scale: 1.01 },
  },
  subtleImageZoom: {
    rest: { scale: 1 },
    hover: { scale: 1.035 },
  },
} as const;

export const prohibitedMotionPatterns = [
  "bouncyAnimation",
  "aggressivePopups",
  "fastNeonGlows",
  "shakeExceptErrors",
  "gamifiedEffects",
] as const;

