export type AppScreen =
  | "welcome"
  | "auth"
  | "creditsGranted"
  | "dashboard"
  | "paywall";

export interface AppUser {
  email: string;
}

export interface AppState {
  currentScreen: AppScreen;
  user: AppUser | null;
  credits: number;
  hasSeenWelcome: boolean;
}

const STORAGE_KEY = "figma-ai-carousel-ui-state";

const defaultState: AppState = {
  currentScreen: "welcome",
  user: null,
  credits: 0,
  hasSeenWelcome: false,
};

let state: AppState = loadState();

function loadState(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw) as Partial<AppState>;

    return {
      ...defaultState,
      ...parsed,
      user: parsed.user ?? null,
      credits: typeof parsed.credits === "number" ? parsed.credits : 0,
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

export function setUser(email: string) {
  state = {
    ...state,
    user: { email },
  };
  persistState();
}

export function grantFreeCredits(amount: number) {
  state = {
    ...state,
    credits: amount,
    hasSeenWelcome: true,
  };
  persistState();
}

export function addCredits(amount: number) {
  state = {
    ...state,
    credits: state.credits + amount,
  };
  persistState();
}

export function consumeCredits(amount: number) {
  state = {
    ...state,
    credits: Math.max(0, state.credits - amount),
  };
  persistState();
}

export function setCredits(amount: number) {
  state = {
    ...state,
    credits: Math.max(0, amount),
  };
  persistState();
}

export function markWelcomeSeen() {
  state = {
    ...state,
    hasSeenWelcome: true,
  };
  persistState();
}

export function resetSession() {
  state = {
    ...defaultState,
  };
  persistState();
}