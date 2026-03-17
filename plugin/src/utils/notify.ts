/// <reference types="@figma/plugin-typings" />

export function sendStatus(message: string) {
  console.log("[PLUGIN STATUS]", message);
  figma.ui.postMessage({ type: "status", message });
}

export function sendError(message: string) {
  console.error("[PLUGIN ERROR]", message);
  figma.ui.postMessage({ type: "error", message });
}

export function sendSuccess(message: string) {
  console.log("[PLUGIN SUCCESS]", message);
  figma.ui.postMessage({ type: "success", message });
}