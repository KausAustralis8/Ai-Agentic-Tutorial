import { currentUser } from "@/lib/auth/currentUser";
import { listMessages } from "@/lib/chat/store";
import { listAgents } from "@/lib/agents/store";
import ChatView from "@/components/chat/ChatView";

export default async function ChatPage() {
  const user = await currentUser();
  const messages = user ? await listMessages(user.id) : [];
  const agents = user ? await listAgents(user.id) : [];

  return <ChatView initialMessages={messages} agents={agents} />;
}
