export interface DraftView {
  id: string;
  leadId: string;
  subject: string | null;
  body: string;
  rationale: string | null;
  status: "draft" | "sent";
  createdAt: string;
}
