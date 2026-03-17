/// <reference types="@figma/plugin-typings" />

export function createBaseFrame(name: string): FrameNode {
  const frame = figma.createFrame();
  frame.resize(1080, 1080);
  frame.name = name;
  frame.layoutMode = "NONE";
  frame.clipsContent = true;
  frame.strokes = [];
  return frame;
}