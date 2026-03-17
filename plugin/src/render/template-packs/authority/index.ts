import type { CarouselTemplateDefinition } from "../../../domain/template/types";
import { authorityContentRenderer } from "./content";
import { authorityCoverRenderer } from "./cover";
import { authorityCtaRenderer } from "./cta";

export const authorityTemplate: CarouselTemplateDefinition = {
  id: "authority",
  label: "Authority",
  tokens: {
    frame: {
      width: 1080,
      height: 1080,
      borderRadius: 0,
      padding: 42,
      backgroundColor: "#050505",
    },
    typography: {
      coverTitleSize: 88,
      contentTitleSize: 70,
      bodySize: 28,
      ctaSize: 28,
      metaSize: 16,
    },
    spacing: {
      xs: 8,
      sm: 12,
      md: 16,
      lg: 24,
      xl: 32,
    },
    image: {
      cornerRadius: 24,
    },
  },
  renderers: {
    cover: authorityCoverRenderer,
    content: authorityContentRenderer,
    cta: authorityCtaRenderer,
  },
};