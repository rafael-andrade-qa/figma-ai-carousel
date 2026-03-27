export type CreativeFormat =
  | "carousel"
  | "static_post"
  | "stories"
  | "reel_cover"
  | "banner"
  | "whatsapp";

export type CreativeFormatOption = {
  id: CreativeFormat;
  label: string;
  badge: string;
  description: string;
  availableNow: boolean;
};

export const CREATIVE_FORMATS: CreativeFormatOption[] = [
  {
    id: "carousel",
    label: "Carrossel",
    badge: "Disponível agora",
    description: "Conteúdo em sequência para educar, gerar autoridade e converter.",
    availableNow: true,
  },
  {
    id: "static_post",
    label: "Post estático",
    badge: "Em breve",
    description: "Peça única para oferta, prova social, autoridade ou anúncio.",
    availableNow: false,
  },
  {
    id: "stories",
    label: "Stories",
    badge: "Em breve",
    description: "Criativos verticais rápidos para engajamento e conversão.",
    availableNow: false,
  },
  {
    id: "reel_cover",
    label: "Capa para Reels",
    badge: "Em breve",
    description: "Capas pensadas para aumentar clique e melhorar CTR.",
    availableNow: false,
  },
  {
    id: "banner",
    label: "Banner",
    badge: "Em breve",
    description: "Banners simples para site, landing page e campanhas.",
    availableNow: false,
  },
  {
    id: "whatsapp",
    label: "Arte para WhatsApp",
    badge: "Em breve",
    description: "Peças rápidas para divulgação local e conversão direta.",
    availableNow: false,
  },
];

export function getCreativeFormatLabel(format: CreativeFormat | null | undefined) {
  if (!format) {
    return "Criativo";
  }

  const match = CREATIVE_FORMATS.find((item) => item.id === format);
  return match?.label ?? "Criativo";
}

export function isCreativeFormatAvailableNow(format: CreativeFormat) {
  const match = CREATIVE_FORMATS.find((item) => item.id === format);
  return Boolean(match?.availableNow);
}

export function getDashboardTitleByFormat(format: CreativeFormat | null | undefined) {
  switch (format) {
    case "carousel":
      return "Crie carrosséis com IA dentro do Figma";
    case "static_post":
      return "Crie posts estáticos com IA dentro do Figma";
    case "stories":
      return "Crie stories com IA dentro do Figma";
    case "reel_cover":
      return "Crie capas para Reels com IA dentro do Figma";
    case "banner":
      return "Crie banners com IA dentro do Figma";
    case "whatsapp":
      return "Crie artes para WhatsApp com IA dentro do Figma";
    default:
      return "Crie peças com IA dentro do Figma";
  }
}

export function getDashboardSubtitleByFormat(
  format: CreativeFormat | null | undefined
) {
  switch (format) {
    case "carousel":
      return "Gere capa, conteúdo e CTA final com texto e imagem em poucos cliques.";
    case "static_post":
      return "Crie uma peça única com texto, direção visual e composição pronta.";
    case "stories":
      return "Monte criativos verticais rápidos com foco em retenção e ação.";
    case "reel_cover":
      return "Gere capas mais chamativas para melhorar clique e percepção.";
    case "banner":
      return "Crie banners simples para campanhas, páginas e promoções.";
    case "whatsapp":
      return "Gere artes diretas para divulgação, oferta e comunicação rápida.";
    default:
      return "Transforme um briefing em um criativo pronto para usar.";
  }
}

export function getPromptPlaceholderByFormat(
  format: CreativeFormat | null | undefined
) {
  switch (format) {
    case "carousel":
      return "Ex.: Carrossel para dentistas sobre o que fazer quando a agenda da clínica está vazia...";
    case "static_post":
      return "Ex.: Post estático para clínica estética promovendo harmonização facial com CTA para WhatsApp...";
    case "stories":
      return "Ex.: Sequência de stories para loja feminina divulgando promoção de fim de semana...";
    case "reel_cover":
      return "Ex.: Capa para Reels sobre 3 erros que fazem sua campanha vender menos...";
    case "banner":
      return "Ex.: Banner para landing page de mentoria com headline forte e CTA comercial...";
    case "whatsapp":
      return "Ex.: Arte para WhatsApp divulgando promoção de Páscoa de uma confeitaria...";
    default:
      return "Descreva o criativo que você quer gerar...";
  }
}

export function getPromptSuggestionsByFormat(
  format: CreativeFormat | null | undefined
) {
  switch (format) {
    case "carousel":
      return [
        "Erros comuns",
        "Passo a passo",
        "Mito ou verdade",
        "Estudo de caso",
        "Dicas práticas",
      ];
    case "static_post":
      return ["Oferta direta", "Prova social", "Autoridade", "Lançamento", "Urgência"];
    case "stories":
      return ["Sequência", "Bastidores", "Pergunta", "Prova social", "Oferta rápida"];
    case "reel_cover":
      return ["Headline forte", "Antes e depois", "Erro grave", "Segredo", "Comparativo"];
    case "banner":
      return ["Headline comercial", "Campanha", "Oferta", "Lead magnet", "Conversão"];
    case "whatsapp":
      return ["Promoção local", "Cupom", "Comunicado", "Combo", "Chamada rápida"];
    default:
      return ["Oferta", "Autoridade", "Passo a passo", "Prova social", "Conversão"];
  }
}