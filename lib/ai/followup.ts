import "server-only";
import { isGeminiConfigured, geminiJSON } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";

export interface FollowupResult {
  subject: string;
  body: string;
  rationale: string;
}

const FOLLOWUP_SCHEMA = {
  type: "object",
  properties: {
    subject: { type: "string" },
    body: { type: "string" },
    rationale: { type: "string" },
  },
  required: ["subject", "body", "rationale"],
};

function fallback(leadName: string): FollowupResult {
  return {
    subject: `Circling back, ${leadName}`,
    body: "Hi — just wanted to circle back on my last note. Still keen to explore working together whenever the timing works for you. Happy to answer any questions in the meantime. (Fallback follow-up — Gemini not configured.)",
    rationale: "Fallback follow-up (Gemini not configured).",
  };
}

interface LeadFacts {
  name: string;
  company: string | null;
}

interface PriorPitch {
  subject: string | null;
  body: string;
}

export async function draftFollowup(
  lead: LeadFacts,
  creatorContext: string,
  creatorName: string,
  priorPitch: PriorPitch | null
): Promise<FollowupResult> {
  if (!isGeminiConfigured()) return fallback(lead.name);

  const system = [
    `You ARE ${creatorName} — a real creator writing your OWN follow-up. Write in first person: I / my / me.`,
    "Write a short, polite, warm nudge re-engaging a brand that's gone quiet. 2-4 sentences. No hype, no emojis, no exclamation marks, no placeholder tokens like [Brand].",
    priorPitch
      ? "Build naturally on the prior message below without repeating it verbatim."
      : "There's no prior message on record, so write a warm, low-pressure opener instead.",
    PITCH_GUARDRAILS,
    "",
    "CREATOR MEDIA KIT:",
    creatorContext,
    "",
    "Return ONLY JSON matching the schema: subject, body, rationale (1 short sentence on your approach).",
  ].join("\n");

  const turns = [
    {
      role: "user" as const,
      text:
        `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}` +
        (priorPitch ? `\nPrior message subject: ${priorPitch.subject ?? "(DM)"}\nPrior message: ${priorPitch.body}` : ""),
    },
  ];

  try {
    const result = await geminiJSON<FollowupResult>(system, turns, FOLLOWUP_SCHEMA, { maxTokens: 900, temperature: 0.6 });
    const fb = fallback(lead.name);
    return {
      subject: result.subject || fb.subject,
      body: result.body || fb.body,
      rationale: result.rationale || fb.rationale,
    };
  } catch {
    return fallback(lead.name);
  }
}
