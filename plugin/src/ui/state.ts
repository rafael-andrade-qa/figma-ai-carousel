import type { AuthSessionSnapshot } from "../lib/supabase";
import type { CreativeFormat } from "./creativeFormats";

export type AppScreen =
  | "welcome"
  | "auth"
  | "creditsGranted"
  | "selectFormat"
  | "dashboard"
  | "paywall"
  | "transactions";

export type AppUser = {
  email: string;
  authUserId: string;
};

export type AppState = {
  currentScreen: AppScreen;
  user: AppUser | null;
  credits: number;
  pendingEmail: string | null;
  session: AuthSessionSnapshot | null;
  selectedFormat: CreativeFormat | null;
};

const STORAGE_KEY = "figma-ai-carousel-ui-state";

const defaultState: AppState = {
  currentScreen: "welcome",
  user: null,
  credits: 0,
  pendingEmail: null,
  session: null,
  selectedFormat: null,
};

let state: AppState = loadState();

function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return defaultState;
    }

    const parsed = JSON.parse(raw) as Partial<AppState>;

    return {
      ...defaultState,
      ...parsed,
      user: parsed.user ?? null,
      credits: typeof parsed.credits === "number" ? parsed.credits : 0,
      pendingEmail:
        typeof parsed.pendingEmail === "string" ? parsed.pendingEmail : null,
      session: parsed.session ?? null,
      selectedFormat:
        typeof parsed.selectedFormat === "string"
          ? (parsed.selectedFormat as CreativeFormat)
          : null,
    };
  } catch {
    return defaultState;
  }
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // noop
  }
}

export function getState(): AppState {
  return state;
}

export function setScreen(screen: AppScreen) {
  state = {
    ...state,
    currentScreen: screen,
  };
  persistState();
}

export function setPendingEmail(email: string | null) {
  state = {
    ...state,
    pendingEmail: email ? email.trim().toLowerCase() : null,
  };
  persistState();
}

export function setAuthenticatedSession(session: AuthSessionSnapshot) {
  state = {
    ...state,
    session,
    user: {
      email: session.email,
      authUserId: session.authUserId,
    },
    pendingEmail: null,
  };
  persistState();
}

export function clearAuthenticatedSession() {
  state = {
    ...state,
    session: null,
    user: null,
    credits: 0,
    pendingEmail: null,
    selectedFormat: null,
    currentScreen: "welcome",
  };
  persistState();
}

export function setCredits(credits: number) {
  state = {
    ...state,
    credits: Math.max(0, Math.floor(credits)),
  };
  persistState();
}

export function consumeCredits(amount: number) {
  state = {
    ...state,
    credits: Math.max(0, state.credits - Math.max(0, Math.floor(amount))),
  };
  persistState();
}

export function setSelectedFormat(format: CreativeFormat | null) {
  state = {
    ...state,
    selectedFormat: format,
  };
  persistState();
}