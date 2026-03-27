export type CreativeFormat =
  | "carousel"
  | "static_post"
  | "stories"
  | "reel_cover"
  | "banner"
  | "whatsapp";

type CreativeFormatDefinition = {
  id: CreativeFormat;
  label: string;
  badge: string;
  description: string;
  availableNow: boolean;
};

export type PromptSuggestion = {
  label: string;
  prompt: string;
};

export const CREATIVE_FORMATS: CreativeFormatDefinition[] = [
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
    description: "Peça única para oferta, autoridade e prova social.",
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

export function getCreativeFormatLabel(format: CreativeFormat): string {
  return CREATIVE_FORMATS.find((item) => item.id === format)?.label ?? "Carrossel";
}

export function isCreativeFormatAvailableNow(format: CreativeFormat): boolean {
  return CREATIVE_FORMATS.find((item) => item.id === format)?.availableNow ?? false;
}

export function getDashboardTitleByFormat(format: CreativeFormat): string {
  switch (format) {
    case "carousel":
      return "Crie carrosséis com IA dentro do Figma";
    case "static_post":
      return "Crie posts com IA dentro do Figma";
    case "stories":
      return "Crie stories com IA dentro do Figma";
    case "reel_cover":
      return "Crie capas de reels com IA dentro do Figma";
    case "banner":
      return "Crie banners com IA dentro do Figma";
    case "whatsapp":
      return "Crie artes para WhatsApp com IA dentro do Figma";
    default:
      return "Crie criativos com IA dentro do Figma";
  }
}

export function getDashboardSubtitleByFormat(format: CreativeFormat): string {
  switch (format) {
    case "carousel":
      return "Gere capa, conteúdo e CTA final com texto e imagem em poucos cliques.";
    case "static_post":
      return "Gere posts prontos para oferta, autoridade e prova social.";
    case "stories":
      return "Monte sequências rápidas e visuais para conversão e engajamento.";
    case "reel_cover":
      return "Crie capas mais fortes para aumentar clique e percepção de valor.";
    case "banner":
      return "Monte banners diretos para campanhas, landing pages e anúncios.";
    case "whatsapp":
      return "Crie peças rápidas para divulgação local e comunicação comercial.";
    default:
      return "Gere criativos com IA direto no canvas do arquivo atual.";
  }
}

export function getPromptPlaceholderByFormat(format: CreativeFormat): string {
  switch (format) {
    case "carousel":
      return "Ex.: Crie um carrossel para [seu tema aqui], explicando o problema, os erros mais comuns, a solução ideal e finalizando com uma CTA clara...";
    case "static_post":
      return "Ex.: Crie um post direto para [seu tema aqui], com gancho forte, promessa clara e CTA objetiva...";
    case "stories":
      return "Ex.: Crie uma sequência de stories sobre [seu tema aqui], com abertura forte, desenvolvimento curto e CTA final...";
    case "reel_cover":
      return "Ex.: Crie uma capa de reels sobre [seu tema aqui], com headline forte e foco em clique...";
    case "banner":
      return "Ex.: Crie um banner sobre [seu tema aqui], com oferta clara, benefício central e CTA...";
    case "whatsapp":
      return "Ex.: Crie uma arte para WhatsApp sobre [seu tema aqui], com comunicação rápida e foco em resposta...";
    default:
      return "Descreva o criativo que você quer gerar...";
  }
}

export function getPromptSuggestionsByFormat(format: CreativeFormat): PromptSuggestion[] {
  if (format !== "carousel") {
    return [
      {
        label: "Oferta direta",
        prompt:
          "Crie um criativo sobre [seu tema aqui] com foco em oferta direta. Estruture a mensagem para chamar atenção rápido, destacar o principal benefício, reduzir objeções e terminar com uma CTA simples e clara.",
      },
      {
        label: "Autoridade",
        prompt:
          "Crie um criativo sobre [seu tema aqui] com foco em autoridade. Organize a mensagem para mostrar domínio do assunto, gerar confiança e posicionar a marca como referência no tema.",
      },
      {
        label: "Prova social",
        prompt:
          "Crie um criativo sobre [seu tema aqui] com foco em prova social. Mostre sinais de confiança, resultados, percepções do mercado e termine com uma CTA objetiva.",
      },
      {
        label: "Objeções",
        prompt:
          "Crie um criativo sobre [seu tema aqui] quebrando as principais objeções que impedem a ação do público. Use linguagem clara, prática e persuasiva.",
      },
      {
        label: "Passo a passo",
        prompt:
          "Crie um criativo sobre [seu tema aqui] em formato passo a passo, ensinando de forma simples, didática e prática, finalizando com CTA.",
      },
    ];
  }

  return [
    {
      label: "Erros comuns",
      prompt:
        "Crie um carrossel para mídias sociais sobre [seu tema aqui] em formato de erros comuns. Estruture em 5 slides: 1) capa com gancho forte, 2) erro comum 1, 3) erro comum 2, 4) como corrigir ou qual é a abordagem certa, 5) CTA final. Use linguagem clara, estratégica, fácil de entender e pensada para gerar salvamentos.",
    },
    {
      label: "Passo a passo",
      prompt:
        "Crie um carrossel para mídias sociais sobre [seu tema aqui] em formato passo a passo. Estruture em 5 slides: 1) capa com promessa clara, 2) passo 1, 3) passo 2, 4) passo 3, 5) CTA final. O conteúdo deve ser prático, objetivo, fácil de escanear e com cara de post salvável.",
    },
    {
      label: "Mito ou verdade",
      prompt:
        "Crie um carrossel para mídias sociais sobre [seu tema aqui] em formato mito ou verdade. Estruture em 5 slides: 1) capa com gancho forte, 2) mito comum, 3) verdade por trás disso, 4) explicação prática ou implicação no mundo real, 5) CTA final. Use linguagem envolvente, clara e pensada para gerar curiosidade e compartilhamento.",
    },
    {
      label: "Estudo de caso",
      prompt:
        "Crie um carrossel para mídias sociais sobre [seu tema aqui] em formato estudo de caso. Estruture em 5 slides: 1) capa com contexto forte, 2) cenário ou problema inicial, 3) solução aplicada, 4) resultado ou aprendizado principal, 5) CTA final. O texto deve passar autoridade, clareza e percepção de resultado.",
    },
    {
      label: "Dicas práticas",
      prompt:
        "Crie um carrossel para mídias sociais sobre [seu tema aqui] em formato de dicas práticas. Estruture em 5 slides: 1) capa com promessa clara, 2) dica 1, 3) dica 2, 4) dica 3, 5) CTA final. Priorize linguagem simples, útil, escaneável e com forte potencial de salvamento.",
    },
  ];
}