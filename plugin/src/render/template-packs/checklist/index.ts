import type { CarouselTemplateDefinition } from "../../../domain/template/types";
import { checklistContentRenderer } from "./content";
import { checklistCoverRenderer } from "./cover";
import { checklistCtaRenderer } from "./cta";

export const checklistTemplate: CarouselTemplateDefinition = {
  id: "checklist",
  label: "Checklist",
  tokens: {
    frame: {
      width: 1080,
      height: 1080,
      borderRadius: 0,
      padding: 42,
      backgroundColor: "#F8FAFC",
    },
    typography: {
      coverTitleSize: 70,
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
    cover: checklistCoverRenderer,
    content: checklistContentRenderer,
    cta: checklistCtaRenderer,
  },
};