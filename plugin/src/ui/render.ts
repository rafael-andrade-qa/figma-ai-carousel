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
        renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "auth") {
    root.innerHTML = renderAuthScreen({
      pendingEmail: state.pendingEmail,
    });

    bindAuthScreen({
      onBack: () => {
        setPendingEmail(null);
        setScreen("welcome");
        renderApp();
      },
      onRequestCode: async (email) => {
        try {
          await requestEmailOtp(email);
          setPendingEmail(email);
          renderApp();
        } catch (error) {
          console.error("[UI] Erro ao solicitar OTP:", error);
          window.alert(
            error instanceof Error ? error.message : "Erro ao enviar código."
          );
        }
      },
      onVerifyCode: async (code) => {
        try {
          const email = getState().pendingEmail;

          if (!email) {
            throw new Error("Nenhum email pendente para validação.");
          }

          const hadUserBefore = Boolean(getState().user?.email);

          const session = await verifyEmailOtp(email, code);
          setAuthenticatedSession(session);

          const creditsResult = await requestCredits(session.accessToken);
          setCredits(creditsResult.credits);

          if (!hadUserBefore) {
            setScreen("creditsGranted");
          } else if (creditsResult.credits <= 0) {
            setScreen("paywall");
          } else {
            setScreen("dashboard");
          }

          renderApp();
        } catch (error) {
          console.error("[UI] Erro ao validar OTP:", error);
          window.alert(
            error instanceof Error ? error.message : "Erro ao validar código."
          );
        }
      },
      onChangeEmail: () => {
        setPendingEmail(null);
        renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "creditsGranted") {
    root.innerHTML = renderCreditsGrantedScreen(state.credits);

    bindCreditsGrantedScreen({
      onContinue: () => {
        setScreen(state.credits > 0 ? "dashboard" : "paywall");
        renderApp();
      },
    });

    return;
  }

  if (!state.session) {
    setScreen("auth");
    renderApp();
    return;
  }

  if (state.currentScreen === "paywall") {
    root.innerHTML = renderPaywallScreen(state.credits);

    bindPaywallScreen({
      onBack: () => {
        setScreen("dashboard");
        renderApp();
      },
      onBuy: async (packageId) => {
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
            renderApp();
          }
        });
      },
      onRefreshCredits: async () => {
        const accessToken = await getAccessTokenOrThrow();
        const result = await requestCredits(accessToken);

        setCredits(result.credits);

        if (result.credits > 0) {
          setScreen("dashboard");
        }

        renderApp();
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
        renderApp();
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
      renderApp();
    },
    onOpenTransactions: () => {
      setScreen("transactions");
      renderApp();
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

      renderApp();
    },
  });
}

export async function bootstrapApp() {
  await syncSessionWithSupabase();

  const state = getState();

  if (state.session) {
    if (state.credits > 0) {
      setScreen("dashboard");
    } else {
      setScreen("paywall");
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