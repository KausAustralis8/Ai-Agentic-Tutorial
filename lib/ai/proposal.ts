import "server-only";
import { isGeminiConfigured, geminiJSON } from "./gemini";
import { PITCH_GUARDRAILS } from "./guardrails";
import type { ResearchResult } from "./research";

export interface ProposalResult {
  title: string;
  body: string;
  packages: string[];
}

const PROPOSAL_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    body: { type: "string" },
    packages: { type: "array", items: { type: "string" } },
  },
  required: ["title", "body", "packages"],
};

function fallback(leadName: string): ProposalResult {
  return {
    title: `Partnership proposal for ${leadName}`,
    body: "Thanks for the interest — here's a starting point for working together. Once my rates and package details are set, I'll tailor this further. (Fallback proposal — Gemini not configured.)",
    packages: [],
  };
}

interface LeadFacts {
  name: string;
  company: string | null;
  research?: ResearchResult | null;
}

export async function draftProposal(lead: LeadFacts, creatorContext: string, creatorName: string): Promise<ProposalResult> {
  if (!isGeminiConfigured()) return fallback(lead.name);

  const system = [
    `You ARE ${creatorName} — a real creator writing your OWN priced proposal. Write in first person: I / my / me.`,
    "Turn brand interest into a scoped, priced proposal grounded in the Media Kit below — especially the rate floor.",
    "There is no separate rate-card catalog — invent 2-4 deliverable packages that fit the creator's own real platforms, priced sensibly against the rate floor.",
    "Write a 150-250 word body with a soft next step. No hype, no emojis, no exclamation marks, no placeholder tokens like [Brand].",
    PITCH_GUARDRAILS,
    "",
    "CREATOR MEDIA KIT:",
    creatorContext,
    "",
    "Return ONLY JSON matching the schema: title, body, packages (2-4 short deliverable package names).",
  ].join("\n");

  const researchLine = lead.research
    ? `\nResearch brief: ${lead.research.summary} Priorities: ${lead.research.priorities.join(", ")}. Angle: ${lead.research.angle}`
    : "";

  const turns = [
    {
      role: "user" as const,
      text: `Brand: ${lead.name}${lead.company ? ` (${lead.company})` : ""}${researchLine}`,
    },
  ];

  try {
    const result = await geminiJSON<ProposalResult>(system, turns, PROPOSAL_SCHEMA, { maxTokens: 700, temperature: 0.6 });
    const fb = fallback(lead.name);
    return {
      title: result.title || fb.title,
      body: result.body || fb.body,
      packages: result.packages?.length ? result.packages : fb.packages,
    };
  } catch {
    return fallback(lead.name);
  }
}
