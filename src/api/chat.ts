import { apiRequest } from "./client";
import type { ChatCompletionRequest, ChatCompletionResponse } from "../types";

export function sendChatCompletion(
  token: string,
  payload: ChatCompletionRequest
) {
  return apiRequest<ChatCompletionResponse>("/v1/chat/completions", {
    method: "POST",
    token,
    body: JSON.stringify(payload)
  });
}
