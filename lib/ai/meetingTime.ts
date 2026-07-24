import "server-only";
import { isGeminiConfigured, geminiJSON } from "./gemini";

export interface ParsedMeeting {
  whenAt: string;
  whenLabel: string;
  brandName?: string;
}

const SCHEMA = {
  type: "object",
  properties: {
    whenAt: { type: "string" },
    whenLabel: { type: "string" },
    brandName: { type: "string" },
  },
  required: ["whenAt", "whenLabel"],
};

export async function parseMeetingTime(text: string, nowDescription: string): Promise<ParsedMeeting | null> {
  if (!isGeminiConfigured()) return null;

  const system = [
    `Right now it is ${nowDescription}.`,
    "Parse the user's scheduling request into a concrete date and time in the near future (assume the next matching day if a weekday is named without a date).",
    "If a brand or company name is mentioned, extract it as brandName (omit the field entirely if none is mentioned).",
    'Return ONLY JSON: whenAt in the exact format "YYYY-MM-DDTHH:mm:ss" (local time, 24-hour, no timezone letter), whenLabel (a short friendly label like "Tue, Jul 29 at 2:00 PM"), brandName (optional).',
  ].join("\n");

  const turns = [{ role: "user" as const, text }];

  try {
    const result = await geminiJSON<ParsedMeeting>(system, turns, SCHEMA, { maxTokens: 700, temperature: 0.2 });
    if (!result.whenAt || Number.isNaN(new Date(result.whenAt).getTime())) return null;
    return result;
  } catch {
    return null;
  }
}
