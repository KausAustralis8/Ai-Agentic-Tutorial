import { currentUser } from "@/lib/auth/currentUser";
import OrbitDashboard from "@/components/OrbitDashboard";
import { listAgents, listTeams } from "@/lib/agents/store";
import { demoStats, demoActivity } from "@/lib/demoData";

export default async function DashboardPage() {
  const user = await currentUser();
  const first = (user?.name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const agents = user ? await listAgents(user.id) : [];
  const teams = user ? await listTeams(user.id) : [];

  return (
    <OrbitDashboard
      agents={agents}
      teams={teams}
      stats={demoStats}
      activity={demoActivity}
      greeting={`${greeting}, ${first}!`}
    />
  );
}
