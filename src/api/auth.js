import { apiRequest } from "./client";
// Base da API de autenticação (Node). Pode ser sobrescrita via Vite .env
const AUTH_API_BASE_URL = import.meta.env?.VITE_AUTH_API_BASE_URL ?? "http://localhost:9000";
async function authRequest(path, options = {}) {
    const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {})
        }
    });
    if (!response.ok) {
        const errorBody = await safeParseJSON(response);
        const detail = (errorBody && (errorBody.detail || errorBody.message)) ||
            `Erro HTTP ${response.status}`;
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
export async function loginWithCredentials(email, password) {
    const data = await authRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
    });
    return data.user;
}
export async function registerUser(payload) {
    const data = await authRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload)
    });
    return data.user;
}
export async function requestAccessToken(userId) {
    const data = await apiRequest("/v1/auth/token", {
        method: "POST",
        body: JSON.stringify({ user_id: userId })
    });
    return data.access_token;
}
export async function fetchUserProfile(userId) {
    const data = await authRequest(`/auth/users/${userId}`, {
        method: "GET",
    });
    return data.user;
}
export async function requestPasswordReset(email) {
    return authRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email })
    });
}
export async function resetPassword(payload) {
    return authRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(payload)
    });
}
export { AUTH_API_BASE_URL };
