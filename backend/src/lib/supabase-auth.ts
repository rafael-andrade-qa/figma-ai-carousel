import { supabaseAdmin } from "./supabase";

export type AuthenticatedAppUser = {
  appUserId: string;
  authUserId: string;
  email: string;
  credits: number;
};

type EnsureAuthenticatedUserRow = {
  out_user_id: string;
  out_auth_user_id: string;
  out_email: string;
  out_balance: number;
};

export type VerifiedAccessToken = {
  authUserId: string;
  email: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function verifyAccessToken(
  accessToken: string
): Promise<VerifiedAccessToken> {
  const token = accessToken.trim();

  if (!token) {
    throw new Error("AUTH_TOKEN_MISSING");
  }

  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) {
    throw new Error("AUTH_INVALID_TOKEN");
  }

  if (!user.email) {
    throw new Error("AUTH_EMAIL_NOT_AVAILABLE");
  }

  return {
    authUserId: user.id,
    email: normalizeEmail(user.email),
  };
}

export async function getOrCreateAuthenticatedAppUser(input: {
  authUserId: string;
  email: string;
}): Promise<AuthenticatedAppUser> {
  const { data, error } = await supabaseAdmin.rpc("ensure_authenticated_user", {
    p_auth_user_id: input.authUserId,
    p_email: normalizeEmail(input.email),
  });

  if (error) {
    throw new Error(
      `Erro ao garantir usuário autenticado no banco: ${error.message}`
    );
  }

  const row = (data?.[0] ?? null) as EnsureAuthenticatedUserRow | null;

  if (!row) {
    throw new Error("AUTH_USER_UPSERT_FAILED");
  }

  return {
    appUserId: row.out_user_id,
    authUserId: row.out_auth_user_id,
    email: row.out_email,
    credits: row.out_balance,
  };
}