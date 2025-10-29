const API_BASE_URL = "http://127.0.0.1:8000";
export async function apiRequest(path, { token, headers, ...options } = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...headers
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
export { API_BASE_URL };
