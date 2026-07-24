"use client";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css, Box } from "@/components/primitives";
import { bookMeetingFromText, bookMeetingManual } from "@/lib/meetings/actions";
import type { MeetingView } from "@/lib/meetings/types";
import type { AgentView } from "@/lib/agents/types";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillPrimary =
  "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4);padding:10px 22px;font-size:13.5px;border:none;white-space:nowrap";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";
const pillGhost =
  "font-family:'Inter',sans-serif;font-weight:500;color:#c7d3ea;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:9px 18px;font-size:13px;box-shadow:inset 0 0 0 1px " +
  glassEdge;
const navBtn =
  "width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;cursor:pointer;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px " +
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

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function localKey(d: Date): string {
  return d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
}

function getMonthGrid(monthDate: Date): Date[] {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const start = new Date(year, month, 1 - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
}

function CalendarGrid({ meetings }: { meetings: MeetingView[] }) {
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const today = new Date();

  const byDay = useMemo(() => {
    const map = new Map<string, MeetingView[]>();
    for (const m of meetings) {
      const key = localKey(new Date(m.whenAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return map;
  }, [meetings]);

  const days = useMemo(() => getMonthGrid(cursor), [cursor]);
  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const selectedItems = selectedKey ? byDay.get(selectedKey) ?? [] : [];
  const selectedLabel = selectedKey
    ? days.find((d) => localKey(d) === selectedKey)?.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
    : null;

  return (
    <div style={css(glassCard + ";padding:20px;display:flex;flex-direction:column;gap:14px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px")}>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:18px;color:#d8ecf8")}>{monthLabel}</div>
        <div style={css("display:flex;align-items:center;gap:8px")}>
          <Box
            onClick={() => {
              const n = new Date();
              setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
              setSelectedKey(null);
            }}
            style={pillGhost + ";padding:6px 14px;font-size:12px"}
            styleHover="background:rgba(186,214,247,.06)"
          >
            Today
          </Box>
          <Box
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            style={navBtn}
            styleHover="background:rgba(186,214,247,.12)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7d3ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </Box>
          <Box
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            style={navBtn}
            styleHover="background:rgba(186,214,247,.12)"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c7d3ea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </Box>
        </div>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(7,1fr)")}>
        {WEEKDAYS.map((w) => (
          <div
            key={w}
            style={css(
              "font-family:'JetBrains Mono',monospace;font-size:10.5px;letter-spacing:.06em;color:#9da7ba;text-align:center;padding:4px 0"
            )}
          >
            {w}
          </div>
        ))}
      </div>

      <div
        style={css(
          "display:grid;grid-template-columns:repeat(7,1fr);gap:1px;background:" +
            glassEdge +
            ";border-radius:10px;overflow:hidden;box-shadow:inset 0 0 0 1px " +
            glassEdge
        )}
      >
        {days.map((d, i) => {
          const key = localKey(d);
          const inMonth = d.getMonth() === cursor.getMonth();
          const isToday = key === localKey(today);
          const isSelected = key === selectedKey;
          const items = byDay.get(key) ?? [];
          return (
            <Box
              key={i}
              onClick={() => setSelectedKey((prev) => (prev === key ? null : key))}
              style={
                "background:" +
                (isSelected ? "rgba(102,58,243,.14)" : "#05060f") +
                ";min-height:92px;padding:6px;display:flex;flex-direction:column;gap:4px;cursor:pointer;transition:background .12s;" +
                (inMonth ? "" : "opacity:.35")
              }
              styleHover={isSelected ? undefined : "background:rgba(186,214,247,.04)"}
            >
              <div
                style={css(
                  "width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;" +
                    (isToday ? "background:#663af3;color:#fff" : "color:#c7d3ea")
                )}
              >
                {d.getDate()}
              </div>
              <div style={css("display:flex;flex-direction:column;gap:3px")}>
                {items.slice(0, 2).map((m) => (
                  <div
                    key={m.id}
                    title={m.title}
                    style={css(
                      "font-family:'Inter',sans-serif;font-size:10.5px;font-weight:600;color:#fff;background:rgba(102,58,243,.35);border-radius:5px;padding:2px 6px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:inset 0 0 0 1px rgba(102,58,243,.5)"
                    )}
                  >
                    {m.title}
                  </div>
                ))}
                {items.length > 2 && (
                  <div style={css("font-family:'Inter',sans-serif;font-size:10px;color:#9da7ba;padding-left:4px")}>+{items.length - 2} more</div>
                )}
              </div>
            </Box>
          );
        })}
      </div>

      {selectedKey && (
        <div style={css("display:flex;flex-direction:column;gap:10px;padding-top:6px;border-top:1px solid " + glassEdge)}>
          <div style={css("font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.06em;color:#9da7ba;text-transform:uppercase")}>
            {selectedLabel}
          </div>
          {selectedItems.length === 0 ? (
            <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#9da7ba")}>No calls this day.</div>
          ) : (
            selectedItems.map((m) => (
              <div key={m.id} style={css("display:flex;align-items:center;justify-content:space-between;background:rgba(186,214,247,.04);border-radius:10px;padding:10px 14px;box-shadow:inset 0 0 0 1px " + glassEdge)}>
                <div style={css("font-family:'Inter',sans-serif;font-size:13.5px;font-weight:700;color:#ffffff")}>{m.title}</div>
                <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#c7d3ea")}>{m.whenLabel}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function CalendarView({ meetings, agents }: { meetings: MeetingView[]; agents: AgentView[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [needsManual, setNeedsManual] = useState(false);
  const [manualTitle, setManualTitle] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualTime, setManualTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const schedulerAgent = agents.find((a) => a.capabilities.includes("book-meeting"));

  function handleBook() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      const res = await bookMeetingFromText({ text, leadId: null, agentId: schedulerAgent?.id ?? null });
      if (res.ok) {
        setText("");
        setNeedsManual(false);
        router.refresh();
      } else if ("needsManual" in res && res.needsManual) {
        setNeedsManual(true);
        setManualTitle(text);
      } else {
        setError("Couldn't book that — try again.");
      }
    });
  }

  function handleManualBook() {
    if (!manualTitle.trim() || !manualDate || !manualTime) return;
    startTransition(async () => {
      const res = await bookMeetingManual({
        title: manualTitle,
        leadId: null,
        agentId: schedulerAgent?.id ?? null,
        whenAt: `${manualDate}T${manualTime}:00`,
      });
      if (res.ok) {
        setManualTitle("");
        setManualDate("");
        setManualTime("");
        setNeedsManual(false);
        setText("");
        router.refresh();
      }
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:28px;max-width:920px")}>
      <div>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>Calendar</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:14px;color:#9da7ba;margin-top:6px")}>Your booked brand calls.</div>
      </div>

      <div style={css(glassCard + ";padding:20px;display:flex;flex-direction:column;gap:12px")}>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d8ecf8")}>Book a call</div>
        <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          <input
            style={{ ...inputStyle, flex: 1, minWidth: 220 }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='e.g. "book a call with Acme next Tuesday at 2pm"'
            onKeyDown={(e) => e.key === "Enter" && !isPending && handleBook()}
          />
          <Box
            onClick={() => !isPending && handleBook()}
            style={pillPrimary + (isPending ? ";opacity:.6;cursor:wait" : "")}
            styleHover={isPending ? undefined : pillPrimaryHover}
          >
            {isPending ? "Booking…" : "Book"}
          </Box>
        </div>
        {error && <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#e46d4c")}>{error}</div>}
        {needsManual && (
          <div style={css("display:flex;flex-direction:column;gap:10px;padding-top:10px;border-top:1px solid " + glassEdge)}>
            <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba")}>
              Couldn't work that out automatically — enter it directly:
            </div>
            <input style={inputStyle} value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder="Who's the call with?" />
            <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:10px")}>
              <input
                type="date"
                style={{ ...inputStyle, accentColor: "#663af3" }}
                value={manualDate}
                onChange={(e) => setManualDate(e.target.value)}
              />
              <input
                type="time"
                style={{ ...inputStyle, accentColor: "#663af3" }}
                value={manualTime}
                onChange={(e) => setManualTime(e.target.value)}
              />
            </div>
            <Box
              onClick={() => !isPending && handleManualBook()}
              style={pillPrimary + ";align-self:flex-start" + (isPending ? ";opacity:.6;cursor:wait" : "")}
              styleHover={isPending ? undefined : pillPrimaryHover}
            >
              Book
            </Box>
          </div>
        )}
      </div>

      <CalendarGrid meetings={meetings} />
    </div>
  );
}
