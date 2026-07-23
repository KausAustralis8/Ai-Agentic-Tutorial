"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css, Box } from "@/components/primitives";
import { statusMeta } from "@/lib/data";
import { av } from "@/lib/visuals";
import { updateAgentIdentity, setAgentPaused, removeAgent } from "@/lib/agents/actions";
import { CAPABILITIES } from "@/lib/agentTypes";
import type { AgentView } from "@/lib/agents/types";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillPrimary =
  "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4);padding:10px 22px;font-size:13.5px;border:none";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";
const pillGhost =
  "font-family:'Inter',sans-serif;font-weight:500;color:#c7d3ea;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:9px 18px;font-size:13px;box-shadow:inset 0 0 0 1px " +
  glassEdge;
const pillDanger =
  "font-family:'Inter',sans-serif;font-weight:500;color:#e46d4c;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:9px 18px;font-size:13px;box-shadow:inset 0 0 0 1px rgba(228,109,76,.35)";

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

export default function AgentDetail({ agent }: { agent: AgentView }) {
  const router = useRouter();
  const [name, setName] = useState(agent.name);
  const [role, setRole] = useState(agent.role);
  const [goal, setGoal] = useState(agent.goal);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [isPending, startTransition] = useTransition();
  const m = statusMeta(agent.paused ? "offline" : agent.status);
  const canSave = name.trim().length > 0;

  function handleSave() {
    if (!canSave) return;
    startTransition(async () => {
      await updateAgentIdentity(agent.id, { name, role, goal });
      router.refresh();
    });
  }
  function handlePauseToggle() {
    startTransition(async () => {
      await setAgentPaused(agent.id, !agent.paused);
      router.refresh();
    });
  }
  function handleRemove() {
    startTransition(async () => {
      await removeAgent(agent.id);
      router.push("/agents");
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:20px;max-width:600px")}>
      <Box onClick={() => router.push("/agents")} style="font-family:'Inter',sans-serif;font-size:13px;color:#9da7ba;cursor:pointer;width:fit-content" styleHover="color:#d1e4fa">
        &larr; Back to agents
      </Box>

      <div style={css(glassCard + ";padding:28px;display:flex;flex-direction:column;gap:20px")}>
        <div style={css("display:flex;align-items:center;gap:14px")}>
          <div style={css(av(agent, 56))}>{agent.initials}</div>
          <div style={css("flex:1")}>
            <input
              style={{ ...inputStyle, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 20, padding: "6px 10px" }}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Agent name"
            />
            <div style={css("display:flex;align-items:center;gap:6px;margin-top:8px")}>
              <span style={css("width:7px;height:7px;border-radius:50%;background:" + m.dot)} />
              <span style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba")}>{agent.paused ? "Paused" : m.label}</span>
              {agent.isPreset && <span style={css("font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.08em;color:#9da7ba;margin-left:6px")}>READY-MADE</span>}
            </div>
          </div>
        </div>

        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
          {agent.capabilities.map((cap) => {
            const label = CAPABILITIES.find((c) => c.id === cap)?.label ?? cap;
            return (
              <span key={cap} style={css("font-family:'Inter',sans-serif;font-size:11.5px;font-weight:500;color:#d1e4fa;background:rgba(186,214,247,.06);border-radius:6px;padding:4px 10px;box-shadow:inset 0 0 0 1px " + glassEdge)}>
                {label}
              </span>
            );
          })}
        </div>

        <div style={css("display:flex;flex-direction:column;gap:7px")}>
          <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#c7d3ea")}>Role label</div>
          <input style={inputStyle} value={role} onChange={(e) => setRole(e.target.value)} />
        </div>
        <div style={css("display:flex;flex-direction:column;gap:7px")}>
          <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#c7d3ea")}>Goal</div>
          <textarea
            style={{ ...inputStyle, minHeight: 80, resize: "vertical" as const, fontFamily: "Inter, sans-serif" }}
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        <div style={css("display:flex;gap:12px")}>
          <Box
            onClick={handleSave}
            style={pillPrimary + (isPending || !canSave ? ";opacity:.6;cursor:not-allowed" : "")}
            styleHover={isPending || !canSave ? undefined : pillPrimaryHover}
          >
            {isPending ? "Saving…" : "Save changes"}
          </Box>
          <Box onClick={handlePauseToggle} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
            {agent.paused ? "Resume agent" : "Pause agent"}
          </Box>
        </div>
      </div>

      <div style={css(glassCard + ";padding:20px;display:flex;align-items:center;justify-content:space-between")}>
        <div>
          <div style={css("font-family:'Inter',sans-serif;font-size:13.5px;font-weight:600;color:#ffffff")}>Remove this agent</div>
          <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba;margin-top:2px")}>
            Hides it from your team. You can always add a new one later.
          </div>
        </div>
        {confirmRemove ? (
          <div style={css("display:flex;gap:8px")}>
            <Box onClick={() => setConfirmRemove(false)} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
              Cancel
            </Box>
            <Box onClick={handleRemove} style={pillDanger} styleHover="background:rgba(228,109,76,.1)">
              Confirm remove
            </Box>
          </div>
        ) : (
          <Box onClick={() => setConfirmRemove(true)} style={pillDanger} styleHover="background:rgba(228,109,76,.1)">
            Remove
          </Box>
        )}
      </div>
    </div>
  );
}
