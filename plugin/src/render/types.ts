import type { CarouselBranding } from "../types/branding";
import type { CarouselCard } from "../types/carousel";

export type RenderContext = {
  card: CarouselCard;
  index: number;
  total: number;
  branding: CarouselBranding;
};