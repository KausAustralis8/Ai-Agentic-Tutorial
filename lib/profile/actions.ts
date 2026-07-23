"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type { CreatorProfileData } from "./types";

export async function saveProfile(data: CreatorProfileData) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  const values = {
    niche: data.niche,
    bio: data.bio,
    platforms: data.platforms,
    audience: data.audience,
    tone: data.tone,
    pastDeals: data.pastDeals,
    rateFloor: data.rateFloor,
    updatedAt: new Date(),
  };
  await db
    .insert(creatorProfile)
    .values({ userId: user.id, ...values })
    .onConflictDoUpdate({ target: creatorProfile.userId, set: values });

  revalidatePath("/profile");
  revalidatePath("/onboarding");
  revalidatePath("/dashboard");
}
