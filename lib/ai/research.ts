import "server-only";
import { isGeminiConfigured, geminiJSON } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";

export interface ResearchResult {
  summary: string;
  priorities: string[];
  hooks: string[];
  angle: string;
}

const RESEARCH_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    priorities: { type: "array", items: { type: "string" } },
    hooks: { type: "array", items: { type: "string" } },
    angle: { type: "string" },
  },
  required: ["summary", "priorities", "hooks", "angle"],
};

function fallback(leadName: string): ResearchResult {
  return {
    summary: `${leadName} looks like a brand worth pitching — add more details about them for a sharper brief (Gemini not configured).`,
    priorities: ["Brand awareness", "Authentic content", "Measurable reach"],
    hooks: ["Audience overlap with your niche", "Their recent campaigns", "Shared values or aesthetic"],
    angle: "Lead with a genuine reason you'd want to work together, backed by your real numbers.",
  };
}

interface LeadFacts {
  name: string;
  company: string | null;
  platform: string | null;
}

export async function draftResearch(lead: LeadFacts, creatorContext: string): Promise<ResearchResult> {
  if (!isGeminiConfigured()) return fallback(lead.name);

  const system = [
    "You are a sharp brand-partnerships researcher working for a content creator.",
    "Write a short, useful brief on a brand so the creator can pitch them well.",
    "Ground everything in the creator's real Media Kit below — reference their real niche and audience where it's relevant.",
    PITCH_GUARDRAILS,
    "",
    "CREATOR MEDIA KIT:",
    creatorContext,
    "",
    "Return ONLY JSON matching the schema: summary (2-3 sentences on what this brand likely cares about), priorities (3 short phrases), hooks (3 short, concrete pitch hooks), angle (1-2 sentences on the best angle to open with).",
  ].join("\n");

  const turns = [
    {
      role: "user" as const,
      text: `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}${lead.platform ? `\nPlatform: ${lead.platform}` : ""}`,
    },
  ];

  try {
    const result = await geminiJSON<ResearchResult>(system, turns, RESEARCH_SCHEMA, { maxTokens: 500, temperature: 0.6 });
    const fb = fallback(lead.name);
    return {
      summary: result.summary || fb.summary,
      priorities: result.priorities?.length ? result.priorities : fb.priorities,
      hooks: result.hooks?.length ? result.hooks : fb.hooks,
      angle: result.angle || fb.angle,
    };
  } catch {
    return fallback(lead.name);
  }
}
