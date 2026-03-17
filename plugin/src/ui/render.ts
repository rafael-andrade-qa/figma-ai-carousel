import { bindAuthScreen, renderAuthScreen } from "./screens/auth";
import {
  bindCreditsGrantedScreen,
  renderCreditsGrantedScreen,
} from "./screens/creditsGranted";
import { bindDashboardScreen, renderDashboardScreen } from "./screens/dashboard";
import { bindPaywallScreen, renderPaywallScreen } from "./screens/paywall";
import { bindWelcomeScreen, renderWelcomeScreen } from "./screens/welcome";
import {
  consumeCredits,
  getState,
  setCredits,
  setScreen,
  setUser,
} from "./state";
import { requestCredits, requestPurchaseCredits } from "../api/backend";

function getRoot(): HTMLElement | null {
  return document.getElementById("app-root");
}

export function renderApp() {
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
          setUser(email);

          const result = await requestCredits(email);
          setCredits(result.credits);

          if (result.credits > 0 && !state.user) {
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

  root.innerHTML = renderDashboardScreen({
    credits: state.credits,
    email: state.user?.email ?? null,
  });

  bindDashboardScreen({
    credits: state.credits,
    email: state.user?.email ?? "",
    onOpenPaywall: () => {
      setScreen("paywall");
      renderApp();
    },
    onSuccessfulGeneration: async (creditsUsed) => {
      consumeCredits(creditsUsed);

      const email = getState().user?.email;

      if (email) {
        try {
          const result = await requestCredits(email);
          setCredits(result.credits);
        } catch (error) {
          console.error("[UI] Erro ao sincronizar créditos:", error);
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