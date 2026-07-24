"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { css, Box } from "@/components/primitives";
import { dismissAllActivity } from "@/lib/activity/actions";
import type { ActivityItem } from "@/lib/activity/store";
import type { AgentView } from "@/lib/agents/types";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "M12 3v18 M3 12h18" },
  { href: "/deals", label: "Deals", icon: "M4 20l1-4L15.4 5.6a1.5 1.5 0 0 1 2.1 0l.9.9a1.5 1.5 0 0 1 0 2.1L8 19l-4 1Z M13.5 7.5l3 3" },
  { href: "/agents", label: "Agents", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M4.5 20.5c0-4 3.4-6.5 7.5-6.5s7.5 2.5 7.5 6.5" },
  { href: "/chat", label: "Chat", icon: "M4 4.5h16v12H8.5l-4.5 4Z" },
  { href: "/calendar", label: "Calendar", icon: "M3.5 5h17v15.5H3.5z M3.5 9.5h17 M8 3v4 M16 3v4" },
  { href: "/analytics", label: "Analytics", icon: "M4 5v15h16 M7.5 14.5l3-3.5 3 2 4-5.5" },
  { href: "/profile", label: "Profile", icon: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z M5 20.5c1.4-3.6 4.4-5.7 7-5.7s5.6 2.1 7 5.7" },
  {
    href: "/settings",
    label: "Settings",
    icon: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.5a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z",
  },
];

const glassEdge = "rgba(186,215,247,.12)";

export default function AppFrame({
  userName,
  notifications = [],
  agents = [],
  children,
}: {
  userName: string;
  notifications?: ActivityItem[];
  agents?: AgentView[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isNarrow, setIsNarrow] = useState(false);
  const [query, setQuery] = useState("");
  const [bellOpen, setBellOpen] = useState(false);
  const [items, setItems] = useState(notifications);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(notifications);
  }, [notifications]);

  useEffect(() => {
    const on = () => setIsNarrow(window.innerWidth < 900);
    on();
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setBellOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!bellOpen) return;
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [bellOpen]);

  function agentName(agentId: string | null) {
    if (!agentId) return null;
    return agents.find((a) => a.id === agentId)?.name ?? null;
  }

  async function handleClearAll() {
    setItems([]);
    await dismissAllActivity();
  }

  const sidebarWidth = 236;
  const sidebarTransform = isNarrow ? (mobileOpen ? "translateX(0)" : "translateX(-100%)") : "translateX(0)";

  return (
    <div style={css("min-height:100dvh;position:relative;z-index:1")}>
      {isNarrow && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={css("position:fixed;inset:0;background:rgba(5,6,15,.6);z-index:8")} />
      )}

      <aside
        style={css(
          "position:fixed;left:0;top:0;bottom:0;width:" +
            sidebarWidth +
            "px;background:rgba(8,10,20,.96);border-right:1px solid " +
            glassEdge +
            ";z-index:9;display:flex;flex-direction:column;gap:4px;padding:20px 14px;overflow-y:auto;transition:transform .2s ease;transform:" +
            sidebarTransform
        )}
      >
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d1e4fa;padding:6px 10px 18px")}>
          Twilight Agents
        </div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Box
              key={item.href}
              onClick={() => router.push(item.href)}
              style={
                "display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;font-family:'Inter',sans-serif;font-size:14px;font-weight:500;transition:background .12s;" +
                (active
                  ? "background:rgba(102,58,243,.16);color:#ffffff;box-shadow:inset 0 0 0 1px rgba(102,58,243,.4)"
                  : "color:#c7d3ea;background:transparent")
              }
              styleHover={active ? undefined : "background:rgba(186,214,247,.06)"}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={active ? "#ffffff" : "#9da7ba"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {item.label}
            </Box>
          );
        })}
      </aside>

      <div
        style={css(
          "transition:margin .2s ease;margin-left:" + (isNarrow ? 0 : sidebarWidth) + "px;min-height:100dvh;display:flex;flex-direction:column"
        )}
      >
        <header style={css("display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 22px;border-bottom:1px solid " + glassEdge)}>
          <div style={css("display:flex;align-items:center;gap:12px")}>
            {isNarrow && (
              <Box
                onClick={() => setMobileOpen((v) => !v)}
                style={"width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px " + glassEdge}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M4 6h16 M4 12h16 M4 18h16" />
                </svg>
              </Box>
            )}
            <div style={css("position:relative;display:flex;align-items:center")}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9da7ba" strokeWidth="1.8" style={{ position: "absolute", left: 12, pointerEvents: "none" }}>
                <circle cx="10.5" cy="10.5" r="6" />
                <path d="m20 20-5-5" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brands, agents…"
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 13.5,
                  color: "#ffffff",
                  background: "rgba(186,214,247,.06)",
                  border: "none",
                  boxShadow: "inset 0 0 0 1px " + glassEdge,
                  borderRadius: 999,
                  padding: "9px 16px 9px 34px",
                  width: isNarrow ? 160 : 260,
                  outline: "none",
                }}
              />
            </div>
          </div>
          <div style={css("display:flex;align-items:center;gap:10px")}>
            <div ref={bellRef} style={css("position:relative")}>
              <Box
                onClick={() => setBellOpen((v) => !v)}
                style={"width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;position:relative;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px " + glassEdge}
                styleHover="background:rgba(186,214,247,.12)"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#d1e4fa" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
                  <path d="M10 20a2 2 0 0 0 4 0" />
                </svg>
                {items.length > 0 && (
                  <span
                    style={css(
                      "position:absolute;top:5px;right:5px;min-width:15px;height:15px;border-radius:999px;background:#e46d4c;color:#fff;font-family:'Inter',sans-serif;font-size:9.5px;font-weight:700;display:flex;align-items:center;justify-content:center;padding:0 3px"
                    )}
                  >
                    {items.length > 9 ? "9+" : items.length}
                  </span>
                )}
              </Box>
              {bellOpen && (
                <div
                  style={css(
                    "position:absolute;top:44px;right:0;width:320px;max-height:400px;overflow-y:auto;background:rgba(8,10,20,.98);border-radius:14px;box-shadow:inset 0 0 0 1px " +
                      glassEdge +
                      ", 0 24px 48px rgba(6,6,14,.7);z-index:20;display:flex;flex-direction:column"
                  )}
                >
                  <div style={css("display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid " + glassEdge)}>
                    <span style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#ffffff")}>Notifications</span>
                    {items.length > 0 && (
                      <Box onClick={handleClearAll} style="font-family:'Inter',sans-serif;font-size:12px;color:#9da7ba;cursor:pointer" styleHover="color:#d1e4fa">
                        Clear all
                      </Box>
                    )}
                  </div>
                  {items.length === 0 ? (
                    <div style={css("padding:20px;font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba;text-align:center")}>
                      Nothing new — you're all caught up.
                    </div>
                  ) : (
                    items.map((n) => (
                      <div key={n.id} style={css("padding:10px 14px;border-bottom:1px solid rgba(186,215,247,.06)")}>
                        <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#d1e4fa;line-height:1.4")}>
                          {agentName(n.agentId) && <span style={css("font-weight:600;color:#ffffff")}>{agentName(n.agentId)} </span>}
                          {n.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <span style={css("font-family:'Inter',sans-serif;font-size:13.5px;font-weight:600;color:#d1e4fa;white-space:nowrap")}>{userName}</span>
            <UserButton afterSignOutUrl="/" />
          </div>
        </header>
        <main style={css("flex:1;display:flex;flex-direction:column;padding:24px 26px;gap:18px")}>{children}</main>
      </div>
    </div>
  );
}
