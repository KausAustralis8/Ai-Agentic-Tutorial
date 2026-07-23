"use client";
import { useState, useTransition } from "react";
import { saveProfile } from "@/lib/profile/actions";
import { css, Box } from "@/components/primitives";
import type { CreatorProfileData, PlatformEntry } from "@/lib/profile/types";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillPrimary =
  "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4);padding:11px 26px;font-size:14px;border:none";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";
const pillGhost =
  "font-family:'Inter',sans-serif;font-weight:500;color:#c7d3ea;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:10px 20px;font-size:13.5px;box-shadow:inset 0 0 0 1px " +
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:16px")}>
      <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d8ecf8")}>{title}</div>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={css("display:flex;flex-direction:column;gap:7px")}>
      <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#c7d3ea")}>{label}</div>
      {children}
    </div>
  );
}

const emptyPlatformRow = (): PlatformEntry => ({ platform: "", handle: "", followers: "", engagementRate: "" });

export default function ProfileEditor({ initial }: { initial: CreatorProfileData }) {
  const [niche, setNiche] = useState(initial.niche);
  const [bio, setBio] = useState(initial.bio);
  const [platforms, setPlatforms] = useState<PlatformEntry[]>(initial.platforms.length ? initial.platforms : [emptyPlatformRow()]);
  const [age, setAge] = useState(initial.audience.age);
  const [geo, setGeo] = useState(initial.audience.geo);
  const [gender, setGender] = useState(initial.audience.gender);
  const [tone, setTone] = useState(initial.tone);
  const [pastDeals, setPastDeals] = useState(initial.pastDeals);
  const [rateFloor, setRateFloor] = useState(initial.rateFloor);
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  const updateRow = (i: number, field: keyof PlatformEntry, value: string) => {
    setPlatforms((prev) => prev.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)));
  };
  const addRow = () => setPlatforms((prev) => [...prev, emptyPlatformRow()]);
  const removeRow = (i: number) => setPlatforms((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  function handleSave() {
    const data: CreatorProfileData = {
      niche,
      bio,
      platforms: platforms.filter((p) => p.platform.trim()),
      audience: { age, geo, gender },
      tone,
      pastDeals,
      rateFloor,
    };
    setSaved(false);
    startTransition(async () => {
      await saveProfile(data);
      setSaved(true);
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:18px;max-width:720px")}>
      <div>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>Your Media Kit</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:14px;color:#9da7ba;margin-top:6px")}>
          This is what every AI helper grounds its work on — keep it up to date.
        </div>
      </div>

      <Section title="The basics">
        <Field label="Your niche">
          <input style={inputStyle} value={niche} onChange={(e) => setNiche(e.target.value)} placeholder="e.g. Fitness, beauty, gaming, travel" />
        </Field>
        <Field label="Bio">
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" as const, fontFamily: "Inter, sans-serif" }}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="A couple of sentences about you and your content"
          />
        </Field>
      </Section>

      <Section title="Platforms">
        {platforms.map((p, i) => (
          <div key={i} style={css("display:flex;flex-direction:column;gap:10px;padding:16px;border-radius:12px;background:rgba(186,214,247,.03);box-shadow:inset 0 0 0 1px " + glassEdge)}>
            <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}>
              <input style={inputStyle} value={p.platform} onChange={(e) => updateRow(i, "platform", e.target.value)} placeholder="Platform (e.g. TikTok)" />
              <input style={inputStyle} value={p.handle} onChange={(e) => updateRow(i, "handle", e.target.value)} placeholder="Handle (e.g. @you)" />
            </div>
            <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}>
              <input style={inputStyle} value={p.followers} onChange={(e) => updateRow(i, "followers", e.target.value)} placeholder="Followers (e.g. 42k)" />
              <input style={inputStyle} value={p.engagementRate} onChange={(e) => updateRow(i, "engagementRate", e.target.value)} placeholder="Engagement rate (e.g. 4.5%)" />
            </div>
            {platforms.length > 1 && (
              <Box onClick={() => removeRow(i)} style="align-self:flex-end;font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba;cursor:pointer" styleHover="color:#e46d4c">
                Remove
              </Box>
            )}
          </div>
        ))}
        <Box onClick={addRow} style={pillGhost + ";align-self:flex-start"} styleHover="background:rgba(186,214,247,.06)">
          + Add another platform
        </Box>
      </Section>

      <Section title="Audience & tone">
        <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:14px")}>
          <Field label="Audience age range">
            <input style={inputStyle} value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 18-24" />
          </Field>
          <Field label="Audience location">
            <input style={inputStyle} value={geo} onChange={(e) => setGeo(e.target.value)} placeholder="e.g. mostly US & UK" />
          </Field>
        </div>
        <Field label="Audience gender split">
          <input style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g. 65% women, 35% men" />
        </Field>
        <Field label="Your tone / vibe">
          <input style={inputStyle} value={tone} onChange={(e) => setTone(e.target.value)} placeholder="e.g. warm, funny, straight-talking" />
        </Field>
      </Section>

      <Section title="Deals & rates">
        <Field label="Your rate floor">
          <input style={inputStyle} value={rateFloor} onChange={(e) => setRateFloor(e.target.value)} placeholder="e.g. $500 per post minimum" />
        </Field>
        <Field label="Deals you've done before">
          <textarea
            style={{ ...inputStyle, minHeight: 90, resize: "vertical" as const, fontFamily: "Inter, sans-serif" }}
            value={pastDeals}
            onChange={(e) => setPastDeals(e.target.value)}
            placeholder="Brands you've worked with, and what you did for them"
          />
        </Field>
      </Section>

      <div style={css("display:flex;align-items:center;gap:14px")}>
        <Box onClick={handleSave} style={pillPrimary + (isPending ? ";opacity:.6;cursor:wait" : "")} styleHover={isPending ? undefined : pillPrimaryHover}>
          {isPending ? "Saving…" : "Save changes"}
        </Box>
        {saved && !isPending && (
          <span style={css("font-family:'Inter',sans-serif;font-size:13px;color:#7ee2a8")}>Saved!</span>
        )}
      </div>
    </div>
  );
}
