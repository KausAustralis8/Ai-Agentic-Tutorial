export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/currentUser";
import { exchangeCodeForTokens, fetchTikTokProfile, isTikTokConfigured } from "@/lib/social/tiktok";
import { encryptToken } from "@/lib/social/crypto";
import { getDb, isDbConfigured } from "@/lib/db";
import { socialAccounts, creatorProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { recordActivity } from "@/lib/activity/store";
import type { PlatformEntry } from "@/lib/profile/types";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const user = await currentUser();

  if (!user || !isTikTokConfigured() || !isDbConfigured() || !code) {
    return NextResponse.redirect(new URL("/profile?tiktok=error", req.url));
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    const profile = await fetchTikTokProfile(tokens.access_token);

    const db = getDb();
    const now = new Date();
    const snapshot = {
      followerCount: profile.follower_count,
      followingCount: profile.following_count,
      likesCount: profile.likes_count,
      videoCount: profile.video_count,
    };

    await db
      .insert(socialAccounts)
      .values({
        userId: user.id,
        provider: "tiktok",
        openId: profile.open_id,
        username: profile.username ?? null,
        displayName: profile.display_name,
        avatarUrl: profile.avatar_url,
        refreshToken: encryptToken(tokens.refresh_token),
        accessTokenExpiresAt: new Date(now.getTime() + tokens.expires_in * 1000),
        refreshTokenExpiresAt: new Date(now.getTime() + tokens.refresh_expires_in * 1000),
        scope: tokens.scope,
        snapshot,
        needsReconnect: false,
        connectedAt: now,
      })
      .onConflictDoUpdate({
        target: [socialAccounts.userId, socialAccounts.provider],
        set: {
          openId: profile.open_id,
          username: profile.username ?? null,
          displayName: profile.display_name,
          avatarUrl: profile.avatar_url,
          refreshToken: encryptToken(tokens.refresh_token),
          accessTokenExpiresAt: new Date(now.getTime() + tokens.expires_in * 1000),
          refreshTokenExpiresAt: new Date(now.getTime() + tokens.refresh_expires_in * 1000),
          scope: tokens.scope,
          snapshot,
          needsReconnect: false,
          connectedAt: now,
        },
      });

    const [existingProfile] = await db.select().from(creatorProfile).where(eq(creatorProfile.userId, user.id)).limit(1);
    const platforms = ((existingProfile?.platforms as PlatformEntry[] | null) ?? []).slice();
    const idx = platforms.findIndex((p) => p.platform.toLowerCase() === "tiktok");
    const tiktokPlatform: PlatformEntry = {
      platform: "TikTok",
      handle: profile.username ? `@${profile.username}` : profile.display_name,
      followers: String(profile.follower_count),
      engagementRate: idx >= 0 ? platforms[idx].engagementRate : "",
    };
    if (idx >= 0) platforms[idx] = tiktokPlatform;
    else platforms.push(tiktokPlatform);

    if (existingProfile) {
      await db.update(creatorProfile).set({ platforms, updatedAt: now }).where(eq(creatorProfile.userId, user.id));
    } else {
      await db.insert(creatorProfile).values({ userId: user.id, platforms, updatedAt: now });
    }

    await recordActivity({
      userId: user.id,
      agentId: null,
      type: "tiktok_connected",
      text: "connected TikTok and synced follower stats",
    });

    return NextResponse.redirect(new URL("/profile?tiktok=connected", req.url));
  } catch {
    return NextResponse.redirect(new URL("/profile?tiktok=error", req.url));
  }
}
