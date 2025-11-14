const MODEL_CREDIT_COST = {
    "gpt-5": 0,
    "gpt-5-pro": 0,
    "gpt-5-mini": 0,
    "claude-opus-4-1": 0,
    "claude-sonnet-4-5": 0,
    "claude-haiku-4-5": 0,
    "gemini-2-5-pro": 0,
    "gemini-2-5-flash": 0,
};
const MODEL_DISPLAY_NAME = {
    "gpt-5": "GPT‑5",
    "gpt-5-pro": "GPT‑5 Pro",
    "gpt-5-mini": "GPT‑5 Mini",
    "claude-opus-4-1": "Claude 4.1 Opus",
    "claude-sonnet-4-5": "Claude 4.5 Sonnet",
    "claude-haiku-4-5": "Claude 4.5 Haiku",
};
const DEFAULT_MODEL_COST = 10;
export function getModelCreditCost(model) {
    if (!model)
        return DEFAULT_MODEL_COST;
    return MODEL_CREDIT_COST[model] ?? DEFAULT_MODEL_COST;
}
export function getModelDisplayName(model) {
    if (!model)
        return "Modelo desconhecido";
    return MODEL_DISPLAY_NAME[model] ?? model.toUpperCase();
}
