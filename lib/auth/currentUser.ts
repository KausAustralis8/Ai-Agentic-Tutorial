import "server-only";
import { auth, currentUser as clerkCurrentUser } from "@clerk/nextjs/server";

export interface AppUser {
  id: string;
  email: string | null;
  name: string | null;
}

export async function currentUser(): Promise<AppUser | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const user = await clerkCurrentUser();
  return {
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress ?? null,
    name: user?.fullName ?? user?.firstName ?? null,
  };
}
