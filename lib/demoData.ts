import { AGENT_TYPES, TEAM_TEMPLATES } from "@/lib/agentTypes";
import type { OrbitAgent, OrbitTeam, OrbitStats, OrbitActivityItem } from "@/components/OrbitDashboard";

export const demoAgents: OrbitAgent[] = AGENT_TYPES.map((t) => ({
  id: t.id,
  name: t.name,
  initials: t.initials,
  color: t.color,
  status: "working",
  capabilities: t.capabilities,
}));

export const demoTeams: OrbitTeam[] = TEAM_TEMPLATES.map((t) => ({
  id: t.id,
  name: t.name,
  members: t.members,
}));

export const demoStats: OrbitStats = {
  activeAgents: 4,
  tasksRunning: 6,
  leadsWorked: 18,
  perAgent: [
    { agentId: "discovery", leadsWorked: 6 },
    { agentId: "outreach", leadsWorked: 5 },
    { agentId: "proposal", leadsWorked: 3 },
    { agentId: "followup", leadsWorked: 2 },
    { agentId: "scheduler", leadsWorked: 2 },
  ],
};

export const demoActivity: OrbitActivityItem[] = [
  { agentId: "scheduler", text: "booked a call with Glow Skincare for Thu 2pm" },
  { agentId: "outreach", text: "drafted a pitch for Acme Outdoors" },
  { agentId: "discovery", text: "found 3 new brand matches in your niche" },
  { agentId: "proposal", text: "sent a proposal to Bloom Coffee Co." },
];
