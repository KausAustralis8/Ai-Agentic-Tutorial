import { currentUser } from "@/lib/auth/currentUser";
import { listMeetings } from "@/lib/meetings/store";
import { listAgents } from "@/lib/agents/store";
import CalendarView from "@/components/calendar/CalendarView";

export default async function CalendarPage() {
  const user = await currentUser();
  const meetings = user ? await listMeetings(user.id) : [];
  const agents = user ? await listAgents(user.id) : [];

  return <CalendarView meetings={meetings} agents={agents} />;
}
