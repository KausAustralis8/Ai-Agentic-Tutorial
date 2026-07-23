export type CapabilityId = "scrape" | "research" | "outreach" | "proposal" | "follow-up" | "book-meeting";

export interface Capability {
  id: CapabilityId;
  label: string;
  jobKind: string;
}

export const CAPABILITIES: Capability[] = [
  { id: "scrape", label: "Research", jobKind: "scrape" },
  { id: "research", label: "Brand brief", jobKind: "research" },
  { id: "outreach", label: "Initial outreach", jobKind: "outreach" },
  { id: "proposal", label: "Proposals", jobKind: "proposal" },
  { id: "follow-up", label: "Follow-ups", jobKind: "follow-up" },
  { id: "book-meeting", label: "Scheduling", jobKind: "book-meeting" },
];

export interface AgentType {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
  capabilities: CapabilityId[];
  goal: string;
  task: string;
  char: number;
}

export const AGENT_TYPES: AgentType[] = [
  {
    id: "discovery",
    name: "Remy Rivera",
    initials: "RR",
    role: "Research",
    color: "#b6d9fc",
    capabilities: ["scrape"],
    goal: "Find brands that fit your niche and sponsor creators like you.",
    task: "Scanning the web for new brand matches",
    char: 1,
  },
  {
    id: "outreach",
    name: "Otis Vance",
    initials: "OV",
    role: "Initial Outreach",
    color: "#027dea",
    capabilities: ["outreach"],
    goal: "Write the first pitch that gets a brand's attention.",
    task: "Drafting a pitch for a new brand",
    char: 2,
  },
  {
    id: "proposal",
    name: "Priya Shah",
    initials: "PS",
    role: "Proposal",
    color: "#269684",
    capabilities: ["proposal"],
    goal: "Turn interest into a scoped, priced deal.",
    task: "Building a proposal",
    char: 3,
  },
  {
    id: "followup",
    name: "Faye Cole",
    initials: "FC",
    role: "Follow-up",
    color: "#e46d4c",
    capabilities: ["follow-up"],
    goal: "Re-engage brands that have gone quiet.",
    task: "Following up with a quiet brand",
    char: 4,
  },
  {
    id: "scheduler",
    name: "Sam Okafor",
    initials: "SO",
    role: "Scheduler",
    color: "#d1e4fa",
    capabilities: ["book-meeting"],
    goal: "Get the call on the calendar.",
    task: "Booking a call",
    char: 5,
  },
];

export interface TeamTemplate {
  id: string;
  name: string;
  members: string[];
}

export const TEAM_TEMPLATES: TeamTemplate[] = [
  { id: "deal-team", name: "Deal Team", members: AGENT_TYPES.map((a) => a.id) },
];
