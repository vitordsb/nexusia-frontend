import { apiRequest } from "./client";
import type {
  ConversationSummary,
  ConversationDetail,
  CreateConversationPayload
} from "../types";

export function listConversations(token: string) {
  return apiRequest<ConversationSummary[]>("/v1/conversations", {
    method: "GET",
    token
  });
}

export function getConversation(token: string, conversationId: string) {
  return apiRequest<ConversationDetail>(`/v1/conversations/${conversationId}`, {
    method: "GET",
    token
  });
}

export function createConversation(
  token: string,
  payload: CreateConversationPayload
) {
  return apiRequest<ConversationDetail>("/v1/conversations", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}
