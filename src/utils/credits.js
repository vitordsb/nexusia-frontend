const PRICING_TABLE = {
    "gpt-5": { input: 1, output: 5 },
    "gpt-5-pro": { input: 1, output: 5 },
    "gpt-5-mini": { input: 1, output: 2 },
    "claude-opus-4-1": { input: 10, output: 50 },
    "claude-sonnet-4-5": { input: 2, output: 10 },
    "claude-haiku-4-5": { input: 1, output: 3 },
    "gemini-2-5-pro": { input: 1, output: 5 },
    "gemini-2-5-flash": { input: 1, output: 1 },
};
const MODEL_DISPLAY_NAME = {
    "gpt-5": "GPT‑5",
    "gpt-5-pro": "GPT‑5 Pro",
    "gpt-5-mini": "GPT‑5 Mini",
    "claude-opus-4-1": "Claude 4.1 Opus",
    "claude-sonnet-4-5": "Claude 4.5 Sonnet",
    "claude-haiku-4-5": "Claude 4.5 Haiku",
    "gemini-2-5-pro": "Gemini 2.5 Pro",
    "gemini-2-5-flash": "Gemini 2.5 Flash",
};
const MODE_COMPLETION_TOKENS = {
    low: 1600,
    medium: 3600,
    high: 6400,
};
const DEFAULT_MODEL_COST = 25;
function normalizeModelName(model) {
    let normalized = model?.toLowerCase().trim() ?? "";
    if (normalized.startsWith("models/")) {
        normalized = normalized.split("/", 1)[1];
    }
    return normalized.replace(/\./g, "-");
}
function calculateCredits(model, promptTokens, completionTokens) {
    const normalized = normalizeModelName(model);
    const pricing = PRICING_TABLE[normalized];
    if (!pricing) {
        return DEFAULT_MODEL_COST;
    }
    const inputCost = (promptTokens / 100) * pricing.input;
    const outputCost = (completionTokens / 100) * pricing.output;
    return Math.max(1, Math.round(inputCost + outputCost));
}
export function getModelCreditCost(model, mode = "medium") {
    const completionTokens = MODE_COMPLETION_TOKENS[mode] ?? MODE_COMPLETION_TOKENS.medium;
    return calculateCredits(model, 0, completionTokens);
}
export function getModelDisplayName(model) {
    if (!model)
        return "Modelo desconhecido";
    return MODEL_DISPLAY_NAME[model] ?? model.toUpperCase();
}
export function estimateMinimumCredits(model, mode) {
    return getModelCreditCost(model, mode);
}
