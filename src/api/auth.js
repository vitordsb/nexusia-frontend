import { apiRequest } from "./client";
export async function generateToken(userId) {
    const data = await apiRequest("/v1/auth/token", {
        method: "POST",
        body: JSON.stringify({ user_id: userId })
    });
    console.log(data);
    return data.access_token;
}
