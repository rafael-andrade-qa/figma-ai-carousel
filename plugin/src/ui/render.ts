import {
  type CreditTransaction,
  requestCreateCheckoutSession,
  requestCredits,
  requestTransactions,
} from "../api/backend";
import {
  clearAuthenticatedSession,
  consumeCredits,
  getState,
  setAuthenticatedSession,
  setCredits,
  setPendingEmail,
  setScreen,
  setSelectedFormat,
} from "./state";
import {
  getAccessTokenOrThrow,
  getCurrentSessionSnapshot,
  onSupabaseAuthStateChange,
  requestEmailOtp,
  signOutSupabase,
  verifyEmailOtp,
} from "../lib/supabase";

import { bindAuthScreen, renderAuthScreen } from "./screens/auth";
import {
  bindCreditsGrantedScreen,
  renderCreditsGrantedScreen,
} from "./screens/creditsGranted";
import {
  bindDashboardScreen,
  renderDashboardScreen,
} from "./screens/dashboard";
import { bindPaywallScreen, renderPaywallScreen } from "./screens/paywall";
import {
  bindTransactionsScreen,
  renderTransactionsScreen,
} from "./screens/transactions";
import { bindWelcomeScreen, renderWelcomeScreen } from "./screens/welcome";
import {
  bindSelectFormatScreen,
  renderSelectFormatScreen,
} from "./screens/selectFormat";

import { isCreativeFormatAvailableNow } from "./creativeFormats";

function getRoot() {
  return document.getElementById("app-root");
}

async function loadDashboardData(accessToken: string) {
  const [creditsResult, transactionsResult] = await Promise.all([
    requestCredits(accessToken),
    requestTransactions(accessToken),
  ]);

  setCredits(creditsResult.credits);

  return {
    credits: creditsResult.credits,
    transactions: transactionsResult.transactions,
  };
}

function openExternalUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}

async function pollCreditsAfterCheckout(
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

export async function syncSessionWithSupabase() {
  const snapshot = await getCurrentSessionSnapshot();

  if (!snapshot) {
    clearAuthenticatedSession();
    return null;
  }

  setAuthenticatedSession(snapshot);
  return snapshot;
}

export async function renderApp() {
  const root = getRoot();

  if (!root) {
    return;
  }

  const state = getState();

  if (state.currentScreen === "welcome") {
    root.innerHTML = renderWelcomeScreen();

    bindWelcomeScreen({
      onStart: () => {
        setScreen("auth");
        void renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "auth") {
    root.innerHTML = renderAuthScreen({
      email: state.pendingEmail,
    });

    bindAuthScreen({
      onRequestCode: async (email: string) => {
        try {
          await requestEmailOtp(email);
          setPendingEmail(email);
          await renderApp();
        } catch (error) {
          console.error("[UI] Erro ao solicitar código OTP:", error);
        }
      },

      onVerifyCode: async (code: string) => {
        try {
          const email = getState().pendingEmail;

          if (!email) {
            return;
          }

          const session = await verifyEmailOtp(email, code);

          setAuthenticatedSession(session);

          const creditsResult = await requestCredits(session.accessToken);
          setCredits(creditsResult.credits);

          if (creditsResult.credits > 0) {
            setScreen("selectFormat");
          } else {
            setScreen("paywall");
          }

          await renderApp();
        } catch (error) {
          console.error("[UI] Erro ao verificar OTP:", error);
        }
      },

      onResendCode: async () => {
        try {
          const email = getState().pendingEmail;

          if (!email) {
            return;
          }

          await requestEmailOtp(email);
        } catch (error) {
          console.error("[UI] Erro ao reenviar código OTP:", error);
        }
      },

      onChangeEmail: () => {
        setPendingEmail(null);
        void renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "creditsGranted") {
    root.innerHTML = renderCreditsGrantedScreen(state.credits);

    bindCreditsGrantedScreen({
      onContinue: () => {
        if (state.credits > 0) {
          setScreen("selectFormat");
        } else {
          setScreen("paywall");
        }

        void renderApp();
      },
    });

    return;
  }

  if (!state.session) {
    setScreen("auth");
    await renderApp();
    return;
  }

  if (state.currentScreen === "selectFormat") {
    root.innerHTML = renderSelectFormatScreen(state.selectedFormat);

    bindSelectFormatScreen({
      onSelectFormat: async (format) => {
        setSelectedFormat(format);

        if (!isCreativeFormatAvailableNow(format)) {
          window.alert("Esse formato entra em breve 🚀");
        }

        await renderApp();
      },

      onContinue: async () => {
        const currentState = getState();
        const selectedFormat = currentState.selectedFormat ?? "carousel";

        if (!isCreativeFormatAvailableNow(selectedFormat)) {
          window.alert("Esse formato ainda não está disponível. Use Carrossel por enquanto.");
          return;
        }

        setScreen("dashboard");
        await renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "paywall") {
    root.innerHTML = renderPaywallScreen(state.credits);

    bindPaywallScreen({
      onBack: () => {
        setScreen("dashboard");
        void renderApp();
      },

      onBuy: async (packageId) => {
        try {
          const accessToken = await getAccessTokenOrThrow();
          const previousCredits = getState().credits;

          const result = await requestCreateCheckoutSession({
            accessToken,
            packageId,
          });

          if (!result.checkoutUrl) {
            throw new Error("Checkout URL não foi retornada pelo backend.");
          }

          openExternalUrl(result.checkoutUrl);

          void pollCreditsAfterCheckout(accessToken).then((pollResult) => {
            if (pollResult.updated || pollResult.credits > previousCredits) {
              setScreen("dashboard");
              void renderApp();
            }
          });
        } catch (error) {
          console.error("[UI] Erro ao iniciar checkout:", error);
        }
      },

      onRefreshCredits: async () => {
        try {
          const accessToken = await getAccessTokenOrThrow();
          const result = await requestCredits(accessToken);

          setCredits(result.credits);

          if (result.credits > 0) {
            setScreen("dashboard");
          }

          await renderApp();
        } catch (error) {
          console.error("[UI] Erro ao atualizar créditos:", error);
        }
      },
    });

    return;
  }

  if (state.currentScreen === "transactions") {
    let transactions: CreditTransaction[] = [];

    try {
      const accessToken = await getAccessTokenOrThrow();
      const transactionsResult = await requestTransactions(accessToken);
      const creditsResult = await requestCredits(accessToken);

      setCredits(creditsResult.credits);
      transactions = transactionsResult.transactions;
    } catch (error) {
      console.error("[UI] Erro ao carregar extrato:", error);
    }

    const latestState = getState();

    root.innerHTML = renderTransactionsScreen({
      credits: latestState.credits,
      transactions,
    });

    bindTransactionsScreen({
      onBack: () => {
        setScreen("dashboard");
        void renderApp();
      },
    });

    return;
  }

  let transactions: CreditTransaction[] = [];

  try {
    const accessToken = await getAccessTokenOrThrow();
    const dashboardData = await loadDashboardData(accessToken);
    transactions = dashboardData.transactions;
  } catch (error) {
    console.error("[UI] Erro ao carregar dashboard:", error);
  }

  const latestState = getState();

  root.innerHTML = renderDashboardScreen({
    credits: latestState.credits,
    email: latestState.user?.email ?? "",
  });

  bindDashboardScreen({
    credits: latestState.credits,
    email: latestState.user?.email ?? "",
    onOpenPaywall: () => {
      setScreen("paywall");
      void renderApp();
    },
    onOpenTransactions: () => {
      setScreen("transactions");
      void renderApp();
    },
    onChangeFormat: () => {
      setScreen("selectFormat");
      void renderApp();
    },
    onSuccessfulGeneration: async (creditsUsed) => {
      consumeCredits(creditsUsed);

      try {
        const accessToken = await getAccessTokenOrThrow();
        const dashboardData = await loadDashboardData(accessToken);
        setCredits(dashboardData.credits);
        transactions = dashboardData.transactions;
      } catch (error) {
        console.error("[UI] Erro ao sincronizar dashboard:", error);
      }

      const nextState = getState();

      if (nextState.credits <= 0) {
        setScreen("paywall");
      }

      await renderApp();
    },
  });
}

export async function bootstrapApp() {
  await syncSessionWithSupabase();

  const state = getState();

  if (state.session) {
    try {
      const accessToken = state.session.accessToken;
      const creditsResult = await requestCredits(accessToken);
      setCredits(creditsResult.credits);

      if (creditsResult.credits > 0) {
        setScreen("selectFormat");
      } else {
        setScreen("paywall");
      }
    } catch (error) {
      console.error("[UI] Erro ao restaurar sessão:", error);
      setScreen("auth");
    }
  } else {
    setScreen("welcome");
  }

  onSupabaseAuthStateChange((session) => {
    if (!session) {
      clearAuthenticatedSession();
      setScreen("welcome");
      void renderApp();
      return;
    }

    setAuthenticatedSession(session);

    if (getState().credits > 0) {
      setScreen("selectFormat");
    } else {
      setScreen("paywall");
    }

    void renderApp();
  });

  await renderApp();
}

export async function logoutFromApp() {
  await signOutSupabase();
  clearAuthenticatedSession();
  setScreen("auth");
  await renderApp();
}