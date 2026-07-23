import type { ResearchResult } from "@/lib/ai/research";

export type LeadStatus = "new" | "pitched" | "negotiating" | "replied" | "booked";
export type LeadReview = "pending" | "accepted";

export interface LeadView {
  id: string;
  agentId: string | null;
  name: string;
  title: string | null;
  company: string | null;
  email: string | null;
  status: LeadStatus;
  source: "manual" | "scrape";
  review: LeadReview;
  platform: string | null;
  research: ResearchResult | null;
  createdAt: string;
}

export interface AddLeadInput {
  name: string;
  company: string;
  email: string;
  platform: string;
  agentId: string | null;
}

export const STAGES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "pitched", label: "Pitched" },
  { id: "negotiating", label: "Negotiating" },
  { id: "replied", label: "Replied" },
  { id: "booked", label: "Booked" },
];
