export type CarouselTemplate =
  | "educational"
  | "authority"
  | "checklist"
  | "storytelling"
  | "myth";

export type CarouselBranding = {
  profileHandle: string;
  seriesName: string;
  primaryColor: string;
  template: CarouselTemplate;
  ctaLabel: string;
};