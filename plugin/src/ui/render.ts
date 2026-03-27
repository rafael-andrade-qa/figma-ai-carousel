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
import { showToast } from "./toast";
import { getAppRoot } from "./services/appRoot";
import {
  getOtpResendCooldownSeconds,
  resetOtpResendCooldown,
  startOtpResendCooldown,
} from "./services/otpCooldown";
import { syncSessionWithSupabase } from "./services/session";
import { loadDashboardData } from "./services/dashboardData";
import {
  openExternalUrl,
  pollCreditsAfterCheckout,
} from "./services/checkout";

export async function renderApp() {
  const root = getAppRoot();

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
      resendCooldownSeconds: getOtpResendCooldownSeconds(),
    });

    bindAuthScreen(
      {
        onRequestCode: async (email: string) => {
          try {
            await requestEmailOtp(email);
            startOtpResendCooldown();
            setPendingEmail(email);
            await renderApp();
          } catch (error) {
            console.error("[UI] Erro ao solicitar código OTP:", error);

            showToast({
              title: "Não foi possível enviar o código",
              message: "Confira seu email e tente novamente.",
              variant: "error",
            });
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

            setScreen("selectFormat");
            await renderApp();
          } catch (error) {
            console.error("[UI] Erro ao verificar OTP:", error);

            showToast({
              title: "Código inválido",
              message: "O código informado não é válido. Tente novamente.",
              variant: "error",
            });
          }
        },

        onResendCode: async () => {
          try {
            const email = getState().pendingEmail;

            if (!email) {
              return;
            }

            if (getOtpResendCooldownSeconds() > 0) {
              return;
            }

            await requestEmailOtp(email);
            startOtpResendCooldown();
            await renderApp();

            showToast({
              title: "Código reenviado",
              message: "Enviamos um novo código para o seu email.",
              variant: "success",
            });
          } catch (error) {
            console.error("[UI] Erro ao reenviar código OTP:", error);

            showToast({
              title: "Não foi possível reenviar",
              message: "Tente novamente em instantes.",
              variant: "error",
            });
          }
        },

        onChangeEmail: () => {
          resetOtpResendCooldown();
          setPendingEmail(null);
          void renderApp();
        },
      },
      {
        getResendCooldownSeconds: getOtpResendCooldownSeconds,
      }
    );

    return;
  }

  if (state.currentScreen === "creditsGranted") {
    root.innerHTML = renderCreditsGrantedScreen(state.credits);

    bindCreditsGrantedScreen({
      onContinue: () => {
        setScreen("selectFormat");
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
          showToast({
            title: "Em breve",
            message: "Esse formato ainda não está disponível.",
            variant: "info",
          });
          return;
        }

        setScreen("dashboard");
        await renderApp();
      },

      onContinue: async () => {
        const currentState = getState();
        const selectedFormat = currentState.selectedFormat;

        if (!selectedFormat) {
          return;
        }

        if (!isCreativeFormatAvailableNow(selectedFormat)) {
          showToast({
            title: "Em breve",
            message: "Esse formato ainda não está disponível.",
            variant: "info",
          });
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

  try {
    const accessToken = await getAccessTokenOrThrow();
    await loadDashboardData(accessToken);
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
  try {
    await syncSessionWithSupabase();
  } catch (error) {
    console.error("[UI] Erro ao sincronizar sessão com Supabase:", error);
    clearAuthenticatedSession();
  }

  const state = getState();

  if (state.session) {
    try {
      const accessToken = state.session.accessToken;
      const creditsResult = await requestCredits(accessToken);
      setCredits(creditsResult.credits);

      setScreen("selectFormat");
    } catch (error) {
      console.error("[UI] Erro ao restaurar sessão:", error);
      clearAuthenticatedSession();
      setScreen("auth");
    }
  } else {
    setScreen("welcome");
  }

  onSupabaseAuthStateChange((session) => {
    if (!session) {
      clearAuthenticatedSession();
      resetOtpResendCooldown();
      setScreen("welcome");
      void renderApp();
      return;
    }

    setAuthenticatedSession(session);
    setScreen("selectFormat");
    void renderApp();
  });

  await renderApp();
}

export async function logoutFromApp() {
  await signOutSupabase();
  clearAuthenticatedSession();
  resetOtpResendCooldown();
  setScreen("auth");
  await renderApp();
}