export interface MeetingView {
  id: string;
  leadId: string | null;
  agentId: string | null;
  title: string;
  kind: "call" | "shoot" | "deliverable";
  whenAt: string;
  whenLabel: string;
  createdAt: string;
}
