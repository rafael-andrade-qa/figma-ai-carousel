import type {
  CarouselCard,
  CarouselCardType,
} from "../../types/carousel";

import type { ResolvedBranding } from "../branding/types";

export type SlideKind = CarouselCardType;

export interface TemplateTokens {
  frame: {
    width: number;
    height: number;
    borderRadius: number;
    padding: number;
    backgroundColor?: string;
  };
  typography: {
    coverTitleSize: number;
    contentTitleSize: number;
    bodySize: number;
    ctaSize: number;
    metaSize: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  image: {
    cornerRadius: number;
  };
}

export interface TemplateRenderContext {
  branding: ResolvedBranding;
  tokens: TemplateTokens;
  assets?: {
    imageBytesBySlideId?: Record<string, Uint8Array>;
  };
}

export interface SlideRendererArgs {
  slide: CarouselCard;
  index: number;
  total: number;
  context: TemplateRenderContext;
}

export interface SlideRenderer {
  render(args: SlideRendererArgs): Promise<FrameNode>;
}

export interface CarouselTemplateDefinition {
  id: ResolvedBranding["template"]["id"];
  label: string;
  tokens: TemplateTokens;
  renderers: Partial<Record<SlideKind, SlideRenderer>>;
}