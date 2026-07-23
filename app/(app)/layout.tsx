import { currentUser } from "@/lib/auth/currentUser";
import { ensureUserRow } from "@/lib/db/users";
import AppFrame from "@/components/AppFrame";

export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (user) {
    await ensureUserRow(user.id, user.email, user.name);
  }
  const displayName = user?.name ?? user?.email ?? "there";

  return <AppFrame userName={displayName}>{children}</AppFrame>;
}
