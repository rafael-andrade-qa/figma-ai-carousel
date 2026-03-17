import type { CarouselBranding } from "./branding";

export type GenerateCarouselMessage = {
  type: "generate-carousel";
  prompt: string;
  cards: number;
  branding?: CarouselBranding;
  accessToken: string;
};

export type PluginToUiMessage =
  | { type: "status"; message: string }
  | { type: "error"; message: string; creditsUsed?: number }
  | { type: "success"; message: string; creditsUsed?: number };