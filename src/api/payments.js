const PAYMENTS_API_BASE_URL = import.meta.env?.VITE_PAYMENTS_API_BASE_URL ?? "http://localhost:2500/api";
async function paymentRequest(path, options = {}) {
    const response = await fetch(`${PAYMENTS_API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });
    if (!response.ok) {
        const body = await safeParseJSON(response);
        const detail = (body && (body.detail || body.message)) || `Erro HTTP ${response.status}`;
        throw new Error(detail);
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
async function safeParseJSON(response) {
    try {
        return await response.json();
    }
    catch {
        return null;
    }
}
export async function listSubscriptionPlans() {
    const response = await paymentRequest("/payments/plans");
    return response.data;
}
export async function createSubscriptionCheckout(payload) {
    const response = await paymentRequest("/payments/subscriptions", {
        method: "POST",
        body: JSON.stringify({
            plan_id: payload.planId,
            user: payload.user,
            back_urls: payload.backUrls,
        }),
    });
    return response.data;
}
export async function createSubscriptionPixCheckout(payload) {
    const response = await paymentRequest("/payments/subscriptions/pix", {
        method: "POST",
        body: JSON.stringify({
            plan_id: payload.planId,
            user: payload.user,
            document: payload.document,
        }),
    });
    return response.data;
}
export { PAYMENTS_API_BASE_URL };
