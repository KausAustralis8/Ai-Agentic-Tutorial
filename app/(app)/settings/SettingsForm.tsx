"use client";
import { useState, useTransition } from "react";
import { updateNotificationSettings } from "@/lib/settings/actions";
import { css, Box } from "@/components/primitives";

const ITEMS: { key: string; label: string; desc: string }[] = [
  { key: "dealActivity", label: "Brand & deal activity", desc: "New brands, stage changes, and pending approvals." },
  { key: "pitchesAndProposals", label: "Pitches & proposals", desc: "When a draft is ready or sent." },
  { key: "meetings", label: "Booked calls", desc: "Reminders for upcoming brand calls." },
];

const glassEdge = "rgba(186,215,247,.12)";

export default function SettingsForm({ initialNotifications }: { initialNotifications: Record<string, boolean> }) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [, startTransition] = useTransition();

  function toggle(key: string) {
    const next = { ...notifications, [key]: !notifications[key] };
    setNotifications(next);
    startTransition(() => {
      updateNotificationSettings(next);
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 0 0 1px " + glassEdge)}>
      {ITEMS.map((item, i) => (
        <div
          key={item.key}
          style={css(
            "display:flex;align-items:center;justify-content:space-between;gap:16px;padding:18px 20px;" +
              (i < ITEMS.length - 1 ? "border-bottom:1px solid " + glassEdge : "")
          )}
        >
          <div>
            <div style={css("font-family:'Inter',sans-serif;font-size:14.5px;font-weight:600;color:#ffffff")}>{item.label}</div>
            <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#9da7ba;margin-top:3px")}>{item.desc}</div>
          </div>
          <Box
            onClick={() => toggle(item.key)}
            aria-label={item.label}
            style={
              "width:44px;height:26px;border-radius:999px;position:relative;cursor:pointer;transition:background .15s;flex:none;" +
              (notifications[item.key] ? "background:#663af3" : "background:rgba(186,214,247,.16)")
            }
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: notifications[item.key] ? 21 : 3,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "#ffffff",
                transition: "left .15s",
                boxShadow: "0 1px 3px rgba(0,0,0,.4)",
              }}
            />
          </Box>
        </div>
      ))}
    </div>
  );
}
