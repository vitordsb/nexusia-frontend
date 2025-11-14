const MODEL_CREDIT_COST: Record<string, number> = {
  "gpt-5": 18,
  "gpt-5-pro": 28,
  "gpt-5-mini": 8,
  "claude-opus-4-1": 22,
  "claude-sonnet-4-5": 15,
  "claude-haiku-4-5": 6,
  "gemini-2-5-pro": 16,
  "gemini-2-5-flash": 7,
};

const MODEL_DISPLAY_NAME: Record<string, string> = {
  "gpt-5": "GPT‑5",
  "gpt-5-pro": "GPT‑5 Pro",
  "gpt-5-mini": "GPT‑5 Mini",
  "claude-opus-4-1": "Claude 4.1 Opus",
  "claude-sonnet-4-5": "Claude 4.5 Sonnet",
  "claude-haiku-4-5": "Claude 4.5 Haiku",
  "gemini-2-5-pro": "Gemini 2.5 Pro",
  "gemini-2-5-flash": "Gemini 2.5 Flash",
};

const DEFAULT_MODEL_COST = 10;

export function getModelCreditCost(model: string) {
  if (!model) return DEFAULT_MODEL_COST;
  return MODEL_CREDIT_COST[model] ?? DEFAULT_MODEL_COST;
}

export function getModelDisplayName(model: string) {
  if (!model) return "Modelo desconhecido";
  return MODEL_DISPLAY_NAME[model] ?? model.toUpperCase();
}

export const creditModelList = Object.entries(MODEL_CREDIT_COST).map(([model, cost]) => ({
  model,
  cost,
  label: getModelDisplayName(model),
}));
