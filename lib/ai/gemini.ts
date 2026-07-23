import "server-only";

const TIMEOUT_MS = 15000;

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

export interface Turn {
  role: "user" | "model";
  text: string;
}

interface CallOpts {
  maxTokens?: number;
  temperature?: number;
  responseSchema?: unknown;
}

async function callGemini(system: string, turns: Turn[], opts: CallOpts = {}): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const body = {
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((t) => ({ role: t.role === "model" ? "model" : "user", parts: [{ text: t.text }] })),
      generationConfig: {
        maxOutputTokens: opts.maxTokens ?? 700,
        temperature: opts.temperature ?? 0.6,
        thinkingConfig: { thinkingBudget: 0 },
        ...(opts.responseSchema ? { responseMimeType: "application/json", responseSchema: opts.responseSchema } : {}),
      },
    };

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Gemini request failed (${res.status})`);

    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts as { text?: string }[] | undefined;
    return (parts ?? []).map((p) => p.text ?? "").join("");
  } finally {
    clearTimeout(timeout);
  }
}

export async function geminiGenerate(system: string, turns: Turn[], opts?: { maxTokens?: number; temperature?: number }): Promise<string> {
  return callGemini(system, turns, opts);
}

export async function geminiJSON<T>(system: string, turns: Turn[], schema: unknown, opts?: { maxTokens?: number; temperature?: number }): Promise<T> {
  const text = await callGemini(system, turns, { ...opts, responseSchema: schema });
  return JSON.parse(text) as T;
}
