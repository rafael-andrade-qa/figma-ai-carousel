import type { CarouselBranding } from "./branding";

export type GenerateCarouselMessage = {
  type: "generate-carousel";
  prompt: string;
  cards: number;
  branding?: CarouselBranding;
};

export type PluginToUiMessage =
  | { type: "status"; message: string }
  | { type: "error"; message: string }
  | { type: "success"; message: string };