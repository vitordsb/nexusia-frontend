export type MessageRole = "user" | "assistant" | "system";

export type Message = {
  role: MessageRole;
  content: string;
  timestamp?: string;
};

export type ConversationSummary = {
  conversation_id: string;
  title: string | null;
  model: string;
  mode: "low" | "medium" | "high";
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
};

export type ConversationDetail = {
  conversation_id: string;
  user_id: string;
  title: string | null;
  model: string;
  mode: "low" | "medium" | "high";
  messages: Message[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateConversationPayload = {
  conversation_id: string;
  title?: string | null;
  model: string;
  mode: "low" | "medium" | "high";
};

export type ChatCompletionRequest = {
  model: string;
  messages: Message[];
  conversation_id: string;
  mode: "low" | "medium" | "high";
  stream?: boolean;
};

export type ChatChoice = {
  index: number;
  message: Message;
  finish_reason: string;
};

export type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_credits?: number;
  cost_brl?: number;
};

export type ChatCompletionResponse = {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: ChatChoice[];
  usage?: Usage;
};
