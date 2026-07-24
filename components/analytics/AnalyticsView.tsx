"use client";
import { css, Box } from "@/components/primitives";
import { av } from "@/lib/visuals";
import type { WorkspaceStats, DayCount } from "@/lib/workspace/stats";
import type { AgentView } from "@/lib/agents/types";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";

function KpiTile({ label, value }: { label: string; value: number }) {
  return (
    <div style={css(glassCard + ";padding:20px;display:flex;flex-direction:column;gap:6px")}>
      <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:28px;color:#d8ecf8")}>{value}</div>
      <div style={css("font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.06em;color:#9da7ba;text-transform:uppercase")}>{label}</div>
    </div>
  );
}

export default function AnalyticsView({
  stats,
  perDay,
  agents,
  pitchesDrafted,
  proposalsDrafted,
  callsBooked,
}: {
  stats: WorkspaceStats;
  perDay: DayCount[];
  agents: AgentView[];
  pitchesDrafted: number;
  proposalsDrafted: number;
  callsBooked: number;
}) {
  const maxDay = Math.max(1, ...perDay.map((d) => d.count));
  const ranking = [...stats.perAgent]
    .map((p) => ({ ...p, agent: agents.find((a) => a.id === p.agentId) }))
    .filter((p) => p.agent)
    .sort((a, b) => b.leadsWorked - a.leadsWorked);
  const maxRank = Math.max(1, ...ranking.map((r) => r.leadsWorked));

  return (
    <div style={css("display:flex;flex-direction:column;gap:28px;max-width:920px")}>
      <div>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>Analytics</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:14px;color:#9da7ba;margin-top:6px")}>Your real results, from the raw activity log.</div>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px")}>
        <KpiTile label="Pitches drafted" value={pitchesDrafted} />
        <KpiTile label="Proposals drafted" value={proposalsDrafted} />
        <KpiTile label="Brands worked (this month)" value={stats.leadsWorked} />
        <KpiTile label="Calls booked" value={callsBooked} />
      </div>

      <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:16px")}>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d8ecf8")}>Activity, last 14 days</div>
        {perDay.every((d) => d.count === 0) ? (
          <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#9da7ba")}>Nothing logged yet — run a pitch, brief, or proposal to see it here.</div>
        ) : (
          <div style={css("display:flex;align-items:flex-end;gap:6px;height:120px")}>
            {perDay.map((d) => (
              <div key={d.date} style={css("flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;height:100%;justify-content:flex-end")}>
                <div
                  title={`${d.date}: ${d.count}`}
                  style={css(
                    "width:100%;border-radius:4px 4px 0 0;background:linear-gradient(180deg,#663af3,#b6d9fc);min-height:2px;height:" +
                      Math.round((d.count / maxDay) * 100) +
                      "%"
                  )}
                />
                <div style={css("font-family:'JetBrains Mono',monospace;font-size:9px;color:#9da7ba")}>
                  {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { day: "numeric" })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:14px")}>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d8ecf8")}>Output by agent, this month</div>
        {ranking.length === 0 ? (
          <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#9da7ba")}>No agent activity yet this month.</div>
        ) : (
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            {ranking.map((r) => (
              <div key={r.agentId} style={css("display:flex;align-items:center;gap:12px")}>
                <span style={css(av(r.agent!, 26))}>{r.agent!.initials}</span>
                <div style={css("flex:1;display:flex;flex-direction:column;gap:4px")}>
                  <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#ffffff")}>{r.agent!.name}</div>
                  <div style={css("width:100%;height:5px;border-radius:3px;background:rgba(186,214,247,.1);overflow:hidden")}>
                    <div
                      style={css(
                        "height:100%;border-radius:3px;background:linear-gradient(90deg," + r.agent!.color + ",#d1e4fa);width:" + Math.round((r.leadsWorked / maxRank) * 100) + "%"
                      )}
                    />
                  </div>
                </div>
                <div style={css("font-family:'JetBrains Mono',monospace;font-size:12px;color:#c7d3ea;flex:none")}>{r.leadsWorked}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
