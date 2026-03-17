import type {
  CarouselTemplateDefinition,
  SlideKind,
} from "../../domain/template/types";

export type RenderCardKind = SlideKind;

export interface RenderPipelineOptions {
  template: CarouselTemplateDefinition;
}