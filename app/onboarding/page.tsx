import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth/currentUser";
import { getProfile, isProfileComplete, creatorDisplayName } from "@/lib/profile/store";
import OnboardingWizard from "@/components/profile/OnboardingWizard";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/sign-in");

  const alreadyDone = await isProfileComplete(user.id);
  if (alreadyDone) redirect("/dashboard");

  const profile = await getProfile(user.id);
  const displayName = creatorDisplayName(user.name, user.email);

  return <OnboardingWizard initial={profile} displayName={displayName} />;
}
