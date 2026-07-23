# The Dashboard "Agents at Work" View — reproduce the layout EXACTLY (skin to taste)

> Briefing document for Claude. The creator wants a polished, signature "agents at work" view. This document contains the real, working code for it. **Reproduce its layout, animations, and behavior faithfully** — its *skin* (colors, typography, surfaces) follows the look the creator chose for the app (see the design-systems note below; default = the warm-dark reference here). Build the **visual at Milestone 1** — it's the app's first UI and the signature of the whole product, so it ships on day one as the landing hero. At Milestone 1 there's no database/auth/AI yet, so render it from the **static preset "Deal Team"** (the five agents in `lib/agentTypes.ts` — see `07a-the-deal-team.md`) with representative demo stats/activity. At **Milestone 15** you **wire the same component to real data** (real agents/teams from the AI-team milestone, and workspace stats + activity) — you do **not** rebuild or redesign it.
>
> This is the flagship screen. Don't silently relayout it or simplify the animations — reproduce the structure and motion. Its **skin follows the creator's chosen look** (default: the warm-dark reference below). Copy it once at Milestone 1, then only swap the data hookup (demo → real) at Milestone 15.
>
> **Design systems — re-skin, don't relayout.** If the creator picks a different overall look for the app (colors, typography, light/dark, a style like minimal / glassy / bold), apply it to this dashboard too: restyle the palette, fonts, surfaces, and motion to match — but **keep the structure and behavior** (center hub, agents in orbit, connectors/particles, status pulses, output bars, live-activity chips, responsive scaling, reduced-motion freeze). The orbit stays the signature layout; only its skin changes. Achieve it within the fixed stack (inline styles as here) — **don't add UI/component libraries**. Build a fundamentally different dashboard only if the creator explicitly asks for one.

## What it looks like (so you understand what you're building)

A big rounded hero card filling the dashboard, with a deep-purple radial-gradient background. In the **center** sits the creator (their profile photo, or a "brands worked this month" number) inside a glowing pulsing ring. **Around** the center, the creator's agents are arranged in a circle ("orbit"), each connected to the center by an animated dashed line with little particles flowing inward. Each agent shows: a floating round avatar, a small animated icon badge saying what kind of work it's doing (email/call/research/writing/meeting…), the agent's name with a status dot (pulsing green when working), a tiny output progress bar, and a rounded "live activity" chip (e.g. "Drafting pitch for Acme…"). Top-left has team filter pills; top-right shows a green pulsing "Working now" badge when agents are active; bottom-left streams the two latest activity lines. Faint particles drift upward in the background.

```
┌───────────────────────────────────────────────────────────────┐
│ [Everyone][Deal Team][…]                        ● Working now   │
│                                                                 │
│              (agent)          (agent)                           │
│                    \          /                                 │
│                     \  ╭────╮ /        (agent)                  │
│      (agent) ──────────│ 👤 │──────────                         │
│                     /  ╰────╯ \                                 │
│                    /          \                                 │
│              (agent)          (agent)                           │
│                                                                 │
│  ✦ Scheduler booked a call with…                               │
│  ✦ Outreach drafted a pitch for…                               │
└───────────────────────────────────────────────────────────────┘
```

## The exact visual result to match
- Card background: `radial-gradient(900px 520px at 50% 38%, #2A1657, #150B33 75%)`, 1px border `#2C1B5E`, `border-radius:24px`, tall (`calc(100dvh - 178px)`, min 540px), soft shadow.
- The orbit stage is a fixed **760×524** area, centered and **scaled** to fit the card (so it's responsive).
- Two faint elliptical orbit rings. Dashed connector lines animate inward; SVG particles travel along them.
- Center: a 124px conic-gradient ring (`#B57BFF`) with two expanding pulse rings, holding a 106px dark circle with the creator's photo or the brands-worked number.
- Agents evenly spaced by angle, floating gently (staggered), each with an animated activity badge, a pulsing status dot when working, an output bar, and a live-activity chip.
- Purple/violet palette throughout; accent greens `#2FA45C`/`#7EE2A8` for "working," pinks `#F43F7E` for collab links.
- Everything must **freeze gracefully** under "reduced motion."

---

## Build these support pieces first (verbatim)

### 1. Animations — add these keyframes to your global stylesheet
```css
@keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }
@keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
@keyframes dashMove { to { stroke-dashoffset: -20; } }
@keyframes ringPulse { 0% { transform: scale(1); opacity: .6; } 100% { transform: scale(1.75); opacity: 0; } }
@keyframes iconFly { 0% { transform: translate(0,0) rotate(0deg); opacity: 1; } 70% { opacity: 1; } 100% { transform: translate(16px,-18px) rotate(14deg); opacity: 0; } }
@keyframes iconRing { 0%, 100% { transform: rotate(0deg); } 20% { transform: rotate(16deg); } 40% { transform: rotate(-14deg); } 60% { transform: rotate(10deg); } 80% { transform: rotate(-6deg); } }
@keyframes iconSwing { 0%, 100% { transform: translate(0,0) rotate(0deg); } 50% { transform: translate(6px,-4px) rotate(12deg); } }
@keyframes iconPop { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1); } }
@keyframes breathe { 0%, 100% { transform: scale(1); opacity: .85; } 50% { transform: scale(1.05); opacity: 1; } }
/* badgePopA/B are intentionally identical: alternating between them re-triggers the pop on state change. */
@keyframes badgePopA { from { opacity: 0; transform: translateY(6px) scale(.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes badgePopB { from { opacity: 0; transform: translateY(6px) scale(.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes rise { 0% { transform: translateY(30px); opacity: 0; } 25% { opacity: .7; } 75% { opacity: .4; } 100% { transform: translateY(-60px); opacity: 0; } }

/* Freeze all of the above under reduced motion (accessibility). */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .001ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 2. Fonts
The greeting and the center number use **Poetsen One**; body text is **Inter**. Load both (simplest: a CSS import at the top of your global stylesheet, or the framework's font loader):
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poetsen+One&display=swap');
```
Base body style: `font-family: Inter, system-ui, sans-serif; background:#FAFAFB; color:#18181B;`

### 3. The inline-style helpers (`css` and `Box`) — verbatim
The dashboard is written with a tiny helper that turns a CSS string into React styles, plus a `Box` that supports hover and keyboard-accessible clicks. Put this in `components/primitives.tsx`:
```tsx
"use client";
import React, { useState } from "react";
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from "react";

export type Style = string | CSSProperties;

export function css(input?: Style): CSSProperties {
  if (!input) return {};
  if (typeof input !== "string") return input;
  const o: Record<string, string> = {};
  for (const decl of input.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop) continue;
    const key = prop.startsWith("--") ? prop : prop.replace(/-([a-z])/g, (_m, c: string) => c.toUpperCase());
    const bm = key === "border" && val.match(/^(\S+)\s+(solid|dashed|dotted|double|none)(?:\s+(.+))?$/);
    if (bm) { o.borderWidth = bm[1]; o.borderStyle = bm[2]; if (bm[3]) o.borderColor = bm[3]; continue; }
    o[key] = val;
  }
  return o as CSSProperties;
}

interface BoxProps {
  as?: "div" | "span"; style?: Style; styleHover?: Style;
  onClick?: (e: MouseEvent | KeyboardEvent) => void; noButton?: boolean; children?: ReactNode;
  [key: string]: unknown;
}
export function Box({ as = "div", style, styleHover, onClick, noButton, children, ...rest }: BoxProps) {
  const [hover, setHover] = useState(false);
  const Tag = as;
  const merged: CSSProperties = { ...css(style), ...(hover && styleHover ? css(styleHover) : {}) };
  const hoverProps = styleHover ? { onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false) } : {};
  const a11y = onClick && !noButton ? {
    role: "button" as const, tabIndex: 0,
    onKeyDown: (e: KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } },
  } : {};
  return <Tag style={merged} onClick={onClick} {...hoverProps} {...a11y} {...(rest as Record<string, unknown>)}>{children}</Tag>;
}
```

### 4. Status colors — verbatim
```ts
export type StatusKey = "working" | "waiting" | "offline" | "error";
export interface StatusMeta { label: string; bg: string; color: string; dot: string }
const STATUS_META: Record<StatusKey, StatusMeta> = {
  working: { label: "Working", bg: "#E7F7EC", color: "#1B7A3D", dot: "#2FA45C" },
  waiting: { label: "Waiting", bg: "#FEF6E8", color: "#B45309", dot: "#F59E0B" },
  offline: { label: "Offline", bg: "#F4F4F5", color: "#71717A", dot: "#A1A1AA" },
  error:   { label: "Error",   bg: "#FEECEC", color: "#B91C1C", dot: "#EF4444" },
};
export function statusMeta(s: StatusKey): StatusMeta { return STATUS_META[s] ?? STATUS_META.offline; }
```

### 5. The activity-badge glyphs (`hubIcon`) — verbatim
Each agent's little badge shows a tinted, animated icon for the kind of work it's doing. Put in `lib/visuals.ts`:
```ts
const HUB_GLYPHS: Record<string, string> = {
  email: '<rect x="3" y="5" width="18" height="14" rx="2.2"/><path d="m3.6 6.5 8.4 6 8.4-6"/>',
  call: '<path d="M15.6 13.7c-1 1-1 1-2 .5a11 11 0 0 1-3.8-3.8c-.5-1-.5-1 .5-2 .6-.6.7-1 .3-1.8l-1-2.2c-.3-.6-.8-.8-1.4-.6C6.6 4.3 5.6 5.6 5.6 7c0 5.6 5.4 11 11 11 1.4 0 2.7-1 3.2-2.4.2-.6 0-1.1-.6-1.4l-2.2-1c-.7-.4-1.1-.3-1.7.3Z"/>',
  research: '<circle cx="10.5" cy="10.5" r="6"/><path d="m20 20-5-5"/>',
  writing: '<path d="M4 20l1-4L15.4 5.6a1.5 1.5 0 0 1 2.1 0l.9.9a1.5 1.5 0 0 1 0 2.1L8 19l-4 1Z"/><path d="m13.5 7.5 3 3"/>',
  meeting: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.5h17"/><path d="M8 3v4M16 3v4"/>',
  analytics: '<path d="M4 5v15h16"/><path d="m7.5 14.5 3-3.5 3 2 4-5.5"/>',
  idle: '<circle cx="12" cy="12" r="7.2" stroke-dasharray="2.2 3"/>',
  alert: '<path d="M12 4.5 20.5 19H3.5L12 4.5Z"/><path d="M12 10.5v3.5"/><path d="M12 17h.01"/>',
};
const hubIconCache = new Map<string, string>();
export function hubIcon(type: string, color: string, size = 14): string {
  const ck = type + "|" + color + "|" + size;
  const hit = hubIconCache.get(ck); if (hit !== undefined) return hit;
  const inner = HUB_GLYPHS[type] || HUB_GLYPHS.writing;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="' + color +
    '" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + inner + "</svg>";
  const out = "width:" + size + "px;height:" + size + "px;flex:none;background-image:url(\"data:image/svg+xml," +
    encodeURIComponent(svg) + "\");background-size:contain;background-repeat:no-repeat;background-position:center";
  hubIconCache.set(ck, out); return out;
}
```

### 6. The avatar helper (`av`)
The reference product draws illustrated character faces from an image sprite. Since the creator won't have that image, use this **simple initials-on-a-colored-circle** version by default — it fits the exact same layout and looks clean. Add to `lib/visuals.ts`:
```ts
export function av(a: { id: string; color: string; char?: number }, size: number): string {
  return "width:" + size + "px;height:" + size + "px;border-radius:50%;flex:none;display:flex;" +
    "align-items:center;justify-content:center;background:" + a.color + ";color:#fff;" +
    "font-weight:700;font-size:" + Math.round(size * 0.37) + "px";
}
```
> Optional (only if the creator provides an illustrated-avatar sprite image later): swap `av` for the sprite-based version. Not needed to match the design — the layout, orbit, and animations are identical either way.

---

## The main component — copy verbatim, then wire the data

This is the dashboard hub. Create it as your dashboard's client component (e.g. `app/HomeClient.tsx`), rendered by the dashboard page. It expects:
- **Agents** for the current user, each shaped `{ id, name, initials, color, status }` (from the AI-team milestone). `byId(id)` looks one up. `teams` is the list of pods.
- **`initialStats`** — the workspace stats object with `activeAgents`, `tasksRunning`, `leadsWorked`, and `perAgent: [{ agentId, leadsWorked }]` (built in this milestone from the activity log + pipeline).
- **`initialActs`** — recent activity items `{ agentId, text, ... }` (built in this milestone from the activity log + pipeline).
- Optionally **`tiktok`** — `{ avatarUrl, displayName, username }` for the center photo (skip/leave null if not built).
- A selected team id (`hubTeam`) and a setter; keep this in your app state/store, defaulting to `"all"`.

**Map each agent to an activity type** for its badge. In the reference, seed agents map by id; for this build, map by the agent's capability so the badge fits what it does:
```ts
// discovery/research → research, outreach/follow-up → email, proposal → writing, scheduler → meeting
const typeByCapability: Record<string, string> = {
  scrape: "research", research: "research", outreach: "email",
  "follow-up": "email", proposal: "writing", "book-meeting": "meeting",
};
// pick the agent's first capability; default to "writing"
function agentActivityType(a: { capabilities?: string[] }): string {
  return typeByCapability[(a.capabilities?.[0] ?? "")] || "writing";
}
```

Now the component (verbatim from the reference). Keep the **layout, sizes, animations, and structure exactly**; the **colors and fonts here are the default skin** — swap them to match the creator's chosen look if they picked one (keep the structure and motion). Adapt the data hookup (where it reads agents/teams/stats/activity) to match how your app provides them, and replace the `hubTypes[a.id]` lookup with `agentActivityType(a)`:

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";          // however your app exposes agents/teams/selected team
import { statusMeta } from "@/lib/data";
import { av, hubIcon } from "@/lib/visuals";
import { css, Box } from "@/components/primitives";
import type { WorkspaceStats, ActivityItem } from "@/lib/workspace/stats";

// [animation, tint] per activity type — the glyph comes from hubIcon().
const hubIcons: Record<string, [string, string]> = {
  email: ["iconFly 2.6s ease-in-out infinite", "#0EA5E9"], call: ["iconRing 1.6s ease-in-out infinite", "#2FA45C"],
  research: ["iconSwing 2.4s ease-in-out infinite", "#F59E0B"], writing: ["iconPop 2.4s ease-in-out infinite", "#5122C1"],
  meeting: ["iconPop 2.8s ease-in-out infinite", "#F43F7E"], analytics: ["iconPop 3s ease-in-out infinite", "#8B5CF6"],
  idle: ["breathe 3s ease-in-out infinite", "#8A8A94"], alert: ["iconPop 1.8s ease-in-out infinite", "#EF4444"],
};
// map an agent to an activity type by its first capability (see doc)
const typeByCapability: Record<string, string> = {
  scrape: "research", research: "research", outreach: "email",
  "follow-up": "email", proposal: "writing", "book-meeting": "meeting",
};

export default function HomeClient({ initialStats, initialActs, tiktok }: { initialStats: WorkspaceStats | null; initialActs: ActivityItem[]; tiktok?: { avatarUrl?: string; displayName?: string; username?: string } | null }) {
  const { s, set, agents, teams, byId } = useApp();
  const router = useRouter();
  const [dims, setDims] = useState({ w: 1280, h: 800 });
  const [reduced, setReduced] = useState(false);
  const [greeting, setGreeting] = useState("Good morning");
  const ws = initialStats;
  const acts = initialActs;
  const paMap = new Map((ws?.perAgent ?? []).map((p) => [p.agentId, p]));
  const maxOut = Math.max(1, ...(ws?.perAgent ?? []).map((p) => p.leadsWorked));

  useEffect(() => {
    const on = () => setDims({ w: window.innerWidth, h: window.innerHeight });
    on(); window.addEventListener("resize", on); return () => window.removeEventListener("resize", on);
  }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setReduced(mq.matches); on();
    mq.addEventListener("change", on); return () => mq.removeEventListener("change", on);
  }, []);
  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
  }, []);
  const [tick, setTick] = useState(0);
  useEffect(() => { const hub = setInterval(() => setTick((t) => t + 1), 3200); return () => clearInterval(hub); }, []);
  const userFirst = s.userName.split(" ")[0];

  const hubMembers = (s.hubTeam === "all" ? agents.slice(0, 8) : ((teams.find((t) => t.id === s.hubTeam) || teams[0])?.members ?? []).map((id) => byId(id))).filter(Boolean) as typeof agents;
  const HN = Math.max(hubMembers.length, 1);
  const nodes = hubMembers.map((a, i) => {
    const ang = ((-90 + (i * 360) / HN) * Math.PI) / 180;
    const x = Math.round(380 + Math.cos(ang) * 272);
    const y = Math.round(262 + Math.sin(ang) * 186);
    const type = typeByCapability[(a.capabilities?.[0] ?? "")] || "writing";
    const ic = hubIcons[type];
    const m = statusMeta(a.status);
    const latest = acts.find((f) => f.agentId === a.id);
    return { a, i, x, y, m, ic, type, badge: latest ? latest.text.slice(0, 40) : (a.status === "working" ? "Working…" : "Idle") };
  });
  const collabs = HN >= 5 ? [[0, 2], [1, 4]] : [];

  const hubWorking = ws?.activeAgents ?? 0;
  const leadsWorked = ws?.leadsWorked ?? 0;
  const tasksRunning = ws?.tasksRunning ?? 0;
  const monthLabel = new Date().toLocaleString("en-US", { month: "long" }).toUpperCase();
  const avatarUrl = (tiktok?.avatarUrl ?? "").trim();
  const creatorName = tiktok?.displayName || tiktok?.username || "Your profile";

  const actLine = (f?: ActivityItem) => (f ? (byId(f.agentId)?.name ?? "Agent") + " " + f.text : "");
  const hubLive = actLine(acts[0]).slice(0, 90);
  const hubLive2 = actLine(acts[1]).slice(0, 90);

  const hubCardW = dims.w - 52 - 2;
  const hubScale = Math.max(0.7, Math.min((dims.h - 250) / 524, (hubCardW - 40) / 760, 1.45));
  const teamPills = [{ id: "all", label: "Everyone" }].concat(teams.map((t) => ({ id: t.id, label: t.name })));

  return (
    <div style={css("padding:24px 26px;display:flex;flex-direction:column;gap:18px;animation:fadeUp .3s ease")}>
      <div style={css("display:flex;align-items:baseline;gap:12px")}>
        <div style={css("font-family:'Poetsen One',sans-serif;font-size:24px;font-weight:400;letter-spacing:-.01em;white-space:nowrap")}>{greeting}, {userFirst}!</div>
      </div>

      <div style={css("position:relative;background:radial-gradient(900px 520px at 50% 38%,#2A1657,#150B33 75%);border:1px solid #2C1B5E;border-radius:24px;height:calc(100dvh - 178px);min-height:540px;overflow:hidden;box-shadow:0 20px 50px rgba(21,11,51,.3)")}>
        <div style={css("position:absolute;top:16px;left:20px;right:150px;display:flex;gap:8px;z-index:3;flex-wrap:wrap")}>
          {teamPills.map((p) => (
            <Box key={p.id} onClick={() => set({ hubTeam: p.id })} style={"font-size:11.5px;font-weight:600;border-radius:99px;padding:5px 13px;cursor:pointer;transition:all .12s;backdrop-filter:blur(6px);" + (s.hubTeam === p.id ? "background:#fff;color:#2E1065;border:1px solid #fff" : "background:rgba(255,255,255,.07);color:#CFC6F2;border:1px solid rgba(255,255,255,.16)")} styleHover="border-color:#C9B8F5">{p.label}</Box>
          ))}
        </div>
        {hubWorking > 0 && <div style={css("position:absolute;top:16px;right:20px;display:flex;align-items:center;gap:6px;font-size:11px;font-weight:600;color:#7EE2A8;background:rgba(46,164,92,.15);border:1px solid rgba(126,226,168,.3);border-radius:99px;padding:4px 12px;z-index:3;backdrop-filter:blur(6px)")}><span style={css("width:6px;height:6px;border-radius:50%;background:#2FA45C;animation:pulse 2s infinite")} />Working now</div>}

        <div style={css("position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) scale(" + hubScale.toFixed(3) + ");width:760px;height:524px")}>
          <div style={css("position:absolute;left:380px;top:262px;width:560px;height:380px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.06);border-radius:50%")} />
          <div style={css("position:absolute;left:380px;top:262px;width:400px;height:270px;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.06);border-radius:50%")} />

          <svg width="760" height="524" viewBox="0 0 760 524" style={{ position: "absolute", left: 0, top: 0 }}>
            {nodes.map((n) => (
              <line key={"l" + n.i} x1="380" y1="262" x2={n.x} y2={n.y} stroke="#3D2A78" strokeWidth="1.5" strokeDasharray="3 7" style={{ animation: "dashMove 1.8s linear infinite" }} />
            ))}
            {!reduced && nodes.map((n) => (
              <circle key={"p" + n.i} r="2.6" fill="#C9B2FF" opacity="0.9">
                <animateMotion dur={2.4 + (n.i % 4) * 0.6 + "s"} begin={n.i * 0.4 + "s"} repeatCount="indefinite" path={"M" + n.x + " " + n.y + " L380 262"} />
              </circle>
            ))}
            {collabs.map((c, i) => (
              <line key={"c" + i} x1={nodes[c[0]].x} y1={nodes[c[0]].y} x2={nodes[c[1]].x} y2={nodes[c[1]].y} stroke="rgba(244,63,126,.55)" strokeWidth="1.5" strokeDasharray="2 6" style={{ animation: "dashMove 1.2s linear infinite" }} />
            ))}
          </svg>

          {/* center goal ring */}
          <div style={css("position:absolute;left:380px;top:262px;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:10px;z-index:2")}>
            <div style={css("position:relative;width:124px;height:124px;display:flex;align-items:center;justify-content:center")}>
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(181,123,255,.5);animation:ringPulse 3s ease-out infinite")} />
              <div style={css("position:absolute;left:0;top:0;right:0;bottom:0;border-radius:50%;border:2px solid rgba(181,123,255,.5);animation:ringPulse 3s ease-out 1.5s infinite")} />
              <div style={css("width:124px;height:124px;border-radius:50%;background:conic-gradient(#B57BFF 0 100%,rgba(255,255,255,.12) 100% 100%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 44px rgba(139,92,246,.4)")}>
                <div style={css("width:106px;height:106px;border-radius:50%;background:#190E3B;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden")}>
                  {avatarUrl ? (
                    <div role="img" aria-label={creatorName} style={{ ...css("width:106px;height:106px;border-radius:50%;background-size:cover;background-position:center"), backgroundImage: `url("${avatarUrl}")` }} />
                  ) : (
                    <>
                      <div style={css("font-family:'Poetsen One',sans-serif;font-size:24px;font-weight:700;color:#fff;line-height:1")}>{leadsWorked}</div>
                      <div style={css("font-size:8.5px;font-weight:700;letter-spacing:.1em;color:#A99BD8;margin-top:4px;text-align:center;line-height:1.4")}>BRANDS WORKED<br />{monthLabel}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div style={css("display:flex;gap:8px")}>
              {avatarUrl && <div style={css("font-size:10.5px;font-weight:600;color:#E5DEFF;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}>{leadsWorked} brands · {monthLabel}</div>}
              <div style={css("display:inline-flex;align-items:center;gap:5px;font-size:10.5px;font-weight:600;color:#E5DEFF;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:4px 11px;backdrop-filter:blur(6px)")}><svg width="11" height="11" viewBox="0 0 24 24" fill="#FBBF24" style={{ flex: "none" }} aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>{hubWorking} working · {tasksRunning} tasks</div>
            </div>
            {hubMembers.length === 0 && (
              <div style={css("font-size:11px;font-weight:600;color:#CFC6F2;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px)")}>{agents.length === 0 ? "Your team is being set up…" : "No teammates in this pod yet"}</div>
            )}
          </div>

          {/* agent nodes */}
          {nodes.map((n) => (
            <Box key={n.a.id} onClick={() => router.push("/agents/" + n.a.id)} aria-label={n.a.name} style={"position:absolute;left:" + n.x + "px;top:" + n.y + "px;transform:translate(-50%,-50%);width:170px;display:flex;flex-direction:column;align-items:center;cursor:pointer;z-index:2"}>
              <div style={css("display:flex;flex-direction:column;align-items:center;gap:6px;animation:floaty " + (5 + (n.i % 3)) + "s ease-in-out " + (n.i * 0.45).toFixed(2) + "s infinite")}>
                <div style={css("position:relative")}>
                  <div style={css("padding:3px;border-radius:50%;background:#fff;box-shadow:0 0 22px " + n.a.color + "66")}><div style={css(av(n.a, 46) + ";border:2px solid #190E3B")}>{n.a.initials}</div></div>
                  <div style={css("position:absolute;top:-8px;right:-10px;width:22px;height:22px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 3px 10px rgba(0,0,0,.35);animation:" + n.ic[0])}><span style={css(hubIcon(n.type, n.ic[1]))} /></div>
                </div>
                <div style={css("display:flex;align-items:center;gap:5px;margin-top:2px")}><span style={css("width:7px;height:7px;border-radius:50%;background:" + n.m.dot + ";flex:none;" + (n.a.status === "working" ? "animation:pulse 2s infinite" : ""))} /><span style={css("font-size:12px;font-weight:700;color:#F4F1FF")}>{n.a.name}</span></div>
                <div style={css("width:60px;height:3px;border-radius:2px;background:rgba(255,255,255,.14);overflow:hidden")}><div style={css("width:" + Math.round(((paMap.get(n.a.id)?.leadsWorked ?? 0) / maxOut) * 100) + "%;height:100%;border-radius:2px;background:linear-gradient(90deg," + n.a.color + ",#B57BFF)")} /></div>
                <div style={css("display:flex;align-items:center;gap:6px;font-size:10.5px;font-weight:600;color:#E5DEFF;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);backdrop-filter:blur(6px);border-radius:99px;padding:4px 10px;white-space:nowrap;max-width:168px;overflow:hidden;text-overflow:ellipsis;animation:" + (tick % 2 ? "badgePopA" : "badgePopB") + " .4s ease")}><span>{n.badge}</span></div>
              </div>
            </Box>
          ))}
        </div>

        {/* floating particles */}
        <div style={css("position:absolute;left:18%;bottom:30%;width:5px;height:5px;border-radius:50%;background:rgba(181,123,255,.6);animation:rise 7s ease-in-out infinite")} />
        <div style={css("position:absolute;left:72%;bottom:24%;width:4px;height:4px;border-radius:50%;background:rgba(126,226,168,.5);animation:rise 9s ease-in-out 2s infinite")} />
        <div style={css("position:absolute;left:48%;bottom:18%;width:3px;height:3px;border-radius:50%;background:rgba(244,63,126,.5);animation:rise 8s ease-in-out 4s infinite")} />
        <div style={css("position:absolute;left:85%;bottom:55%;width:4px;height:4px;border-radius:50%;background:rgba(201,178,255,.5);animation:rise 10s ease-in-out 1s infinite")} />

        {/* live activity labels */}
        <div style={css("position:absolute;bottom:16px;left:20px;display:flex;flex-direction:column;align-items:flex-start;gap:6px;z-index:3;max-width:70%")}>
          <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:#CFC6F2;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;opacity:.75")}><svg width="11" height="11" viewBox="0 0 24 24" fill="#8F7EC9" style={{ flex: "none" }} aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" /></svg>{hubLive2}</div>
          <div style={css("display:flex;align-items:center;gap:7px;font-size:11px;font-weight:600;color:#E5DEFF;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:99px;padding:5px 13px;backdrop-filter:blur(8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%")}><svg width="11" height="11" viewBox="0 0 24 24" fill="#B57BFF" style={{ flex: "none" }} aria-hidden="true"><path d="M12 3l1.9 5.8a2 2 0 0 0 1.3 1.3L21 12l-5.8 1.9a2 2 0 0 0-1.3 1.3L12 21l-1.9-5.8a2 2 0 0 0-1.3-1.3L3 12l5.8-1.9a2 2 0 0 0 1.3-1.3L12 3Z" /></svg>{hubLive}</div>
        </div>
      </div>
    </div>
  );
}
```

## Making it feel "live"
- The dashboard page loads real stats + recent activity on the server and passes them in (`initialStats`, `initialActs`). Rebuild those from the workspace stats built in this milestone.
- `activeAgents` / `tasksRunning` come from currently-running jobs → that's what turns on the green "Working now" pill and the pulsing status dots. So when the creator runs a pitch/pod, the dashboard visibly shows agents "working."
- For continuous liveness, you may poll for the running set every few seconds and update the working states (the reference app polls a "who's working now" endpoint on a ~3.5s interval). Optional but nice.

## Adaptation checklist (don't skip)
1. Wire `agents`, `teams`, `byId`, `s.userName`, `s.hubTeam`, and `set({ hubTeam })` to however this app holds state — the shapes above are what the component needs.
2. Ensure each agent object carries `initials`, `color`, `status`, and `capabilities` (from the AI-team milestone).
3. Provide `WorkspaceStats` with `activeAgents`, `tasksRunning`, `leadsWorked`, `perAgent[]` and `ActivityItem` with `agentId` + `text`. **At Milestone 1** these are representative **demo** values (and `agents`/`teams` come from the static preset "Deal Team") so the showcase looks alive with no backend. **At Milestone 15** they're built for real from the activity log + pipeline, and `agents`/`teams` come from the user's own data.
4. Keep the exact **layout, sizes, and animation names/structure** — this is a reproduction, not a relayout. **Colors, fonts, and surfaces are the default skin**; restyle them to the creator's chosen look (keeping the same structure and motion).
5. Confirm reduced-motion freezes the animations (the media query above handles CSS; the component already gates the SVG particles via `reduced`).
