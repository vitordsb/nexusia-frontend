const PAYMENTS_API_BASE_URL =
  (import.meta as any).env?.VITE_PAYMENTS_API_BASE_URL ?? "http://localhost:2500/api";

export type SubscriptionPlan = {
  id: string;
  name: string;
  description?: string | null;
  price_brl: number;
  credits: number;
  currency_id: string;
  featured?: boolean;
};

type PlansResponse = {
  success: boolean;
  message: string;
  data: SubscriptionPlan[];
};

type SubscriptionUserPayload = {
  id: string;
  name: string;
  email: string;
};

export type SubscriptionCheckoutPayload = {
  planId: string;
  user: SubscriptionUserPayload;
  backUrls?: {
    success: string;
    pending: string;
    failure: string;
  };
};

export type PixSubscriptionPayload = {
  planId: string;
  user: SubscriptionUserPayload;
  document: {
    type: "CPF" | "CNPJ";
    number: string;
  };
};

type SubscriptionPreference = {
  preference_id: string;
  init_point: string;
  sandbox_init_point?: string | null;
  external_reference: string;
};

type SubscriptionPreferenceResponse = {
  success: boolean;
  message: string;
  data: {
    plan: SubscriptionPlan;
    preference: SubscriptionPreference;
  };
};

export type PixPaymentData = {
  payment_id: string;
  status: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount: number;
  transaction_data: {
    qr_code: string;
    qr_code_base64: string;
    ticket_url?: string;
    expires_at?: string;
  };
};

type PixSubscriptionResponse = {
  success: boolean;
  message: string;
  data: {
    plan: SubscriptionPlan;
    payment: PixPaymentData;
  };
};

async function paymentRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${PAYMENTS_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await safeParseJSON(response);
    const detail =
      (body && (body.detail || body.message)) || `Erro HTTP ${response.status}`;
    throw new Error(detail);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function safeParseJSON(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function listSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const response = await paymentRequest<PlansResponse>("/payments/plans");
  return response.data;
}

export async function createSubscriptionCheckout(
  payload: SubscriptionCheckoutPayload,
) {
  const response = await paymentRequest<SubscriptionPreferenceResponse>(
    "/payments/subscriptions",
    {
      method: "POST",
      body: JSON.stringify({
        plan_id: payload.planId,
        user: payload.user,
        back_urls: payload.backUrls,
      }),
    },
  );
  return response.data;
}

export async function createSubscriptionPixCheckout(
  payload: PixSubscriptionPayload,
) {
  const response = await paymentRequest<PixSubscriptionResponse>(
    "/payments/subscriptions/pix",
    {
      method: "POST",
      body: JSON.stringify({
        plan_id: payload.planId,
        user: payload.user,
        document: payload.document,
      }),
    },
  );
  return response.data;
}

export { PAYMENTS_API_BASE_URL };
