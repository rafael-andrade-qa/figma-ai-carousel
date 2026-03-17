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
  requestCredits,
  requestPurchaseCredits,
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
        try {
          const email = getState().user?.email;

          if (!email) {
            console.error("[UI] Usuário não encontrado para compra.");
            return;
          }

          const result = await requestPurchaseCredits({
            userEmail: email,
            packageId,
          });

          setCredits(result.credits);
          setScreen("dashboard");
          renderApp();
        } catch (error) {
          console.error("[UI] Erro ao comprar créditos:", error);
        }
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