/// <reference types="@figma/plugin-typings" />

import { rgb } from "../../utils/color";

type CreateTextInput = {
  text: string;
  fontSize: number;
  fontStyle: "Regular" | "Bold";
  color: string;
  width: number;
  x: number;
  y: number;
  alignHorizontal?: "LEFT" | "CENTER" | "RIGHT" | "JUSTIFIED";
  lineHeight?: number;
};

export function createText(config: CreateTextInput): TextNode {
  const node = figma.createText();
  node.fontName = { family: "Inter", style: config.fontStyle };
  node.characters = config.text;
  node.fontSize = config.fontSize;
  node.resize(config.width, node.height);
  node.x = config.x;
  node.y = config.y;
  node.fills = [{ type: "SOLID", color: rgb(config.color) }];

  if (config.alignHorizontal) {
    node.textAlignHorizontal = config.alignHorizontal;
  }

  if (config.lineHeight) {
    node.lineHeight = {
      unit: "PIXELS",
      value: config.lineHeight,
    };
  }

  return node;
}