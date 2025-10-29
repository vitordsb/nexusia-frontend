import { apiRequest } from "./client";
export function listConversations(token) {
    return apiRequest("/v1/conversations", {
        method: "GET",
        token
    });
}
export function getConversation(token, conversationId) {
    return apiRequest(`/v1/conversations/${conversationId}`, {
        method: "GET",
        token
    });
}
export function createConversation(token, payload) {
    return apiRequest("/v1/conversations", {
        method: "POST",
        token,
        body: JSON.stringify(payload)
    });
}
