import { currentUser } from "@/lib/auth/currentUser";
import { listAgents, listTeams } from "@/lib/agents/store";
import AgentsView from "@/components/agents/AgentsView";

export default async function AgentsPage() {
  const user = await currentUser();
  const agents = user ? await listAgents(user.id) : [];
  const teams = user ? await listTeams(user.id) : [];

  return <AgentsView agents={agents} teams={teams} />;
}
