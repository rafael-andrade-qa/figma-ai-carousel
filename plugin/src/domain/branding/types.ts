import type { CarouselTemplate } from "../../types/branding";

export interface FontToken {
  family: string;
  style: string;
}

export interface BrandingInput {
  brand?: {
    profileHandle?: string;
    seriesName?: string;
    logoText?: string;
    voice?: "professional" | "educational" | "editorial";
  };
  colors?: {
    primary?: string;
    secondary?: string;
    background?: string;
    surface?: string;
    text?: string;
    accent?: string;
  };
  fonts?: {
    heading?: FontToken;
    body?: FontToken;
    accent?: FontToken;
  };
  spacing?: {
    scale?: "compact" | "comfortable" | "spacious";
  };
  cta?: {
    label?: string;
    style?: "solid" | "outline" | "pill";
  };
  template?: {
    id?: CarouselTemplate;
    variant?: string;
  };
}

export interface ResolvedBranding {
  brand: {
    profileHandle: string;
    seriesName: string;
    logoText: string;
    voice: "professional" | "educational" | "editorial";
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    accent: string;
  };
  fonts: {
    heading: FontToken;
    body: FontToken;
    accent: FontToken;
  };
  spacing: {
    scale: "compact" | "comfortable" | "spacious";
    values: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
    };
  };
  cta: {
    label: string;
    style: "solid" | "outline" | "pill";
  };
  template: {
    id: CarouselTemplate;
    variant: string;
  };
}