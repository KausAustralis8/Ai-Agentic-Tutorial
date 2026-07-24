import { currentUser } from "@/lib/auth/currentUser";
import OrbitDashboard from "@/components/OrbitDashboard";
import { listAgents, listTeams } from "@/lib/agents/store";
import { computeWorkspaceStats } from "@/lib/workspace/stats";
import { listRecentActivity } from "@/lib/activity/store";

export default async function DashboardPage() {
  const user = await currentUser();
  const first = (user?.name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const agents = user ? await listAgents(user.id) : [];
  const teams = user ? await listTeams(user.id) : [];
  const stats = user ? await computeWorkspaceStats(user.id) : { activeAgents: 0, tasksRunning: 0, leadsWorked: 0, perAgent: [] };
  const recent = user ? await listRecentActivity(user.id, 5) : [];
  const activityItems = recent.map((r) => ({ agentId: r.agentId ?? "", text: r.text }));

  return (
    <OrbitDashboard
      agents={agents}
      teams={teams}
      stats={stats}
      activity={activityItems}
      greeting={`${greeting}, ${first}!`}
      livePoll
    />
  );
}
