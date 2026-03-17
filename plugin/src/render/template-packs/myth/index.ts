import type { CarouselTemplateDefinition } from "../../../domain/template/types";
import { mythContentRenderer } from "./content";
import { mythCoverRenderer } from "./cover";
import { mythCtaRenderer } from "./cta";

export const mythTemplate: CarouselTemplateDefinition = {
  id: "myth",
  label: "Myth",
  tokens: {
    frame: {
      width: 1080,
      height: 1080,
      borderRadius: 0,
      padding: 42,
      backgroundColor: "#F8FAFC",
    },
    typography: {
      coverTitleSize: 66,
      contentTitleSize: 58,
      bodySize: 26,
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
    cover: mythCoverRenderer,
    content: mythContentRenderer,
    cta: mythCtaRenderer,
  },
};