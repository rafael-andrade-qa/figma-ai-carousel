type FrontendEnv = {
  backendUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
};

declare global {
  interface Window {
    __FIGMA_AI_CAROUSEL_ENV__?: Partial<FrontendEnv>;
  }
}

function readRuntimeEnv(): Partial<FrontendEnv> {
  if (typeof window === "undefined") {
    return {};
  }

  return window.__FIGMA_AI_CAROUSEL_ENV__ ?? {};
}

const runtimeEnv = readRuntimeEnv();

const defaultEnv: FrontendEnv = {
  backendUrl: "http://localhost:3001",
  supabaseUrl: "https://jhhmtmfpcmcyzlnaoilx.supabase.co",
  supabasePublishableKey: "sb_publishable_5_emVeYAb9L1wYr9YK_lrw_2M5xicMf",
};

export const frontendEnv: FrontendEnv = {
  backendUrl: runtimeEnv.backendUrl ?? defaultEnv.backendUrl,
  supabaseUrl: runtimeEnv.supabaseUrl ?? defaultEnv.supabaseUrl,
  supabasePublishableKey:
    runtimeEnv.supabasePublishableKey ?? defaultEnv.supabasePublishableKey,
};

export function validateFrontendEnv() {
  if (!frontendEnv.backendUrl) {
    throw new Error("backendUrl ausente na configuração do frontend.");
  }

  if (!frontendEnv.supabaseUrl) {
    throw new Error("supabaseUrl ausente na configuração do frontend.");
  }

  if (!frontendEnv.supabasePublishableKey) {
    throw new Error(
      "supabasePublishableKey ausente na configuração do frontend."
    );
  }
}