const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

type RequestOptions = RequestInit & {
  token?: string;
};

export async function apiRequest<T>(
  path: string,
  { token, headers, ...options }: RequestOptions = {}
): Promise<T> {
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
    const detail =
      (errorBody && (errorBody.detail || errorBody.message)) ||
      `Erro HTTP ${response.status}`;
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

export { API_BASE_URL };
