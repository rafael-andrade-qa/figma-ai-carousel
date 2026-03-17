/// <reference types="@figma/plugin-typings" />

import { createText } from "./createText";
import { rgb } from "../../utils/color";

export function createCounterPill(
  current: number,
  total: number,
  x: number,
  y: number,
  backgroundHex: string
): FrameNode {
  const pill = figma.createFrame();
  pill.resize(112, 72);
  pill.x = x;
  pill.y = y;
  pill.cornerRadius = 999;
  pill.fills = [
    {
      type: "SOLID",
      color: rgb(backgroundHex),
      opacity: 0.95,
    },
  ];
  pill.strokes = [];

  pill.appendChild(
    createText({
      text: `${current}/${total}`,
      fontSize: 34,
      fontStyle: "Regular",
      color: "#FFFFFF",
      width: 112,
      x: 0,
      y: 16,
      alignHorizontal: "CENTER",
    })
  );

  return pill;
}