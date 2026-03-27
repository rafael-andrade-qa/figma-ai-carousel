import type { PluginToUiMessage } from "../../../types/messages";

export function bindDashboardPluginMessages(handlers: {
  onStatus: (message: string) => void;
  onError: (message: string) => void;
  onSuccess: (message: string, creditsUsed?: number) => void;
}) {
  window.onmessage = (event: MessageEvent<{ pluginMessage?: PluginToUiMessage }>) => {
    const msg = event.data.pluginMessage;

    if (!msg) {
      return;
    }

    if (msg.type === "status") {
      handlers.onStatus(msg.message);
      return;
    }

    if (msg.type === "error") {
      handlers.onError(msg.message);
      return;
    }

    if (msg.type === "success") {
      handlers.onSuccess(msg.message, msg.creditsUsed);
    }
  };
}