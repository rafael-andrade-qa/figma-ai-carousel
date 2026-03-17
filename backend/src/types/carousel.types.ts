export type CarouselCardType = "cover" | "content" | "cta";

export type RawCarouselCard = {
  type: CarouselCardType;
  title: string;
  text: string;
  imagePrompt: string;
};

export type CarouselCard = RawCarouselCard & {
  imageUrl?: string;
};

export type RawCarouselResponse = {
  cards: RawCarouselCard[];
};

export type CarouselResponse = {
  cards: CarouselCard[];
};

export type GenerateCarouselInput = {
  prompt: string;
  cards: number;
};