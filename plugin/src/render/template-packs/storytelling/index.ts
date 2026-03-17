import type { CarouselTemplateDefinition } from "../../../domain/template/types";
import { storytellingContentRenderer } from "./content";
import { storytellingCoverRenderer } from "./cover";
import { storytellingCtaRenderer } from "./cta";

export const storytellingTemplate: CarouselTemplateDefinition = {
  id: "storytelling",
  label: "Storytelling",
  tokens: {
    frame: {
      width: 1080,
      height: 1080,
      borderRadius: 0,
      padding: 42,
      backgroundColor: "#F8FAFC",
    },
    typography: {
      coverTitleSize: 82,
      contentTitleSize: 60,
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
    cover: storytellingCoverRenderer,
    content: storytellingContentRenderer,
    cta: storytellingCtaRenderer,
  },
};