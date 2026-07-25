export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/currentUser";
import { isTikTokConfigured, buildAuthorizeUrl } from "@/lib/social/tiktok";

export async function GET(req: Request) {
  const user = await currentUser();
  if (!user || !isTikTokConfigured()) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }
  return NextResponse.redirect(buildAuthorizeUrl(user.id));
}
