import { currentUser } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/profile/store";
import ProfileEditor from "@/components/profile/ProfileEditor";

export default async function ProfilePage() {
  const user = await currentUser();
  const profile = user ? await getProfile(user.id) : undefined;

  return <ProfileEditor initial={profile ?? { niche: "", bio: "", platforms: [], audience: { age: "", geo: "", gender: "" }, tone: "", pastDeals: "", rateFloor: "" }} />;
}
