/// <reference types="@figma/plugin-typings" />

import type { CarouselBranding } from "../types/branding";
import type { CarouselCard } from "../types/carousel";
import { FRAME_OFFSET_X } from "./constants/layout";
import { loadFonts } from "../utils/fonts";
import { renderCard } from "./renderCard";
import { sendStatus } from "../utils/notify";

export async function createCarouselFrames(
  cards: CarouselCard[],
  branding: CarouselBranding
) {
  sendStatus("Carregando fontes...");
  await loadFonts();

  const startX = figma.viewport.center.x;
  const startY = figma.viewport.center.y;

  let offsetX = 0;
  const createdFrames: FrameNode[] = [];
  const total = cards.length;

  for (let index = 0; index < cards.length; index++) {
    const card = cards[index];

    sendStatus(`Criando ${card.type}: ${card.title}`);

    const frame = await renderCard({
      card,
      index,
      total,
      branding,
    });

    frame.x = startX + offsetX;
    frame.y = startY;

    figma.currentPage.appendChild(frame);
    createdFrames.push(frame);

    offsetX += FRAME_OFFSET_X;
  }

  figma.currentPage.selection = createdFrames;
  figma.viewport.scrollAndZoomIntoView(createdFrames);
}