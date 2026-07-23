"use server";
import { currentUser } from "@/lib/auth/currentUser";
import { getDb, isDbConfigured } from "@/lib/db";
import { agents, agentConfig, agentStates, teams } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import type { CreateAgentInput, CreateTeamInput } from "./types";

function initialsFor(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "AG";
}

export async function createAgent(data: CreateAgentInput): Promise<string | undefined> {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(agents).values({
    userId: user.id,
    id,
    name: data.name,
    initials: initialsFor(data.name),
    role: data.role,
    color: data.color,
    status: "waiting",
    task: "Ready to get to work",
    goal: data.goal,
    type: "custom",
    capabilities: data.capabilities,
  });
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  return id;
}

export async function updateAgentIdentity(agentId: string, patch: { name?: string; role?: string; goal?: string }) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  const name = patch.name?.trim();
  const initials = name ? initialsFor(name) : undefined;
  await db
    .insert(agentConfig)
    .values({ userId: user.id, agentId, name, initials, role: patch.role, goal: patch.goal })
    .onConflictDoUpdate({
      target: [agentConfig.userId, agentConfig.agentId],
      set: { name, initials, role: patch.role, goal: patch.goal },
    });
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/dashboard");
}

export async function setAgentPaused(agentId: string, paused: boolean) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db
    .insert(agentStates)
    .values({ userId: user.id, agentId, paused, removed: false })
    .onConflictDoUpdate({ target: [agentStates.userId, agentStates.agentId], set: { paused } });
  revalidatePath("/agents");
  revalidatePath(`/agents/${agentId}`);
  revalidatePath("/dashboard");
}

export async function removeAgent(agentId: string) {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  await db
    .insert(agentStates)
    .values({ userId: user.id, agentId, removed: true, paused: false })
    .onConflictDoUpdate({ target: [agentStates.userId, agentStates.agentId], set: { removed: true } });
  revalidatePath("/agents");
  revalidatePath("/dashboard");
}

export async function createTeam(data: CreateTeamInput): Promise<string | undefined> {
  const user = await currentUser();
  if (!user || !isDbConfigured()) return;
  const db = getDb();
  const id = crypto.randomUUID();
  await db.insert(teams).values({
    userId: user.id,
    id,
    name: data.name,
    description: data.description,
    goal: data.goal,
    members: data.members,
    icon: "users",
    iconBg: "#663af3",
    template: "custom",
  });
  revalidatePath("/agents");
  revalidatePath("/dashboard");
  return id;
}
