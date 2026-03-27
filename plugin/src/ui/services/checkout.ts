import { getState, setCredits } from "../state";

import { requestCredits } from "../../api/backend";

export function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

export async function pollCreditsAfterCheckout(
  accessToken: string,
  attempts = 8,
  delayMs = 2500
) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await requestCredits(accessToken);

      if (result.credits > getState().credits) {
        setCredits(result.credits);

        return {
          updated: true,
          credits: result.credits,
        };
      }
    } catch (error) {
      console.error("[UI] Erro ao consultar créditos após checkout:", error);
    }

    await new Promise((resolve) => window.setTimeout(resolve, delayMs));
  }

  return {
    updated: false,
    credits: getState().credits,
  };
}