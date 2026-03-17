import type { ResolvedBranding } from "./types";

export const DEFAULT_BRANDING: ResolvedBranding = {
  brand: {
    profileHandle: "@seuperfil",
    seriesName: "Minha Série",
    logoText: "Minha Marca",
    voice: "professional",
  },
  colors: {
    primary: "#2563EB",
    secondary: "#1E40AF",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    accent: "#22C55E",
  },
  fonts: {
    heading: {
      family: "Inter",
      style: "Bold",
    },
    body: {
      family: "Inter",
      style: "Regular",
    },
    accent: {
      family: "Inter",
      style: "Medium",
    },
  },
  spacing: {
    scale: "comfortable",
    values: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    },
  },
  cta: {
    label: "Saiba mais",
    style: "solid",
  },
  template: {
    id: "educational",
    variant: "default",
  },
};