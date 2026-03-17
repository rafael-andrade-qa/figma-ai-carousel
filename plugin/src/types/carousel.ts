export type CarouselCardType = "cover" | "content" | "cta";

export type CarouselCard = {
  type: CarouselCardType;
  title: string;
  text: string;
  imagePrompt?: string;
  imageUrl?: string;
};

export type CarouselResponse = {
  cards: CarouselCard[];
  creditsUsed?: number;
  creditsLeft?: number;
};