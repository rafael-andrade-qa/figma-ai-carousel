import { requestCredits, requestTransactions } from "../../api/backend";

import { setCredits } from "../state";

export async function loadDashboardData(accessToken: string) {
  const [creditsResult, transactionsResult] = await Promise.all([
    requestCredits(accessToken),
    requestTransactions(accessToken),
  ]);

  setCredits(creditsResult.credits);

  return {
    credits: creditsResult.credits,
    transactions: transactionsResult.transactions,
  };
}