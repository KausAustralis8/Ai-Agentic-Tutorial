import type { CapabilityId } from "@/lib/agentTypes";

export type AgentStatus = "working" | "waiting" | "offline" | "error";

export interface AgentView {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  avatarUrl: string | null;
  status: AgentStatus;
  task: string;
  goal: string;
  capabilities: CapabilityId[];
  type: string;
  isPreset: boolean;
  paused: boolean;
}

export interface TeamView {
  id: string;
  name: string;
  description: string;
  goal: string;
  members: string[];
  isPreset: boolean;
}

export interface CreateAgentInput {
  name: string;
  role: string;
  goal: string;
  color: string;
  capabilities: CapabilityId[];
}

export interface CreateTeamInput {
  name: string;
  description: string;
  goal: string;
  members: string[];
}
