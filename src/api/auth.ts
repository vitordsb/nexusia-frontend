import { apiRequest } from "./client";

type TokenResponse = {
  access_token: string;
  token_type: string;
};

export async function generateToken(userId: string) {
  const data = await apiRequest<TokenResponse>("/v1/auth/token", {
    method: "POST",
    body: JSON.stringify({ user_id: userId })
  });
  console.log(data);
  return data.access_token;
}
