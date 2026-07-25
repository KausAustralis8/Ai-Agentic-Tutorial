export const metadata = { title: "Privacy Policy — Twilight Agents" };

const glassEdge = "rgba(186,215,247,.12)";

export default function PrivacyPage() {
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
            Privacy Policy
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
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>1. What we collect</h2>
            <p>
              <strong>Account info:</strong> your name and email, handled by our authentication provider, Clerk.
              <br />
              <strong>Your Media Kit:</strong> niche, bio, platforms, audience details, tone, past deals, and rate floor — whatever you
              choose to enter.
              <br />
              <strong>Brand/deal data:</strong> brands you add or import, and any briefs, proposals, pitches, follow-ups, and calendar
              bookings the Service creates for them.
              <br />
              <strong>TikTok data (only if you connect it):</strong> your TikTok profile photo, display name, and public follower
              stats, used to auto-fill your Media Kit.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>2. How we use it</h2>
            <p>
              We use this data to run the Service you asked for: grounding AI-drafted pitches, briefs, proposals, and follow-ups in
              your real profile, showing your team and pipeline on your dashboard, and — only if you choose to make your account the
              site&apos;s public showcase — displaying a preview of your team publicly. We don&apos;t sell your data.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>3. Who we share it with</h2>
            <p>
              We use a small number of service providers to operate the Service, and your data passes through them as part of that:
              Clerk (accounts/authentication), Neon (database hosting), Google Gemini (AI text generation), Firecrawl (web search for
              brand discovery), and, if you connect it, TikTok (Login Kit). We don&apos;t sell or share your data with anyone else.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>4. Security</h2>
            <p>
              Data is stored in a managed Postgres database. OAuth refresh tokens (like TikTok&apos;s) are encrypted at rest before
              storage and are never sent to your browser. Every table is scoped to your account — other users can&apos;t see your
              data.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>5. Your choices</h2>
            <p>
              You can edit or delete your Media Kit, brands, and other records at any time from within the app. To disconnect TikTok,
              revoke access from your TikTok account settings. To request full account deletion, email us at the address below.
            </p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>6. Cookies</h2>
            <p>We use session cookies (via Clerk) to keep you signed in. We don&apos;t use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>7. Children&apos;s privacy</h2>
            <p>The Service is not directed at children under 13, and we don&apos;t knowingly collect data from them.</p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>8. Changes</h2>
            <p>We may update this policy from time to time. We&apos;ll update the date at the top when we do.</p>
          </section>

          <section>
            <h2 style={{ color: "#ffffff", fontSize: 17, fontFamily: "'Space Grotesk', sans-serif" }}>9. Contact</h2>
            <p>Questions, or want your data deleted? Email kaus.australis31@gmail.com.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
