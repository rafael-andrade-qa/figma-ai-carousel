import type { CarouselTemplateDefinition } from "../../../domain/template/types";
import { educationalContentRenderer } from "./content";
import { educationalCoverRenderer } from "./cover";
import { educationalCtaRenderer } from "./cta";

export const educationalTemplate: CarouselTemplateDefinition = {
  id: "educational",
  label: "Educational",
  tokens: {
    frame: {
      width: 1080,
      height: 1080,
      borderRadius: 0,
      padding: 42,
      backgroundColor: "#F8FAFC",
    },
    typography: {
      coverTitleSize: 72,
      contentTitleSize: 62,
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
      cornerRadius: 28,
    },
  },
  renderers: {
    cover: educationalCoverRenderer,
    content: educationalContentRenderer,
    cta: educationalCtaRenderer,
  },
};