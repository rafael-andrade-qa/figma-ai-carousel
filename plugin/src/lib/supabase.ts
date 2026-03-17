import {
  createClient,
  type AuthChangeEvent,
  type Session,
} from "@supabase/supabase-js";

const SUPABASE_URL = "https://jhhmtmfpcmcyzlnaoilx.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_5_emVeYAb9L1wYr9YK_lrw_2M5xicMf";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("Supabase config ausente no frontend do plugin.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
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

  const { error } = await supabase.auth.signInWithOtp({
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

  const { data, error } = await supabase.auth.verifyOtp({
    email: normalizedEmail,
    token: normalizedToken,
    type: "email",
  });

  if (error || !data.session) {
    throw new Error(error?.message ?? "Não foi possível validar o código.");
  }

  return sessionToSnapshot(data.session);
}

export async function getCurrentSessionSnapshot(): Promise<AuthSessionSnapshot | null> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  if (!session) {
    return null;
  }

  return sessionToSnapshot(session);
}

export async function getAccessTokenOrThrow(): Promise<string> {
  const snapshot = await getCurrentSessionSnapshot();

  if (!snapshot?.accessToken) {
    throw new Error("Sessão não encontrada.");
  }

  return snapshot.accessToken;
}

export async function signOutSupabase() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
}

export function onSupabaseAuthStateChange(
  callback: (session: AuthSessionSnapshot | null) => void
) {
  const { data } = supabase.auth.onAuthStateChange(
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

  return data.subscription;
}