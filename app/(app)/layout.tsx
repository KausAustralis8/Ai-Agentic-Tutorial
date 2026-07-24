import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/currentUser";
import { ensureUserRow } from "@/lib/db/users";
import { isProfileComplete } from "@/lib/profile/store";
import { listRecentActivity } from "@/lib/activity/store";
import { listAgents } from "@/lib/agents/store";
import AppFrame from "@/components/AppFrame";

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (user) {
    await ensureUserRow(user.id, user.email, user.name);
    const done = await isProfileComplete(user.id);
    if (!done) redirect("/onboarding");
  }
  const displayName = user?.name ?? user?.email ?? "there";
  const notifications = user ? await listRecentActivity(user.id, 15) : [];
  const agents = user ? await listAgents(user.id) : [];

  return (
    <AppFrame userName={displayName} notifications={notifications} agents={agents}>
      {children}
    </AppFrame>
  );
}
