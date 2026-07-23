"use client";
import { css } from "@/components/primitives";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";

export default function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div style={css("flex:1;display:flex;align-items:center;justify-content:center")}>
      <div style={css(glassCard + ";padding:48px;max-width:480px;text-align:center;display:flex;flex-direction:column;gap:12px")}>
        <div style={css("font-family:'JetBrains Mono',monospace;font-size:11.5px;font-weight:500;letter-spacing:.1em;color:#9da7ba")}>
          COMING SOON
        </div>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>{title}</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:14.5px;line-height:1.6;color:#c7d3ea")}>{description}</div>
      </div>
    </div>
  );
}
