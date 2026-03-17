import { bindAuthScreen, renderAuthScreen } from "./screens/auth";
import {
  bindCreditsGrantedScreen,
  renderCreditsGrantedScreen,
} from "./screens/creditsGranted";
import { bindDashboardScreen, renderDashboardScreen } from "./screens/dashboard";
import { bindPaywallScreen, renderPaywallScreen } from "./screens/paywall";
import {
  bindTransactionsScreen,
  renderTransactionsScreen,
} from "./screens/transactions";
import { bindWelcomeScreen, renderWelcomeScreen } from "./screens/welcome";
import {
  consumeCredits,
  getState,
  setCredits,
  setScreen,
  setUser,
} from "./state";
import {
  requestCreateCheckoutSession,
  requestCredits,
  requestTransactions,
} from "../api/backend";

import type { CreditTransaction } from "../api/backend";

function getRoot(): HTMLElement | null {
  return document.getElementById("app-root");
}

async function loadDashboardData(email: string) {
  const [creditsResult, transactionsResult] = await Promise.all([
    requestCredits(email),
    requestTransactions(email),
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

async function pollCreditsAfterCheckout(email: string, attempts = 8, delayMs = 2500) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const result = await requestCredits(email);

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

export async function renderApp() {
  const root = getRoot();
  const state = getState();

  if (!root) {
    console.error("[UI] #app-root não encontrado.");
    return;
  }

  if (state.currentScreen === "welcome") {
    root.innerHTML = renderWelcomeScreen();

    bindWelcomeScreen({
      onStart: () => {
        setScreen("auth");
        renderApp();
      },
      onLogin: () => {
        setScreen("auth");
        renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "auth") {
    root.innerHTML = renderAuthScreen();

    bindAuthScreen({
      onContinue: async (email) => {
        try {
          const hadUserBefore = !!getState().user;

          setUser(email);

          const result = await requestCredits(email);
          setCredits(result.credits);

          if (!hadUserBefore) {
            setScreen("creditsGranted");
          } else {
            setScreen("dashboard");
          }

          renderApp();
        } catch (error) {
          console.error("[UI] Erro ao buscar créditos:", error);
        }
      },
      onBack: () => {
        setScreen("welcome");
        renderApp();
      },
    });

    return;
  }

  if (state.currentScreen === "creditsGranted") {
    root.innerHTML = renderCreditsGrantedScreen(state.credits);

    bindCreditsGrantedScreen({
      onContinue: () => {
        setScreen("dashboard");
        renderApp();
      },
    });

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
        const email = getState().user?.email;

        if (!email) {
          console.error("[UI] Usuário não encontrado para compra.");
          throw new Error("Usuário não encontrado para compra.");
        }

        const previousCredits = getState().credits;

        const result = await requestCreateCheckoutSession({
          userEmail: email,
          packageId,
        });

        if (!result.checkoutUrl) {
          throw new Error("Checkout URL não foi retornada pelo backend.");
        }

        openExternalUrl(result.checkoutUrl);

        void pollCreditsAfterCheckout(email).then((pollResult) => {
          if (pollResult.updated || pollResult.credits > previousCredits) {
            setScreen("dashboard");
            renderApp();
          }
        });
      },
      onRefreshCredits: async () => {
        const email = getState().user?.email;

        if (!email) {
          console.error("[UI] Usuário não encontrado para atualizar créditos.");
          throw new Error("Usuário não encontrado para atualizar créditos.");
        }

        const result = await requestCredits(email);
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
    const email = state.user?.email ?? "";
    let transactions: CreditTransaction[] = [];

    if (email) {
      try {
        const transactionsResult = await requestTransactions(email);
        const creditsResult = await requestCredits(email);
        setCredits(creditsResult.credits);
        transactions = transactionsResult.transactions;
      } catch (error) {
        console.error("[UI] Erro ao carregar extrato:", error);
      }
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

  const email = state.user?.email ?? "";
  let transactions: CreditTransaction[] = [];

  if (email) {
    try {
      const dashboardData = await loadDashboardData(email);
      transactions = dashboardData.transactions;
    } catch (error) {
      console.error("[UI] Erro ao carregar dashboard:", error);
    }
  }

  const latestState = getState();

  root.innerHTML = renderDashboardScreen({
    credits: latestState.credits,
    email: latestState.user?.email ?? null,
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

      const currentEmail = getState().user?.email;

      if (currentEmail) {
        try {
          const dashboardData = await loadDashboardData(currentEmail);
          setCredits(dashboardData.credits);
          transactions = dashboardData.transactions;
        } catch (error) {
          console.error("[UI] Erro ao sincronizar dashboard:", error);
        }
      }

      const nextState = getState();
      if (nextState.credits <= 0) {
        setScreen("paywall");
      }

      renderApp();
    },
  });
}