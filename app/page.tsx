"use client";
import { useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { css, Box } from "@/components/primitives";
import OrbitDashboard from "@/components/OrbitDashboard";
import { demoAgents, demoTeams, demoStats, demoActivity } from "@/lib/demoData";

const FEATURES = [
  {
    title: "Find brands",
    desc: "Your Research agent scans the web for brands that sponsor creators in your niche and drops them into a Pending list for you to approve.",
    icon: "M4 5v15h16 M7.5 14.5l3-3.5 3 2 4-5.5",
  },
  {
    title: "Pitch in your voice",
    desc: "A personalized first pitch — an email or a DM — written as if you wrote it yourself. Never generic, never robotic.",
    icon: "M3 6.5 12 13l9-6.5 M3 5h18v14H3z",
  },
  {
    title: "Price the deal",
    desc: "A scoped, priced proposal grounded in your real audience, rates, and past deals — no guesswork.",
    icon: "M4 20l1-4L15.4 5.6a1.5 1.5 0 0 1 2.1 0l.9.9a1.5 1.5 0 0 1 0 2.1L8 19l-4 1Z",
  },
  {
    title: "Follow up",
    desc: "When a brand goes quiet, your Follow-up agent sends a short, warm nudge that builds on what you already said.",
    icon: "M12 8v4l3 3 M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z",
  },
  {
    title: "Book the call",
    desc: "Book a brand call just by describing it in plain English, or straight from a deal — it lands right on your calendar.",
    icon: "M3.5 5h17v15.5H3.5z M3.5 9.5h17 M8 3v4 M16 3v4",
  },
  {
    title: "Watch it all happen",
    desc: "Your signature dashboard shows your whole team at work — live, in real time — plus your numbers, day by day.",
    icon: "M12 3v18 M3 12h18",
  },
];

const STEPS = [
  { n: "1", title: "Build your Media Kit", desc: "Tell us your niche, your audience, your platforms, and your rates. This is what every helper grounds its work on." },
  { n: "2", title: "Meet your AI team", desc: "Five ready-made agents — Research, Outreach, Proposal, Follow-up, and Scheduler — start working for you immediately." },
  { n: "3", title: "They find and pitch brands", desc: "Brands land in a Pending list for your approval, then your team drafts personalized pitches in your voice." },
  { n: "4", title: "You approve, they close", desc: "Review pitches and proposals, send them from your own inbox, and let your team follow up and book the call." },
];

const glassEdge = "rgba(186,215,247,.12)";
const glassCard = "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillGhost = "font-family:'Inter',sans-serif;font-weight:500;color:#ffffff;background:rgba(186,214,247,.06);border-radius:999px;cursor:pointer;transition:background .12s;box-shadow:inset 0 0 0 1px " + glassEdge;
const pillOutlined = "font-family:'Inter',sans-serif;font-weight:500;color:#d1e4fa;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;box-shadow:inset 0 0 0 1px " + glassEdge;
const pillPrimary = "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4)";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";

function Eyebrow({ label }: { label: string }) {
  return (
    <div style={css("display:flex;align-items:center;gap:14px;width:100%;max-width:420px;margin:0 auto")}>
      <div style={css("flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(186,215,247,.12))")} />
      <div style={css("font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:400;letter-spacing:.1em;color:#c7d3ea;white-space:nowrap")}>{label}</div>
      <div style={css("flex:1;height:1px;background:linear-gradient(90deg,rgba(186,215,247,.12),transparent)")} />
    </div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  return (
    <main style={css("position:relative;z-index:1;min-height:100dvh;display:flex;flex-direction:column")}>
      {/* nav */}
      <nav style={css("display:flex;align-items:center;justify-content:space-between;padding:18px 26px;max-width:1200px;width:100%;margin:0 auto")}>
        <div style={css("font-family:'Inter',sans-serif;font-weight:500;font-size:16px;color:#d1e4fa")}>Agentic Sales Team</div>
        <div style={css("display:flex;align-items:center;gap:10px")}>
          {!isLoaded ? null : isSignedIn ? (
            <>
              <Box as="span" onClick={() => router.push("/dashboard")} style={pillOutlined + ";font-size:13.5px;padding:8px 16px"} styleHover="background:rgba(186,214,247,.06)">
                Dashboard
              </Box>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <>
              <Box as="span" onClick={() => router.push("/sign-in")} style={pillOutlined + ";font-size:13.5px;padding:8px 16px"} styleHover="background:rgba(186,214,247,.06)">
                Log in
              </Box>
              <Box as="span" onClick={() => router.push("/sign-up")} style={pillPrimary + ";font-size:13.5px;padding:8px 16px"} styleHover={pillPrimaryHover}>
                Sign up
              </Box>
            </>
          )}
        </div>
      </nav>

      {/* hero */}
      <section style={css("padding:24px 26px 16px;max-width:1200px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:26px")}>
        <div style={css("max-width:780px;display:flex;flex-direction:column;gap:20px;animation:fadeUp .3s ease")}>
          <div style={css("display:inline-flex;align-items:center;gap:7px;font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:500;letter-spacing:.08em;color:#c7d3ea;background:rgba(186,214,247,.06);border-radius:999px;padding:5px 13px;width:fit-content;box-shadow:inset 0 0 0 1px " + glassEdge)}>
            <span style={css("width:6px;height:6px;border-radius:50%;background:#269684;animation:pulse 2s infinite")} />
            AI-POWERED BRAND DEALS
          </div>
          <div
            style={{
              ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(36px,6.2vw,68px);line-height:1.02;letter-spacing:-.03em"),
              background: "linear-gradient(180deg,#d8ecf8 0%,#98c0ef 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Your AI sales team, always working the room
          </div>
          <div style={css("font-family:'Inter',sans-serif;font-size:17.5px;line-height:1.6;color:#c7d3ea;max-width:600px")}>
            Agentic Sales Team finds brands, pitches them as you, prices the deal, follows up, and books the call —
            so you can spend your time making content, not chasing sponsors.
          </div>
        </div>

        <OrbitDashboard agents={demoAgents} teams={demoTeams} stats={demoStats} activity={demoActivity} />
      </section>

      {/* features */}
      <section style={css("padding:120px 26px;max-width:1200px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:48px")}>
        <div style={css("display:flex;flex-direction:column;gap:18px;align-items:center;text-align:center")}>
          <Eyebrow label="EVERY STAGE OF THE DEAL" />
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(28px,3.4vw,42px);color:#d8ecf8;letter-spacing:-.01em")}>One team, start to finish</div>
          <div style={css("font-family:'Inter',sans-serif;font-size:16px;color:#c7d3ea;line-height:1.6;max-width:520px")}>Each agent does one job well — together they cover a brand deal end to end.</div>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px")}>
          {FEATURES.map((f) => (
            <Box key={f.title} style={glassCard + ";padding:28px;display:flex;flex-direction:column;gap:16px;transition:transform .15s,background .15s"} styleHover="background:rgba(186,214,247,.06);transform:translateY(-3px)">
              <div style={css("width:56px;height:56px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px " + glassEdge)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={f.icon} />
                </svg>
              </div>
              <div style={css("font-family:'Inter',sans-serif;font-size:17px;font-weight:600;color:#ffffff")}>{f.title}</div>
              <div style={css("font-family:'Inter',sans-serif;font-size:14px;line-height:1.6;color:#9da7ba")}>{f.desc}</div>
            </Box>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section style={css("padding:120px 26px;max-width:1200px;width:100%;margin:0 auto;display:flex;flex-direction:column;gap:48px")}>
        <div style={css("display:flex;flex-direction:column;gap:18px;align-items:center;text-align:center")}>
          <Eyebrow label="HOW IT WORKS" />
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(28px,3.4vw,42px);color:#d8ecf8;letter-spacing:-.01em")}>Four steps to a booked call</div>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:22px")}>
          {STEPS.map((s) => (
            <div key={s.n} style={css("display:flex;flex-direction:column;gap:12px")}>
              <div style={css("width:38px;height:38px;border-radius:50%;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px " + glassEdge + ";display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-weight:500;color:#d1e4fa;font-size:15px")}>
                {s.n}
              </div>
              <div style={css("font-family:'Inter',sans-serif;font-size:16px;font-weight:600;color:#ffffff")}>{s.title}</div>
              <div style={css("font-family:'Inter',sans-serif;font-size:14px;line-height:1.6;color:#9da7ba")}>{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* who it's for */}
      <section style={css("padding:120px 26px;max-width:1200px;width:100%;margin:0 auto;display:flex;justify-content:center")}>
        <div style={css(glassCard + ";padding:52px;display:flex;flex-direction:column;gap:18px;max-width:680px;align-items:center;text-align:center")}>
          <Eyebrow label="WHO IT'S FOR" />
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:500;font-size:clamp(24px,2.8vw,32px);color:#d8ecf8;letter-spacing:-.01em")}>Built for creators, not managers</div>
          <div style={css("font-family:'Inter',sans-serif;font-size:16px;line-height:1.7;color:#c7d3ea")}>
            If you're a content creator who wants brand deals but doesn't have a manager — or the hours — to chase
            them, Agentic Sales Team is the manager. You bring the audience; your AI team handles the busywork of
            finding, pitching, pricing, and following up.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={css("padding:140px 26px;max-width:1200px;width:100%;margin:0 auto;display:flex;flex-direction:column;align-items:center;gap:26px;text-align:center")}>
        <Eyebrow label="GET STARTED" />
        <div
          style={{
            ...css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:clamp(32px,5vw,56px);line-height:1.05;letter-spacing:-.02em;max-width:640px"),
            background: "linear-gradient(180deg,#d8ecf8 0%,#98c0ef 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Ready to put your deals on autopilot?
        </div>
        <Box as="span" onClick={() => router.push(isSignedIn ? "/dashboard" : "/sign-up")} style={pillPrimary + ";font-size:15.5px;padding:14px 30px"} styleHover={pillPrimaryHover}>
          {isSignedIn ? "Go to dashboard" : "Sign up free"}
        </Box>
      </section>

      {/* footer */}
      <footer style={css("padding:26px;max-width:1200px;width:100%;margin:0 auto;display:flex;align-items:center;justify-content:space-between;border-top:1px solid rgba(186,215,247,.12)")}>
        <div style={css("font-family:'Inter',sans-serif;font-weight:500;font-size:14px;color:#d1e4fa")}>Agentic Sales Team</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba")}>© {new Date().getFullYear()} Agentic Sales Team</div>
      </footer>
    </main>
  );
}
