"use client";
import { useEffect, useState } from "react";
import { statusMeta } from "@/lib/data";
import { av, hubIcon } from "@/lib/visuals";
import { css, Box } from "@/components/primitives";

export interface OrbitAgent {
  id: string;
  name: string;
  initials: string;
  color: string;
  status: "working" | "waiting" | "offline" | "error";
  capabilities?: string[];
}
export interface OrbitTeam {
  id: string;
  name: string;
  members: string[];
}
export interface OrbitStats {
  activeAgents: number;
  tasksRunning: number;
  leadsWorked: number;
  perAgent: { agentId: string; leadsWorked: number }[];
}
export interface OrbitActivityItem {
  agentId: string;
  text: string;
}

// [animation, tint] per activity type — the glyph comes from hubIcon().
const hubIcons: Record<string, [string, string]> = {
  email: ["iconFly 2.6s ease-in-out infinite", "#027dea"],
  call: ["iconRing 1.6s ease-in-out infinite", "#269684"],
  research: ["iconSwing 2.4s ease-in-out infinite", "#b6d9fc"],
  writing: ["iconPop 2.4s ease-in-out infinite", "#d1e4fa"],
  meeting: ["iconPop 2.8s ease-in-out infinite", "#e46d4c"],
  analytics: ["iconPop 3s ease-in-out infinite", "#9da7ba"],
  idle: ["breathe 3s ease-in-out infinite", "#9da7ba"],
  alert: ["iconPop 1.8s ease-in-out infinite", "#e46d4c"],
};
// map an agent to an activity type by its first capability
const typeByCapability: Record<string, string> = {
  scrape: "research", research: "research", outreach: "email",
  "follow-up": "email", proposal: "writing", "book-meeting": "meeting",
};

interface Props {
  agents: OrbitAgent[];
  teams: OrbitTeam[];
  stats: OrbitStats;
  activity: OrbitActivityItem[];
  greeting?: string;
  avatarUrl?: string;
}

export default function OrbitDashboard({ agents, teams, stats, activity, greeting, avatarUrl }: Props) {
  const [dims, setDims] = useState({ w: 1280, h: 800 });
  const [reduced, setReduced] = useState(false);
  const [hubTeam, setHubTeam] = useState("all");
  const [tick, setTick] = useState(0);

  const byId = (id: string) => agents.find((a) => a.id === id);
  const ws = stats;
  const acts = activity;
  const paMap = new Map(ws.perAgent.map((p) => [p.agentId, p]));
  const maxOut = Math.max(1, ...ws.perAgent.map((p) => p.leadsWorked));

  useEffect(() => {
    const on = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    const hub = setInterval(() => setTick((t) => t + 1), 3200);
    return () => clearInterval(hub);
  }, []);

  const hubMembers = (
    hubTeam === "all"
      ? agents.slice(0, 8)
      : ((teams.find((t) => t.id === hubTeam) || teams[0])?.members ?? []).map((id) => byId(id))
  ).filter(Boolean) as OrbitAgent[];
  const HN = Math.max(hubMembers.length, 1);
  const nodes = hubMembers.map((a, i) => {
    const ang = ((-90 + (i * 360) / HN) * Math.PI) / 180;
    const x = Math.round(380 + Math.cos(ang) * 272);
    const y = Math.round(262 + Math.sin(ang) * 186);
    const type = typeByCapability[a.capabilities?.[0] ?? ""] || "writing";
    const ic = hubIcons[type];
    const m = statusMeta(a.status);
    const latest = acts.find((f) => f.agentId === a.id);
    return { a, i, x, y, m, ic, type, badge: latest ? latest.text.slice(0, 40) : (a.status === "working" ? "Working…" : "Idle") };
  });
  const collabs = HN >= 5 ? [[0, 2], [1, 4]] : [];

  const hubWorking = ws.activeAgents ?? 0;
  const leadsWorked = ws.leadsWorked ?? 0;
  const tasksRunning = ws.tasksRunning ?? 0;
  const monthLabel = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();
  const url = (avatarUrl ?? "").trim();

  const actLine = (f?: OrbitActivityItem) => (f ? (byId(f.agentId)?.name ?? "Agent") + " " + f.text : "");
  const hubLive = actLine(acts[0]).slice(0, 90);
  const hubLive2 = actLine(acts[1]).slice(0, 90);

  const hubCardW = dims.w - 52 - 2;
  const hubScale = Math.max(0.7, Math.min((dims.h - 300) / 524, (hubCardW - 40) / 760, 1.55));
  const teamPills = [{ id: "all", label: "Everyone" }].concat(teams.map((t) => ({ id: t.id, label: t.name })));

  const glassEdge = "rgba(186,215,247,.12)";

  return (
    <div style={css("display:flex;flex-direction:column;gap:18px;animation:fadeUp .3s ease")}>
      {greeting && (
        <div style={css("display:flex;align-items:baseline;gap:12px")}>
          <div style={css("font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:500;color:#ffffff")}>{greeting}</div>
        </div>
      )}

      <div style={css("position:relative;background:rgba(186,214,247,.03);border-radius:16px;height:min(720px,82vh);min-height:540px;overflow:hidden;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)")}>
        <div style={css("position:absolute;top:16px;left:20px;right:150px;display:flex;gap:8px;z-index:3;flex-wrap:wrap")}>
          {teamPills.map((p) => (
            <Box
              key={p.id}
              onClick={() => setHubTeam(p.id)}
              style={"font-family:'Inter',sans-serif;font-size:11.5px;font-weight:500;border-radius:999px;padding:5px 13px;cursor:pointer;transition:all .12s;" + (hubTeam === p.id ? "background:rgba(186,214,247,.12);color:#ffffff;box-shadow:inset 0 0 0 1px rgba(186,215,247,.24)" : "background:rgba(186,214,247,.06);color:#c7d3ea;box-shadow:inset 0 0 0 1px " + glassEdge)}
              styleHover="background:rgba(186,214,247,.12)"
            >
              {p.label}
            </Box>
          ))}
        </div>
        {hubWorking > 0 && (
          <div style={css("position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;color:#269684;background:rgba(38,150,132,.15);border-radius:999px;padding:4px 12px;z-index:3;box-shadow:inset 0 0 0 1px rgba(38,150,132,.35)")}>
            <span style={css("width:6px;height:6px;border-radius:50%;background:#269684;animation:pulse 2s infinite")} />
            Working now
          </div>
        )}

        <div style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(" + hubScale.toFixed(3) + ");width:760px;height:524px")}>
          <div style={css("position:absolute;left:380px;top:262px;width:560px;height:380px;transform:translate(-50%,-50%);border-radius:50%;box-shadow:inset 0 0 0 1px rgba(186,215,247,.05)")} />
          <div style={css("position:absolute;left:380px;top:262px;width:400px;height:270px;transform:translate(-50%,-50%);border-radius:50%;box-shadow:inset 0 0 0 1px rgba(186,215,247,.05)")} />

          <svg width="760" height="524" viewBox="0 0 760 524" style={{ position: "absolute", left: 0, top: 0 }}>
            {nodes.map((n) => (
              <line key={"l" + n.i} x1="380" y1="262" x2={n.x} y2={n.y} stroke="rgba(182,217,252,.35)" strokeWidth="1.5" strokeDasharray="3 7" style={{ animation: "dashMove 1.8s linear infinite" }} />
            ))}
            {!reduced && nodes.map((n) => (
              <circle key={"p" + n.i} r="2.6" fill="#b6d9fc" opacity="0.9">
                <animateMotion dur={2.4 + (n.i % 4) * 0.6 + "s"} begin={n.i * 0.4 + "s"} repeatCount="indefinite" path={"M" + n.x + " " + n.y + " L380 262"} />
              </circle>
            ))}
            {collabs.map((c, i) => (
              <line key={"c" + i} x1={nodes[c[0]].x} y1={nodes[c[0]].y} x2={nodes[c[1]].x} y2={nodes[c[1]].y} stroke="rgba(2,125,234,.4)" strokeWidth="1.5" strokeDasharray="2 6" style={{ animation: "dashMove 1.2s linear infinite" }} />
            ))}
          </svg>

          {/* center goal ring */}
          <div style={css("position:absolute;left:380px;top:262px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2")}>
            <div style={css("position:relative;width:124px;height:124px;display:flex;align-items:center;justify-content:center")}>
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(182,217,252,.5);animation:ringPulse 3s ease-out infinite")} />
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(182,217,252,.5);animation:ringPulse 3s ease-out 1.5s infinite")} />
              <div style={css("width:124px;height:124px;border-radius:50%;background:conic-gradient(#b6d9fc 0 100%,rgba(255,255,255,.1) 100% 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 44px rgba(182,217,252,.35)")}>
                <div style={css("width:106px;height:106px;border-radius:50%;background:rgba(5,6,15,.97);display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden")}>
                  {url ? (
                    <div role="img" aria-label="Your profile" style={{ ...css("width:106px;height:106px;border-radius:50%;background-size:cover;background-position:center"), backgroundImage: `url("${url}")` }} />
                  ) : (
                    <>
                      <div style={css("font-family:'Space Grotesk',sans-serif;font-size:24px;font-weight:500;color:#d8ecf8;line-height:1")}>{leadsWorked}</div>
                      <div style={css("font-family:'JetBrains Mono',monospace;font-size:8.5px;font-weight:500;letter-spacing:.1em;color:#9da7ba;margin-top:4px;text-align:center;line-height:1.4")}>BRANDS WORKED<br />{monthLabel}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div style={css("display:flex;gap:8px")}>
              {url && <div style={css("font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:500;color:#d1e4fa;background:rgba(186,214,247,.06);border-radius:999px;padding:4px 11px;box-shadow:inset 0 0 0 1px " + glassEdge)}>{leadsWorked} brands · {monthLabel}</div>}
              <div style={css("display:inline-flex;align-items:center;gap:5px;font-family:'JetBrains Mono',monospace;font-size:10.5px;font-weight:500;color:#d1e4fa;background:rgba(186,214,247,.06);border-radius:999px;padding:4px 11px;box-shadow:inset 0 0 0 1px " + glassEdge)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#e46d4c" style={{ flex: "none" }} aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
                {hubWorking} working · {tasksRunning} tasks
              </div>
            </div>
            {hubMembers.length === 0 && (
              <div style={css("font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:500;color:#9da7ba;background:rgba(186,214,247,.04);border-radius:999px;padding:5px 13px;box-shadow:inset 0 0 0 1px " + glassEdge)}>No teammates in this pod yet</div>
            )}
          </div>

          {/* agent nodes */}
          {nodes.map((n) => (
            <Box key={n.a.id} aria-label={n.a.name} style={"position:absolute;left:" + n.x + "px;top:" + n.y + "px;transform:translate(-50%,-50%);width:170px;display:flex;flex-direction:column;align-items:center;z-index:2"}>
              <div style={css("display:flex;flex-direction:column;align-items:center;gap:6px;animation:floaty " + (5 + (n.i % 3)) + "s ease-in-out " + (n.i * 0.45).toFixed(2) + "s infinite")}>
                <div style={css("position:relative")}>
                  <div style={css("padding:3px;border-radius:50%;background:rgba(5,6,15,.9);box-shadow:inset 0 0 0 1px " + glassEdge + ", 0 0 22px " + n.a.color + "55")}><div style={css(av(n.a, 46) + ";border:2px solid rgba(5,6,15,.97)")}>{n.a.initials}</div></div>
                  <div style={css("position:absolute;top:-8px;right:-10px;width:22px;height:22px;border-radius:50%;background:rgba(5,6,15,.9);box-shadow:inset 0 0 0 1px " + glassEdge + ";display:flex;align-items:center;justify-content:center;animation:" + n.ic[0])}><span style={css(hubIcon(n.type, n.ic[1]))} /></div>
                </div>
                <div style={css("display:flex;align-items:center;gap:5px;margin-top:2px")}><span style={css("width:7px;height:7px;border-radius:50%;background:" + n.m.dot + ";flex:none;" + (n.a.status === "working" ? "animation:pulse 2s infinite" : ""))} /><span style={css("font-family:'Inter',sans-serif;font-size:12px;font-weight:700;color:#ffffff")}>{n.a.name}</span></div>
                <div style={css("width:60px;height:3px;border-radius:2px;background:rgba(186,214,247,.1);overflow:hidden")}><div style={css("width:" + Math.round(((paMap.get(n.a.id)?.leadsWorked ?? 0) / maxOut) * 100) + "%;height:100%;border-radius:2px;background:linear-gradient(90deg," + n.a.color + ",#d1e4fa)")} /></div>
                <div style={css("display:flex;align-items:center;gap:6px;font-family:'Inter',sans-serif;font-size:10.5px;font-weight:500;color:#d1e4fa;background:rgba(186,214,247,.06);border-radius:999px;padding:4px 10px;white-space:nowrap;max-width:168px;overflow:hidden;text-overflow:ellipsis;box-shadow:inset 0 0 0 1px " + glassEdge + ";animation:" + (tick % 2 ? "badgePopA" : "badgePopB") + " .4s ease")}><span>{n.badge}</span></div>
              </div>
            </Box>
          ))}
        </div>

        {/* floating particles */}
        <div style={css("position:absolute;left:18%;bottom:30%;width:5px;height:5px;border-radius:50%;background:rgba(182,217,252,.6);animation:rise 7s ease-in-out infinite")} />
        <div style={css("position:absolute;left:72%;bottom:24%;width:4px;height:4px;border-radius:50%;background:rgba(38,150,132,.5);animation:rise 9s ease-in-out 2s infinite")} />
        <div style={css("position:absolute;left:48%;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(2,125,234,.5);animation:rise 8s ease-in-out 4s infinite")} />
        <div style={css("position:absolute;left:85%;bottom:55%;width:4px;height:4px;border-radius:50%;background:rgba(209,228,250,.5);animation:rise 10s ease-in-out 1s infinite")} />

        {/* live activity labels */}
        <div style={css("position:absolute;bottom:16px;left:20px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;z-index:3;max-width:70%")}>
          <div style={css("display:flex;align-items:center;gap:7px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;color:#9da7ba;background:rgba(186,214,247,.03);border-radius:999px;padding:5px 13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.75;box-shadow:inset 0 0 0 1px rgba(186,215,247,.08)")}><svg width="11" height="11" viewBox="0 0 24 24" fill="#9da7ba" style={{ flex: "none" }} aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" /></svg>{hubLive2}</div>
          <div style={css("display:flex;align-items:center;gap:7px;font-family:'Inter',sans-serif;font-size:11px;font-weight:400;color:#d1e4fa;background:rgba(186,214,247,.06);border-radius:999px;padding:5px 13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;box-shadow:inset 0 0 0 1px " + glassEdge)}><svg width="11" height="11" viewBox="0 0 24 24" fill="#b6d9fc" style={{ flex: "none" }} aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" /></svg>{hubLive}</div>
        </div>
      </div>
    </div>
  );
}
