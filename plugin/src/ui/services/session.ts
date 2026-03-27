import {
  clearAuthenticatedSession,
  setAuthenticatedSession,
} from "../state";

import { getCurrentSessionSnapshot } from "../../lib/supabase";

export async function syncSessionWithSupabase() {
  const snapshot = await getCurrentSessionSnapshot();

  if (!snapshot) {
    clearAuthenticatedSession();
    return null;
  }

  setAuthenticatedSession(snapshot);
  return snapshot;
}