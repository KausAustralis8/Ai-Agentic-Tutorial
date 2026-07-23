import { notFound } from "next/navigation";
import { currentUser } from "@/lib/auth/currentUser";
import { getAgent } from "@/lib/agents/store";
import AgentDetail from "@/components/agents/AgentDetail";

export default async function AgentDetailPage({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) notFound();

  const agent = await getAgent(user.id, params.id);
  if (!agent) notFound();

  return <AgentDetail agent={agent} />;
}
