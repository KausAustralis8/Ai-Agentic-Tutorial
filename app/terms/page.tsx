export const metadata = { title: "Terms of Service — Twilight Agents" };

const glassEdge = "rgba(186,215,247,.12)";

export default function TermsPage() {
  return (
    <main
      style={{
        position: "relative",
        zIndex: 1,
        minHeight: "100dvh",
        display: "flex",
        justifyContent: "center",
        padding: "60px 24px",
      }}
    >
      <div style={{ maxWidth: 720, width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
        <div>
          <a href="/" style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#9da7ba" }}>
            &larr; Back to Twilight Agents
          </a>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 32, color: "#d8ecf8", marginTop: 16 }}>
            Terms of Service
          </h1>
          <p style={{ fontFamily: "Inter, sans-serif", fontSize: 13, color: "#9da7ba" }}>Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            fontFamily: "Inter, sans-serif",
            fontSize: 14.5,
            lineHeight: 1.7,
            color: "#c7d3ea",
            background: "rgba(186,214,247,.03)",
            borderRadius: 16,
            padding: 32,
            boxShadow: `inset 0 0 0 1px ${glassEdge}`,
          }}
        >
          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>1. Acceptance of terms</h2>
            <p>By creating an account or using Twilight Agents (&quot;the Service&quot;), you agree to these Terms of Service. If you don&apos;t agree, please don&apos;t use the Service.</p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>2. What the Service does</h2>
            <p>
              Twilight Agents is a tool that helps content creators find, research, pitch, price, follow up with, and book calls with
              brands, using AI helpers grounded in a profile you provide (your &quot;Media Kit&quot;). Outbound messages the Service
              drafts are suggestions — you review and send them yourself; the Service does not send anything on your behalf.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>3. Your account and content</h2>
            <p>
              You&apos;re responsible for the accuracy of the information you provide (your Media Kit, brand/deal records, and any
              messages you choose to send) and for keeping your account credentials secure. You retain ownership of the content you
              create; you grant the Service permission to process it as needed to provide the features you use.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>4. AI-generated content</h2>
            <p>
              Pitches, proposals, briefs, and follow-ups are drafted by AI and may contain errors or inaccuracies. Review everything
              before you send it — you are solely responsible for any message you actually send to a brand.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>5. Acceptable use</h2>
            <p>
              Don&apos;t use the Service to send spam, harass anyone, break the law, or violate the terms of any connected
              third-party service (including TikTok, Google, and any brand you contact).
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>6. Third-party services</h2>
            <p>
              The Service relies on third-party providers to operate — including authentication (Clerk), database hosting (Neon), AI
              processing (Google Gemini), web search (Firecrawl), and, if you connect it, TikTok&apos;s Login Kit. Your use of those
              integrations is also subject to those providers&apos; own terms.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>7. Termination</h2>
            <p>You can stop using the Service and delete your account at any time. We may suspend accounts that violate these terms.</p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>8. No warranty</h2>
            <p>
              The Service is provided &quot;as is,&quot; without warranties of any kind. We&apos;re not liable for any losses arising
              from your use of the Service, including decisions made based on AI-generated content.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>9. Changes</h2>
            <p>These terms may be updated from time to time. Continuing to use the Service after a change means you accept the update.</p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>10. Contact</h2>
            <p>Questions about these terms? Reach out at kaus.australis31@gmail.com.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
