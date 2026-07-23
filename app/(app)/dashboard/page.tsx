import { currentUser } from "@/lib/auth/currentUser";
import OrbitDashboard from "@/components/OrbitDashboard";
import { demoAgents, demoTeams, demoStats, demoActivity } from "@/lib/demoData";

export default async function DashboardPage() {
  const user = await currentUser();
  const first = (user?.name ?? "there").split(" ")[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <OrbitDashboard
      agents={demoAgents}
      teams={demoTeams}
      stats={demoStats}
      activity={demoActivity}
      greeting={`${greeting}, ${first}!`}
    />
  );
}
