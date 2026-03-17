/// <reference types="@figma/plugin-typings" />

export function rgb(hex: string): RGB {
  const clean = hex.replace("#", "");
  const value = parseInt(clean, 16);

  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;

  return { r, g, b };
}