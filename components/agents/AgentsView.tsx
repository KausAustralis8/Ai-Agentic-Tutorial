"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css, Box } from "@/components/primitives";
import { statusMeta } from "@/lib/data";
import { av } from "@/lib/visuals";
import { createAgent, createTeam } from "@/lib/agents/actions";
import { CAPABILITIES } from "@/lib/agentTypes";
import type { AgentView, TeamView } from "@/lib/agents/types";
import type { CapabilityId } from "@/lib/agentTypes";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillPrimary =
  "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4);padding:10px 22px;font-size:13.5px;border:none";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";
const pillGhost =
  "font-family:'Inter',sans-serif;font-weight:500;color:#c7d3ea;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:9px 18px;font-size:13px;box-shadow:inset 0 0 0 1px " +
  glassEdge;

const inputStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#ffffff",
  background: "rgba(186,214,247,.06)",
  border: "none",
  boxShadow: "inset 0 0 0 1px " + glassEdge,
  borderRadius: 10,
  padding: "10px 14px",
  outline: "none",
  width: "100%",
};

const SWATCHES = ["#663af3", "#027dea", "#269684", "#e46d4c", "#b6d9fc", "#7c5cf0", "#22b8a3", "#f4a13f"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={css("display:flex;flex-direction:column;gap:7px")}>
      <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#c7d3ea")}>{label}</div>
      {children}
    </div>
  );
}

function AgentCard({ agent, onOpen }: { agent: AgentView; onOpen: () => void }) {
  const m = statusMeta(agent.paused ? "offline" : agent.status);
  return (
    <Box
      onClick={onOpen}
      style={css(glassCard + ";padding:20px;display:flex;flex-direction:column;gap:12px;cursor:pointer;transition:transform .15s")}
      styleHover="transform:translateY(-2px)"
    >
      <div style={css("display:flex;align-items:center;gap:12px")}>
        <div style={css(av(agent, 44))}>{!agent.avatarUrl && agent.initials}</div>
        <div style={css("flex:1;min-width:0")}>
          <div style={css("font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:#ffffff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>
            {agent.name}
          </div>
          <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba")}>{agent.role}</div>
        </div>
        <div style={css("display:flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:500;color:" + m.color + ";background:" + m.bg + ";border-radius:999px;padding:3px 10px;flex:none")}>
          <span style={css("width:6px;height:6px;border-radius:50%;background:" + m.dot)} />
          {agent.paused ? "Paused" : m.label}
        </div>
      </div>
      <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#c7d3ea;line-height:1.5")}>{agent.goal || agent.task}</div>
      <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
        {agent.capabilities.map((cap) => {
          const label = CAPABILITIES.find((c) => c.id === cap)?.label ?? cap;
          return (
            <span key={cap} style={css("font-family:'Inter',sans-serif;font-size:11px;font-weight:500;color:#d1e4fa;background:rgba(186,214,247,.06);border-radius:6px;padding:3px 8px;box-shadow:inset 0 0 0 1px " + glassEdge)}>
              {label}
            </span>
          );
        })}
      </div>
    </Box>
  );
}

function NewAgentForm({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [goal, setGoal] = useState("");
  const [color, setColor] = useState(SWATCHES[0]);
  const [capabilities, setCapabilities] = useState<CapabilityId[]>([]);
  const [isPending, startTransition] = useTransition();

  const toggleCap = (id: CapabilityId) =>
    setCapabilities((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));

  const canSave = name.trim().length > 0 && role.trim().length > 0 && capabilities.length > 0;

  function handleCreate() {
    startTransition(async () => {
      await createAgent({ name, role, goal, color, capabilities });
      router.refresh();
      onClose();
    });
  }

  return (
    <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#d8ecf8")}>New agent</div>
      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px")}>
        <Field label="Name">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jordan Blake" />
        </Field>
        <Field label="Role label">
          <input style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Negotiator" />
        </Field>
      </div>
      <Field label="Goal">
        <input style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What is this agent responsible for?" />
      </Field>
      <Field label="What can it do?">
        <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
          {CAPABILITIES.map((cap) => (
            <Box
              key={cap.id}
              onClick={() => toggleCap(cap.id)}
              style={
                "font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;border-radius:999px;padding:7px 14px;cursor:pointer;transition:all .12s;" +
                (capabilities.includes(cap.id)
                  ? "background:rgba(102,58,243,.2);color:#ffffff;box-shadow:inset 0 0 0 1px rgba(102,58,243,.5)"
                  : "background:rgba(186,214,247,.06);color:#c7d3ea;box-shadow:inset 0 0 0 1px " + glassEdge)
              }
            >
              {cap.label}
            </Box>
          ))}
        </div>
      </Field>
      <Field label="Color">
        <div style={css("display:flex;gap:8px")}>
          {SWATCHES.map((sw) => (
            <Box
              key={sw}
              onClick={() => setColor(sw)}
              style={"width:26px;height:26px;border-radius:50%;cursor:pointer;background:" + sw + ";box-shadow:" + (color === sw ? "0 0 0 2px #05060f, 0 0 0 4px " + sw : "none")}
            />
          ))}
        </div>
      </Field>
      <div style={css("display:flex;gap:12px;justify-content:flex-end")}>
        <Box onClick={onClose} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
          Cancel
        </Box>
        <Box
          onClick={() => canSave && !isPending && handleCreate()}
          style={pillPrimary + (canSave && !isPending ? "" : ";opacity:.5;cursor:not-allowed")}
          styleHover={canSave && !isPending ? pillPrimaryHover : undefined}
        >
          {isPending ? "Creating…" : "Create agent"}
        </Box>
      </div>
    </div>
  );
}

function NewTeamForm({ agents, onClose }: { agents: AgentView[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [goal, setGoal] = useState("");
  const [members, setMembers] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const toggleMember = (id: string) => setMembers((prev) => (prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]));
  const canSave = name.trim().length > 0 && members.length > 0;

  function handleCreate() {
    startTransition(async () => {
      await createTeam({ name, description, goal, members });
      router.refresh();
      onClose();
    });
  }

  return (
    <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#d8ecf8")}>New team</div>
      <Field label="Name">
        <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Fitness Pod" />
      </Field>
      <Field label="Description">
        <input style={inputStyle} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What is this team for?" />
      </Field>
      <Field label="Goal">
        <input style={inputStyle} value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="What should this team be working toward?" />
      </Field>
      <Field label="Members">
        <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
          {agents.map((a) => (
            <Box
              key={a.id}
              onClick={() => toggleMember(a.id)}
              style={
                "display:flex;align-items:center;gap:6px;font-family:'Inter',sans-serif;font-size:12.5px;font-weight:500;border-radius:999px;padding:6px 12px 6px 6px;cursor:pointer;transition:all .12s;" +
                (members.includes(a.id)
                  ? "background:rgba(102,58,243,.2);color:#ffffff;box-shadow:inset 0 0 0 1px rgba(102,58,243,.5)"
                  : "background:rgba(186,214,247,.06);color:#c7d3ea;box-shadow:inset 0 0 0 1px " + glassEdge)
              }
            >
              <span style={css(av(a, 20))}>{!a.avatarUrl && a.initials}</span>
              {a.name}
            </Box>
          ))}
        </div>
      </Field>
      <div style={css("display:flex;gap:12px;justify-content:flex-end")}>
        <Box onClick={onClose} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
          Cancel
        </Box>
        <Box
          onClick={() => canSave && !isPending && handleCreate()}
          style={pillPrimary + (canSave && !isPending ? "" : ";opacity:.5;cursor:not-allowed")}
          styleHover={canSave && !isPending ? pillPrimaryHover : undefined}
        >
          {isPending ? "Creating…" : "Create team"}
        </Box>
      </div>
    </div>
  );
}

export default function AgentsView({ agents, teams }: { agents: AgentView[]; teams: TeamView[] }) {
  const router = useRouter();
  const [showNewAgent, setShowNewAgent] = useState(false);
  const [showNewTeam, setShowNewTeam] = useState(false);
  const byId = (id: string) => agents.find((a) => a.id === id);

  return (
    <div style={css("display:flex;flex-direction:column;gap:32px;max-width:960px")}>
      <div>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>Your AI team</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:14px;color:#9da7ba;margin-top:6px")}>
          Your ready-made Deal Team, plus any helpers you've built yourself.
        </div>
      </div>

      <div style={css("display:flex;flex-direction:column;gap:16px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between")}>
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#d8ecf8")}>Agents</div>
          {!showNewAgent && (
            <Box onClick={() => setShowNewAgent(true)} style={pillPrimary} styleHover={pillPrimaryHover}>
              + New agent
            </Box>
          )}
        </div>
        {showNewAgent && <NewAgentForm onClose={() => setShowNewAgent(false)} />}
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px")}>
          {agents.map((a) => (
            <AgentCard key={a.id} agent={a} onOpen={() => router.push("/agents/" + a.id)} />
          ))}
        </div>
      </div>

      <div style={css("display:flex;flex-direction:column;gap:16px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between")}>
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#d8ecf8")}>Teams</div>
          {!showNewTeam && (
            <Box onClick={() => setShowNewTeam(true)} style={pillPrimary} styleHover={pillPrimaryHover}>
              + New team
            </Box>
          )}
        </div>
        {showNewTeam && <NewTeamForm agents={agents} onClose={() => setShowNewTeam(false)} />}
        <div style={css("display:flex;flex-direction:column;gap:12px")}>
          {teams.map((t) => (
            <div key={t.id} style={css(glassCard + ";padding:20px;display:flex;flex-direction:column;gap:10px")}>
              <div style={css("display:flex;align-items:center;justify-content:space-between")}>
                <div style={css("font-family:'Inter',sans-serif;font-size:15px;font-weight:700;color:#ffffff")}>{t.name}</div>
                {t.isPreset && (
                  <span style={css("font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;color:#9da7ba")}>READY-MADE</span>
                )}
              </div>
              <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#c7d3ea")}>{t.description}</div>
              <div style={css("display:flex;gap:-6px")}>
                <div style={css("display:flex")}>
                  {t.members.map((id) => {
                    const a = byId(id);
                    if (!a) return null;
                    return (
                      <div key={id} title={a.name} style={css(av(a, 30) + ";border:2px solid #05060f;margin-left:-8px")}>
                        {!a.avatarUrl && a.initials}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
