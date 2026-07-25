import { currentUser } from "@/lib/auth/currentUser";
import { getProfile } from "@/lib/profile/store";
import { isTikTokConfigured } from "@/lib/social/tiktok";
import { getSocialAccount } from "@/lib/social/store";
import ProfileEditor from "@/components/profile/ProfileEditor";

export default async function ProfilePage() {
  const user = await currentUser();
  const profile = user ? await getProfile(user.id) : undefined;
  const tiktokAvailable = isTikTokConfigured();
  const tiktokConnected = user && tiktokAvailable ? await getSocialAccount(user.id) : null;

  return (
    <ProfileEditor
      initial={profile ?? { niche: "", bio: "", platforms: [], audience: { age: "", geo: "", gender: "" }, tone: "", pastDeals: "", rateFloor: "" }}
      tiktokAvailable={tiktokAvailable}
      tiktokConnected={tiktokConnected}
    />
  );
}
