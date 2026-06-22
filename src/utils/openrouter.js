import { OPENROUTER_API_KEY, MODEL, API_URL, MAX_TOKENS, TEMPERATURE, HISTORY_KEEP_LAST } from '../config';

function trimHistory(messages) {
  const system = messages.filter((m) => m.role === 'system');
  const convo = messages.filter((m) => m.role !== 'system');
  const trimmed = convo.length > HISTORY_KEEP_LAST ? convo.slice(-HISTORY_KEEP_LAST) : convo;
  return [...system, ...trimmed];
}

export async function sendMessage(messages) {
  if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY_HERE') {
    throw new Error('API_KEY_MISSING');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.origin,
      'X-Title': 'MedBot Medical Training',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: trimHistory(messages),
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData.error?.message || `HTTP ${response.status}`;
    // Tag provider-side errors so the UI can show a retry hint
    const isProviderError =
      response.status === 502 ||
      response.status === 503 ||
      msg.toLowerCase().includes('provider') ||
      msg.toLowerCase().includes('upstream');
    const err = new Error(msg);
    err.retryable = isProviderError;
    throw err;
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty response from provider — try again.');
  return content;
}
