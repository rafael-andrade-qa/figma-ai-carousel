import {
  addCredits,
  consumeCredits,
  getState,
  grantFreeCredits,
  setScreen,
  setUser,
} from "./state";
import { bindAuthScreen, renderAuthScreen } from "./screens/auth";
import {
  bindCreditsGrantedScreen,
  renderCreditsGrantedScreen,
} from "./screens/creditsGranted";
import { bindDashboardScreen, renderDashboardScreen } from "./screens/dashboard";
import { bindPaywallScreen, renderPaywallScreen } from "./screens/paywall";
import { bindWelcomeScreen, renderWelcomeScreen } from "./screens/welcome";

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
      onContinue: (email) => {
        setUser(email);

        if (state.credits <= 0) {
          grantFreeCredits(5);
          setScreen("creditsGranted");
        } else {
          setScreen("dashboard");
        }

        renderApp();
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
      onBuy: (credits) => {
        addCredits(credits);
        setScreen("dashboard");
        renderApp();
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
    onSuccessfulGeneration: (creditsUsed) => {
      consumeCredits(creditsUsed);

      const nextState = getState();
      if (nextState.credits <= 0) {
        setScreen("paywall");
      }

      renderApp();
    },
  });
}