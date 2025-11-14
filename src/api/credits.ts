import { AUTH_API_BASE_URL } from "./auth";

export type CreditHistoryEntry = {
  id: string;
  userId: string;
  direction: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  reference?: string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

type HistoryResponse = {
  userId: string;
  history: CreditHistoryEntry[];
};

type SimulateTopUpResponse = {
  userId: string;
  credits: number;
  transaction: CreditHistoryEntry;
};

async function creditsRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await safeParse(response);
    const detail =
      (body && (body.detail || body.message)) || `Erro HTTP ${response.status}`;
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeParse(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function fetchCreditHistory(userId: string, limit = 50) {
  const query = new URLSearchParams();
  if (Number.isFinite(limit)) {
    query.set("limit", `${limit}`);
  }
  const data = await creditsRequest<HistoryResponse>(
    `/auth/users/${userId}/credits/history?${query.toString()}`,
  );
  return data.history ?? [];
}

export async function simulateCreditTopUp(
  userId: string,
  payload: { amount: number; note?: string },
) {
  return creditsRequest<SimulateTopUpResponse>(`/auth/users/${userId}/credits/simulate`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
