import {
  GoTrueClient,
  type AuthChangeEvent,
  type Session,
  type SupportedStorage,
} from "@supabase/gotrue-js";
import { frontendEnv, validateFrontendEnv } from "../config/env";

validateFrontendEnv();

const SUPABASE_URL = frontendEnv.supabaseUrl;
const SUPABASE_PUBLISHABLE_KEY = frontendEnv.supabasePublishableKey;

function createMemoryStorage(): SupportedStorage {
  const store = new Map<string, string>();

  return {
    getItem(key: string) {
      return store.has(key) ? store.get(key)! : null;
    },
    setItem(key: string, value: string) {
      store.set(key, value);
    },
    removeItem(key: string) {
      store.delete(key);
    },
  };
}

function createSafeBrowserStorage(): SupportedStorage {
  const memoryStorage = createMemoryStorage();

  try {
    if (typeof window === "undefined" || !("localStorage" in window)) {
      return memoryStorage;
    }

    const testKey = "__figma_ai_ads_storage_test__";
    window.localStorage.setItem(testKey, "1");
    window.localStorage.removeItem(testKey);

    return {
      getItem(key: string) {
        try {
          return window.localStorage.getItem(key);
        } catch {
          return memoryStorage.getItem(key);
        }
      },
      setItem(key: string, value: string) {
        try {
          window.localStorage.setItem(key, value);
        } catch {
          memoryStorage.setItem(key, value);
        }
      },
      removeItem(key: string) {
        try {
          window.localStorage.removeItem(key);
        } catch {
          memoryStorage.removeItem(key);
        }
      },
    };
  } catch {
    return memoryStorage;
  }
}

const authStorage = createSafeBrowserStorage();

export const supabase = new GoTrueClient({
  url: `${SUPABASE_URL}/auth/v1`,
  headers: {
    apikey: SUPABASE_PUBLISHABLE_KEY,
  },
  autoRefreshToken: true,
  persistSession: true,
  detectSessionInUrl: false,
  storage: authStorage,
});

export type AuthSessionSnapshot = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number | null;
  email: string;
  authUserId: string;
};

export function sessionToSnapshot(session: Session): AuthSessionSnapshot {
  const email = session.user.email?.trim().toLowerCase();

  if (!email) {
    throw new Error("Sessão Supabase sem email.");
  }

  return {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    expiresAt: session.expires_at ?? null,
    email,
    authUserId: session.user.id,
  };
}

export async function requestEmailOtp(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email é obrigatório.");
  }

  const { error } = await supabase.signInWithOtp({
    email: normalizedEmail,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: undefined,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    email: normalizedEmail,
  };
}

export async function verifyEmailOtp(email: string, token: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedToken = token.trim();

  if (!normalizedEmail) {
    throw new Error("Email é obrigatório.");
  }

  if (!normalizedToken) {
    throw new Error("Código é obrigatório.");
  }

  const { data, error } = await supabase.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: "email",
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Não foi possível validar o código.");
  }

  return sessionToSnapshot(data.session);
}

export async function getCurrentSessionSnapshot() {
  const { data, error } = await supabase.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!data.session) {
    return null;
  }

  return sessionToSnapshot(data.session);
}

export async function getAccessTokenOrThrow() {
  const snapshot = await getCurrentSessionSnapshot();

  if (!snapshot?.accessToken) {
    throw new Error("Sessão não encontrada.");
  }

  return snapshot.accessToken;
}

export function onSupabaseAuthStateChange(
  callback: (session: AuthSessionSnapshot | null) => void
) {
  const {
    data: { subscription },
  } = supabase.onAuthStateChange(
    (_event: AuthChangeEvent, session: Session | null) => {
      if (!session) {
        callback(null);
        return;
      }

      try {
        callback(sessionToSnapshot(session));
      } catch (error) {
        console.error("[UI] Falha ao converter sessão do Supabase:", error);
      }
    }
  );

  return subscription;
}

export async function signOutSupabase() {
  const { error } = await supabase.signOut();

  if (error) {
    throw new Error(error.message);
  }
}