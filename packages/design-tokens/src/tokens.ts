export const colors = {
  orange: {
    50:  "#fff7ed",
    100: "#ffedd5",
    200: "#fed7aa",
    300: "#fdba74",
    400: "#fb923c",
    500: "#f97316",
    600: "#ea580c",
    700: "#c2410c",
    800: "#9a3412",
    900: "#7c2d12",
    950: "#431407",
  },
  gray: {
    50:  "#fafafa",
    100: "#f5f5f5",
    200: "#e5e5e5",
    300: "#d4d4d4",
    400: "#a3a3a3",
    500: "#737373",
    600: "#525252",
    700: "#404040",
    800: "#262626",
    900: "#171717",
    950: "#0a0a0a",
  },
  white: "#ffffff",
  black: "#000000",
  red:    { 500: "#ef4444", 600: "#dc2626" },
  green:  { 500: "#22c55e", 600: "#16a34a" },
  yellow: { 500: "#eab308", 600: "#ca8a04" },
} as const;

export const semanticColors = {
  light: {
    background:            colors.white,
    "background-secondary": colors.gray[50],
    "background-tertiary":  colors.gray[100],
    foreground:            colors.gray[900],
    "foreground-secondary": colors.gray[600],
    "foreground-tertiary":  colors.gray[400],
    border:                colors.gray[200],
    "border-secondary":     colors.gray[100],
    ring:                  colors.orange[500],
    primary:               colors.orange[500],
    "primary-hover":        colors.orange[600],
    "primary-active":       colors.orange[700],
    "primary-foreground":   colors.white,
    "primary-muted":        colors.orange[50],
    destructive:           colors.red[500],
    "destructive-foreground": colors.white,
    success:               colors.green[500],
    "success-foreground":   colors.white,
    warning:               colors.yellow[500],
    "warning-foreground":   colors.gray[900],
    overlay:               "rgba(0, 0, 0, 0.4)",
  },
  dark: {
    background:            colors.gray[950],
    "background-secondary": colors.gray[900],
    "background-tertiary":  colors.gray[800],
    foreground:            colors.gray[50],
    "foreground-secondary": colors.gray[400],
    "foreground-tertiary":  colors.gray[600],
    border:                colors.gray[800],
    "border-secondary":     colors.gray[700],
    ring:                  colors.orange[500],
    primary:               colors.orange[500],
    "primary-hover":        colors.orange[400],
    "primary-active":       colors.orange[300],
    "primary-foreground":   colors.white,
    "primary-muted":        colors.orange[950],
    destructive:           colors.red[600],
    "destructive-foreground": colors.white,
    success:               colors.green[600],
    "success-foreground":   colors.white,
    warning:               colors.yellow[600],
    "warning-foreground":   colors.gray[50],
    overlay:               "rgba(0, 0, 0, 0.6)",
  },
} as const;

export const fontFamily = {
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'",
  mono: "ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace",
} as const;

export const fontSize = {
  xs:   { size: 12, lineHeight: 16 },
  sm:   { size: 14, lineHeight: 20 },
  base: { size: 16, lineHeight: 24 },
  lg:   { size: 18, lineHeight: 28 },
  xl:   { size: 20, lineHeight: 28 },
  "2xl": { size: 24, lineHeight: 32 },
  "3xl": { size: 30, lineHeight: 36 },
  "4xl": { size: 36, lineHeight: 40 },
} as const;

export const fontWeight = {
  normal:   400,
  medium:   500,
  semibold: 600,
  bold:     700,
} as const;

export const spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  4:    16,
  5:    20,
  6:    24,
  8:    32,
  10:   40,
  12:   48,
  16:   64,
  20:   80,
  24:   96,
} as const;

export const radius = {
  none: 0,
  sm:   4,
  md:   8,
  lg:   12,
  xl:   16,
  "2xl": 24,
  full: 9999,
} as const;

export const shadow = {
  sm:  "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md:  "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)",
  lg:  "0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.07)",
  xl:  "0 20px 25px -5px rgba(0, 0, 0, 0.07), 0 8px 10px -6px rgba(0, 0, 0, 0.07)",
} as const;

export const duration = {
  fast:    "100ms",
  normal:  "200ms",
  slow:    "300ms",
} as const;

export const easing = {
  default: "cubic-bezier(0.4, 0, 0.2, 1)",
  in:      "cubic-bezier(0.4, 0, 1, 1)",
  out:     "cubic-bezier(0, 0, 0.2, 1)",
  inOut:   "cubic-bezier(0.4, 0, 0.2, 1)",
} as const;

export const breakpoint = {
  sm:   640,
  md:   768,
  lg:   1024,
  xl:   1280,
  "2xl": 1536,
} as const;

export type SemanticColorKey = keyof typeof semanticColors.light;
export type ColorMode = "light" | "dark";
