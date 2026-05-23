const API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY ?? '';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are a helpful AI assistant for the Sarajevo Expats app — a community platform for expats living in Sarajevo, Bosnia and Herzegovina.
You help users with questions about living in Sarajevo, local culture, places to visit, events, real estate, and expat life in general.
Keep your responses concise, friendly, and practical. If asked something unrelated to Sarajevo or expat life, you can still help but gently steer back to the app's context.`;

export interface GeminiMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendGeminiMessage(
  history: GeminiMessage[],
  newMessage: string,
): Promise<string> {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((m) => ({
      role: m.role === 'model' ? 'assistant' : 'user',
      content: m.text,
    })),
    { role: 'user', content: newMessage },
  ];

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error('[Groq] API error:', response.status, errText);
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? 'Sorry, I could not generate a response.';
}

/** Returns true if the message contains profanity/hate speech */
export async function moderateMessage(text: string): Promise<boolean> {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a content moderator. Respond with only "YES" if the message contains profanity, hate speech, or offensive language. Respond with only "NO" if it is clean.',
          },
          { role: 'user', content: `Message: "${text}"` },
        ],
        max_tokens: 5,
      }),
    });
    if (!response.ok) return false;
    const data = await response.json();
    const answer = (data?.choices?.[0]?.message?.content ?? '').trim().toUpperCase();
    return answer.startsWith('YES');
  } catch {
    return false; // moderation failed silently, allow message
  }
}
