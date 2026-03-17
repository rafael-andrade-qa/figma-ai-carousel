import type { CarouselTemplate } from "../../types/branding";
import type { CarouselTemplateDefinition } from "./types";
import { authorityTemplate } from "../../render/template-packs/authority/index";
import { checklistTemplate } from "../../render/template-packs/checklist/index";
import { educationalTemplate } from "../../render/template-packs/educational/index";
import { mythTemplate } from "../../render/template-packs/myth/index";
import { storytellingTemplate } from "../../render/template-packs/storytelling/index";

const registry = new Map<CarouselTemplate, CarouselTemplateDefinition>();

function ensureTemplatesRegistered() {
  if (!registry.has("educational")) {
    registry.set("educational", educationalTemplate);
  }

  if (!registry.has("authority")) {
    registry.set("authority", authorityTemplate);
  }

  if (!registry.has("checklist")) {
    registry.set("checklist", checklistTemplate);
  }

  if (!registry.has("storytelling")) {
    registry.set("storytelling", storytellingTemplate);
  }

  if (!registry.has("myth")) {
    registry.set("myth", mythTemplate);
  }
}

export function registerTemplate(template: CarouselTemplateDefinition) {
  ensureTemplatesRegistered();
  registry.set(template.id, template);
}

export function getTemplate(
  templateId: CarouselTemplate
): CarouselTemplateDefinition | null {
  ensureTemplatesRegistered();
  return registry.get(templateId) ?? null;
}

export function getAllTemplates(): CarouselTemplateDefinition[] {
  ensureTemplatesRegistered();
  return Array.from(registry.values());
}