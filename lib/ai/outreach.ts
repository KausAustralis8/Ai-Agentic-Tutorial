import "server-only";
import { isGeminiConfigured, geminiJSON } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { ResearchResult } from "./research";

export interface OutreachResult {
  score: number;
  stage: "new" | "pitched" | "negotiating" | "replied" | "booked";
  subject: string;
  body: string;
  rationale: string;
}

const OUTREACH_SCHEMA = {
  type: "object",
  properties: {
    score: { type: "integer" },
    stage: { type: "string", enum: ["new", "pitched", "negotiating", "replied", "booked"] },
    subject: { type: "string" },
    body: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["score", "stage", "subject", "body", "rationale"],
};

function fallback(leadName: string, creatorName: string): OutreachResult {
  return {
    score: 58,
    stage: "pitched",
    subject: `Partnership idea for ${leadName}`,
    body: `Hi — I'm ${creatorName}, and I think there could be a great fit between what I make and what ${leadName} is doing. Would love to explore a partnership if you're open to it. (Fallback pitch — Gemini not configured.)`,
    rationale: "Fallback pitch (Gemini not configured).",
  };
}

interface LeadFacts {
  name: string;
  company: string | null;
  email: string | null;
  platform: string | null;
  research?: ResearchResult | null;
}

export async function draftOutreach(lead: LeadFacts, creatorContext: string, creatorName: string): Promise<OutreachResult> {
  if (!isGeminiConfigured()) return fallback(lead.name, creatorName);

  const hasEmail = !!lead.email;
  const system = [
    `You ARE ${creatorName} — a real creator writing your OWN outreach. Write in first person: I / my / me.`,
    "Score this brand's fit for a partnership from 0-100, and pick a pipeline stage (use 'pitched' once you've drafted this message).",
    hasEmail
      ? "Write a polished 90-140 word partnership EMAIL with a real salutation (e.g. 'Hi Maria,') and a sign-off with the creator's name."
      : "Write a short 2-4 sentence DM suited to their platform — no salutation or sign-off needed.",
    "No hype, no emojis, no exclamation marks, no placeholder tokens like [Brand].",
    PITCH_GUARDRAILS,
    "",
    "CREATOR MEDIA KIT:",
    creatorContext,
    "",
    "Return ONLY JSON matching the schema.",
  ].join("\n");

  const researchLine = lead.research
    ? `\nResearch brief: ${lead.research.summary} Hooks: ${lead.research.hooks.join(", ")}. Angle: ${lead.research.angle}`
    : "";

  const turns = [
    {
      role: "user" as const,
      text:
        `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}` +
        (hasEmail ? `\nEmail: ${lead.email}` : `\nPlatform: ${lead.platform ?? "unknown"}`) +
        researchLine,
    },
  ];

  try {
    const result = await geminiJSON<OutreachResult>(system, turns, OUTREACH_SCHEMA, { maxTokens: 1200, temperature: 0.6 });
    const fb = fallback(lead.name, creatorName);
    return {
      score: typeof result.score === "number" ? result.score : fb.score,
      stage: result.stage || fb.stage,
      subject: result.subject || fb.subject,
      body: result.body || fb.body,
      rationale: result.rationale || fb.rationale,
    };
  } catch {
    return fallback(lead.name, creatorName);
  }
}
