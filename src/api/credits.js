import { AUTH_API_BASE_URL } from "./auth";
async function creditsRequest(path, options = {}) {
    const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });
    if (!response.ok) {
        const body = await safeParse(response);
        const detail = (body && (body.detail || body.message)) || `Erro HTTP ${response.status}`;
        throw new Error(detail);
    }
    if (response.status === 204) {
        return undefined;
    }
    return (await response.json());
}
async function safeParse(response) {
    try {
        return await response.json();
    }
    catch {
        return null;
    }
}
export async function fetchCreditHistory(userId, limit = 50) {
    const query = new URLSearchParams();
    if (Number.isFinite(limit)) {
        query.set("limit", `${limit}`);
    }
    const data = await creditsRequest(`/auth/users/${userId}/credits/history?${query.toString()}`);
    return data.history ?? [];
}
export async function simulateCreditTopUp(userId, payload) {
    return creditsRequest(`/auth/users/${userId}/credits/simulate`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}
