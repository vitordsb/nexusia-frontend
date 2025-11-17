import { apiRequest } from "./client";
export function sendChatCompletion(token, payload) {
    return apiRequest("/v1/chat/completions", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
    });
}
