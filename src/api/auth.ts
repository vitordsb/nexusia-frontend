import { apiRequest } from "./client";

// Base da API de autenticação (Node). Pode ser sobrescrita via Vite .env
const AUTH_API_BASE_URL =
  (import.meta as any).env?.VITE_AUTH_API_BASE_URL ?? "http://localhost:9000";

type AuthUser = {
  id: string;
  email: string;
  username: string;
  createdAt: string;
  credits: number;
};

type LoginResponse = {
  user: AuthUser;
  nexusApi?: {
    keySyncedWithPassword: boolean;
  };
};

type RegisterPayload = {
  email: string;
  username: string;
  password: string;
};

type RegisterResponse = {
  user: AuthUser;
};

type TokenResponse = {
  access_token: string;
  token_type: string;
};

async function authRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${AUTH_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
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

export async function loginWithCredentials(email: string, password: string): Promise<AuthUser> {
  const data = await authRequest<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  return data.user;
}

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  const data = await authRequest<RegisterResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.user;
}

export async function requestAccessToken(userId: string) {
  const data = await apiRequest<TokenResponse>("/v1/auth/token", {
    method: "POST",
    body: JSON.stringify({ user_id: userId })
  });
  return data.access_token;
}

export async function fetchUserProfile(userId: string): Promise<AuthUser> {
  const data = await authRequest<{ user: AuthUser }>(`/auth/users/${userId}`, {
    method: "GET",
  });
  return data.user;
}

export type { AuthUser };
export { AUTH_API_BASE_URL };
