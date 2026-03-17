import type { BrandingInput, ResolvedBranding } from "./types";

import { DEFAULT_BRANDING } from "./defaults";

function getSpacingValues(scale: "compact" | "comfortable" | "spacious") {
  if (scale === "compact") {
    return { xs: 6, sm: 10, md: 14, lg: 20, xl: 28 };
  }

  if (scale === "spacious") {
    return { xs: 10, sm: 14, md: 20, lg: 28, xl: 40 };
  }

  return { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };
}

export function resolveBranding(input?: BrandingInput): ResolvedBranding {
  const spacingScale = input?.spacing?.scale ?? DEFAULT_BRANDING.spacing.scale;

  return {
    brand: {
      profileHandle:
        input?.brand?.profileHandle ?? DEFAULT_BRANDING.brand.profileHandle,
      seriesName:
        input?.brand?.seriesName ?? DEFAULT_BRANDING.brand.seriesName,
      logoText:
        input?.brand?.logoText ?? DEFAULT_BRANDING.brand.logoText,
      voice:
        input?.brand?.voice ?? DEFAULT_BRANDING.brand.voice,
    },
    colors: {
      primary: input?.colors?.primary ?? DEFAULT_BRANDING.colors.primary,
      secondary: input?.colors?.secondary ?? DEFAULT_BRANDING.colors.secondary,
      background: input?.colors?.background ?? DEFAULT_BRANDING.colors.background,
      surface: input?.colors?.surface ?? DEFAULT_BRANDING.colors.surface,
      text: input?.colors?.text ?? DEFAULT_BRANDING.colors.text,
      accent: input?.colors?.accent ?? DEFAULT_BRANDING.colors.accent,
    },
    fonts: {
      heading: input?.fonts?.heading ?? DEFAULT_BRANDING.fonts.heading,
      body: input?.fonts?.body ?? DEFAULT_BRANDING.fonts.body,
      accent: input?.fonts?.accent ?? DEFAULT_BRANDING.fonts.accent,
    },
    spacing: {
      scale: spacingScale,
      values: getSpacingValues(spacingScale),
    },
    cta: {
      label: input?.cta?.label ?? DEFAULT_BRANDING.cta.label,
      style: input?.cta?.style ?? DEFAULT_BRANDING.cta.style,
    },
    template: {
      id: input?.template?.id ?? DEFAULT_BRANDING.template.id,
      variant: input?.template?.variant ?? DEFAULT_BRANDING.template.variant,
    },
  };
}