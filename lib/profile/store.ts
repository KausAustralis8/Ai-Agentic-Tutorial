import "server-only";
import { getDb, isDbConfigured } from "@/lib/db";
import { creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EMPTY_PROFILE, type Audience, type CreatorProfileData, type PlatformEntry } from "./types";

export async function getProfile(userId: string): Promise<CreatorProfileData> {
  if (!isDbConfigured()) return EMPTY_PROFILE;
  const db = getDb();
  const rows = await db.select().from(creatorProfile).where(eq(creatorProfile.userId, userId)).limit(1);
  const row = rows[0];
  if (!row) return EMPTY_PROFILE;
  return {
    niche: row.niche ?? "",
    bio: row.bio ?? "",
    platforms: (row.platforms as PlatformEntry[] | null) ?? [],
    audience: (row.audience as Audience | null) ?? { age: "", geo: "", gender: "" },
    tone: row.tone ?? "",
    pastDeals: row.pastDeals ?? "",
    rateFloor: row.rateFloor ?? "",
  };
}

export async function isProfileComplete(userId: string): Promise<boolean> {
  if (!isDbConfigured()) return true;
  const profile = await getProfile(userId);
  return Boolean(profile.niche.trim() && profile.platforms.some((p) => p.platform.trim()) && profile.rateFloor.trim());
}

export function profileSummary(profile: CreatorProfileData, displayName: string): string {
  const parts: string[] = [`Creator: ${displayName}`];
  if (profile.niche) parts.push(`Niche: ${profile.niche}`);
  if (profile.bio) parts.push(`Bio: ${profile.bio}`);
  if (profile.platforms.length) {
    const platformLines = profile.platforms
      .filter((p) => p.platform.trim())
      .map((p) => `${p.platform} @${p.handle || "?"} (${p.followers || "?"} followers, ${p.engagementRate || "?"} engagement)`)
      .join("; ");
    if (platformLines) parts.push(`Platforms: ${platformLines}`);
  }
  const { age, geo, gender } = profile.audience;
  const audienceBits = [age && `age ${age}`, geo && `location ${geo}`, gender && `gender ${gender}`].filter(Boolean).join(", ");
  if (audienceBits) parts.push(`Audience: ${audienceBits}`);
  if (profile.tone) parts.push(`Tone: ${profile.tone}`);
  if (profile.pastDeals) parts.push(`Past deals: ${profile.pastDeals}`);
  if (profile.rateFloor) parts.push(`Rate floor: ${profile.rateFloor}`);
  return parts.join("\n");
}

export function creatorDisplayName(name: string | null | undefined, email: string | null | undefined): string {
  return name || email || "the creator";
}
