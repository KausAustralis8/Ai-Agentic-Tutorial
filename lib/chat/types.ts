export interface ChatMessageView {
  id: number;
  agentId: string | null;
  who: "ai" | "me";
  text: string;
  createdAt: string;
}
