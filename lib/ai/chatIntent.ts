import "server-only";
import { isGeminiConfigured, geminiJSON } from "./gemini";

export type ChatCapability = "scrape" | "research" | "outreach" | "proposal" | "follow-up" | "book-meeting" | "none";

export interface ChatIntent {
  capability: ChatCapability;
  brandName?: string;
  detail?: string;
}

const VALID_CAPABILITIES: ChatCapability[] = ["scrape", "research", "outreach", "proposal", "follow-up", "book-meeting", "none"];

const SCHEMA = {
  type: "object",
  properties: {
    capability: { type: "string", enum: VALID_CAPABILITIES },
    brandName: { type: "string" },
    detail: { type: "string" },
  },
  required: ["capability"],
};

function keywordFallback(message: string): ChatIntent {
  const t = message.toLowerCase();
  if (/\bbook|schedule|call at|meeting\b/.test(t)) return { capability: "book-meeting", detail: message };
  if (/\bfollow.?up|nudge|circl(e|ing) back\b/.test(t)) return { capability: "follow-up" };
  if (/\bpropos|quote|price|pricing\b/.test(t)) return { capability: "proposal" };
  if (/\bbrief|research|vet\b/.test(t)) return { capability: "research" };
  if (/\bpitch|outreach\b/.test(t)) return { capability: "outreach" };
  if (/\bfind|discover|brand\b/.test(t)) return { capability: "scrape", detail: message };
  return { capability: "none" };
}

export async function classifyIntent(message: string): Promise<ChatIntent> {
  if (!isGeminiConfigured()) return keywordFallback(message);

  const system = [
    "You classify a message sent in a group chat with an AI sales team into exactly one action.",
    "Capabilities: scrape (find/discover new brands), research (write a brief on a specific brand already being worked), outreach (write a first pitch to a brand), proposal (draft a priced proposal for a brand), follow-up (write a follow-up nudge for a brand that went quiet), book-meeting (book a brand call), none (small talk or anything else).",
    "If a specific brand or company name is mentioned, extract it as brandName.",
    "If there's other relevant free text — a niche for a brand search, or a time phrase for booking — extract it as detail.",
    "Return ONLY JSON matching the schema.",
  ].join("\n");

  const turns = [{ role: "user" as const, text: message }];

  try {
    const result = await geminiJSON<ChatIntent>(system, turns, SCHEMA, { maxTokens: 500, temperature: 0.2 });
    if (!VALID_CAPABILITIES.includes(result.capability)) return keywordFallback(message);
    return result;
  } catch {
    return keywordFallback(message);
  }
}
