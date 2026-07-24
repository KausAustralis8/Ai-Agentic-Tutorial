import "server-only";
import { isGeminiConfigured, geminiJSON } from "@/lib/ai/gemini";
import type { BrandCandidate } from "./types";

export function isFirecrawlConfigured(): boolean {
  return !!process.env.FIRECRAWL_API_KEY;
}

const FALLBACK_BRANDS: BrandCandidate[] = [
  { name: "Glow Skincare", company: "Glow Skincare Co.", reason: "Example brand — connect a brand-discovery key to find real ones." },
  { name: "Acme Outdoors", company: "Acme Outdoors Inc.", reason: "Example brand — connect a brand-discovery key to find real ones." },
  { name: "Bloom Coffee Co.", company: "Bloom Coffee Co.", reason: "Example brand — connect a brand-discovery key to find real ones." },
];

const EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    brands: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          company: { type: "string" },
          reason: { type: "string" },
        },
        required: ["name"],
      },
    },
  },
  required: ["brands"],
};

interface SearchResult {
  title: string;
  description: string;
  url: string;
}

async function firecrawlSearch(query: string): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch("https://api.firecrawl.dev/v2/search", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, limit: 8 }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Firecrawl request failed (${res.status})`);
    const data = await res.json();
    const results = (data?.data ?? []) as { title?: string; description?: string; url?: string }[];
    return results.map((r) => ({ title: r.title ?? "", description: r.description ?? "", url: r.url ?? "" }));
  } finally {
    clearTimeout(timeout);
  }
}

export async function discoverBrands(niche: string): Promise<BrandCandidate[]> {
  if (!isFirecrawlConfigured()) return FALLBACK_BRANDS;

  try {
    const query = `brands that sponsor ${niche} content creators and influencers`;
    const results = await firecrawlSearch(query);
    if (results.length === 0) return FALLBACK_BRANDS;

    if (!isGeminiConfigured()) {
      return results.slice(0, 5).map((r) => ({ name: r.title || r.url, company: null, reason: r.description || null }));
    }

    const system = [
      "You extract real brand names from web search results for a content creator's brand-discovery tool.",
      "Only include actual company/brand names that could sponsor a creator — skip generic articles, listicles, or non-brand pages.",
      "Return ONLY JSON matching the schema: brands (up to 5), each with name, company (if different from name), and reason (1 short sentence on why this brand fits the niche).",
    ].join("\n");

    const turns = [
      {
        role: "user" as const,
        text: results.map((r, i) => `${i + 1}. ${r.title}\n${r.description}\n${r.url}`).join("\n\n"),
      },
    ];

    const extracted = await geminiJSON<{ brands: BrandCandidate[] }>(system, turns, EXTRACTION_SCHEMA, { maxTokens: 600, temperature: 0.4 });
    return extracted.brands?.length ? extracted.brands.slice(0, 5) : FALLBACK_BRANDS;
  } catch {
    return FALLBACK_BRANDS;
  }
}
