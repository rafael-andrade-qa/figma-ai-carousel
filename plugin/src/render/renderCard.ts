import type { RenderContext } from "./types";
import { getTemplate } from "../domain/template/registry";
import { resolveBranding } from "../domain/branding/resolveBranding";

export async function renderCard(context: RenderContext): Promise<FrameNode> {
  const { card, index, total, branding } = context;

  const resolvedBranding = resolveBranding({
    brand: {
      profileHandle: branding.profileHandle,
      seriesName: branding.seriesName,
    },
    colors: {
      primary: branding.primaryColor,
    },
    cta: {
      label: branding.ctaLabel,
    },
    template: {
      id: branding.template,
    },
  });

  const template = getTemplate(resolvedBranding.template.id);

  if (!template) {
    throw new Error(`Template não encontrado: ${resolvedBranding.template.id}`);
  }

  const renderer = template.renderers[card.type];

  if (!renderer) {
    throw new Error(
      `Renderer não encontrado para o tipo "${card.type}" no template "${template.id}"`
    );
  }

  return renderer.render({
    slide: card,
    index,
    total,
    context: {
      branding: resolvedBranding,
      tokens: template.tokens,
    },
  });
}