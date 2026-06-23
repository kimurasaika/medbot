// ─── OpenRouter Configuration ───────────────────────────────────────────────
// Replace with your actual OpenRouter API key from https://openrouter.ai/keys
export const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
// meta-llama/llama-3.3-70b-instruct:free
// Model to use — swap freely here
export const MODEL = 'google/gemma-4-31b-it:free';

export const API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ─── App Defaults ────────────────────────────────────────────────────────────
// Default language: 'th' = Thai, 'en' = English
export const DEFAULT_LANG = 'th';

// ─── AI / Token Settings ─────────────────────────────────────────────────────
// Max tokens the AI can reply with per message (shorter = cheaper/faster)
export const MAX_TOKENS = 600;

// How creative the AI is (0 = predictable, 1 = more varied)
export const TEMPERATURE = 0.8;

// How many recent messages to keep in history sent to the API.
// Each "exchange" = 2 messages (student + patient).
// e.g. 12 = last 6 exchanges. Lower = fewer tokens per call.
export const HISTORY_KEEP_LAST = 12;
