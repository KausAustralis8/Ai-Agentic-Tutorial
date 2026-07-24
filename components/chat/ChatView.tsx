"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css, Box } from "@/components/primitives";
import { av } from "@/lib/visuals";
import { sendChatMessage } from "@/lib/chat/actions";
import type { ChatMessageView } from "@/lib/chat/types";
import type { AgentView } from "@/lib/agents/types";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillPrimary =
  "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4);padding:10px 22px;font-size:13.5px;border:none;white-space:nowrap";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";

const inputStyle: React.CSSProperties = {
  fontFamily: "Inter, sans-serif",
  fontSize: 14,
  color: "#ffffff",
  background: "rgba(186,214,247,.06)",
  border: "none",
  boxShadow: "inset 0 0 0 1px " + glassEdge,
  borderRadius: 999,
  padding: "12px 18px",
  outline: "none",
  width: "100%",
};

let tempId = -1;

export default function ChatView({ initialMessages, agents }: { initialMessages: ChatMessageView[]; agents: AgentView[] }) {
  const router = useRouter();
  const [messages, setMessages] = useState(initialMessages);
  const [text, setText] = useState("");
  const [sending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const byId = (id: string | null) => (id ? agents.find((a) => a.id === id) : undefined);

  function handleSend() {
    const value = text.trim();
    if (!value || sending) return;
    setText("");
    setMessages((prev) => [...prev, { id: tempId--, agentId: null, who: "me", text: value, createdAt: new Date().toISOString() }]);

    startTransition(async () => {
      const replies = await sendChatMessage(value);
      if (replies.length) {
        setMessages((prev) => [
          ...prev,
          ...replies.map((r) => ({ id: tempId--, agentId: r.agentId, who: "ai" as const, text: r.text, createdAt: new Date().toISOString() })),
        ]);
      }
      router.refresh();
    });
  }

  function mentionAgent(a: AgentView) {
    const first = a.name.split(" ")[0];
    setText((prev) => (prev.trim() ? prev.trim() + " " : "") + `@${first} `);
  }

  function mentionEveryone() {
    setText((prev) => (prev.trim() ? prev.trim() + " " : "") + "@everyone ");
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:18px;flex:1;min-height:0")}>
      <div>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>Chat</div>
        <div style={css("font-family:'Inter',sans-serif;font-size:14px;color:#9da7ba;margin-top:6px")}>
          Mention a teammate with @ and tell them what you need.
        </div>
      </div>

      <div style={css("display:flex;gap:8px;flex-wrap:wrap;flex:none")}>
        <Box
          onClick={mentionEveryone}
          style={
            "display:flex;align-items:center;gap:6px;font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#ffffff;background:rgba(102,58,243,.25);border-radius:999px;padding:5px 12px;cursor:pointer;box-shadow:inset 0 0 0 1px rgba(102,58,243,.5)"
          }
          styleHover="background:rgba(102,58,243,.35)"
        >
          @everyone
        </Box>
        {agents.map((a) => (
          <Box
            key={a.id}
            onClick={() => mentionAgent(a)}
            style={
              "display:flex;align-items:center;gap:6px;font-family:'Inter',sans-serif;font-size:12px;font-weight:500;color:#c7d3ea;background:rgba(186,214,247,.06);border-radius:999px;padding:5px 12px 5px 5px;cursor:pointer;box-shadow:inset 0 0 0 1px " +
              glassEdge
            }
            styleHover="background:rgba(186,214,247,.12)"
          >
            <span style={css(av(a, 18))}>{!a.avatarUrl && a.initials}</span>@{a.name.split(" ")[0]}
          </Box>
        ))}
      </div>

      <div style={css(glassCard + ";padding:20px;display:flex;flex-direction:column;gap:14px;flex:1;min-height:0;overflow-y:auto")}>
        {messages.length === 0 && (
          <div style={css("font-family:'Inter',sans-serif;font-size:13.5px;color:#9da7ba")}>
            Try: &ldquo;@Research find me some fitness brands&rdquo;
          </div>
        )}
        {messages.map((m) => {
          const agent = byId(m.agentId);
          const isMe = m.who === "me";
          return (
            <div key={m.id} style={css("display:flex;flex-direction:column;gap:5px;align-items:" + (isMe ? "flex-end" : "flex-start"))}>
              {!isMe && agent && (
                <div style={css("display:flex;align-items:center;gap:6px")}>
                  <span style={css(av(agent, 18))}>{!agent.avatarUrl && agent.initials}</span>
                  <span style={css("font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#c7d3ea")}>{agent.name}</span>
                </div>
              )}
              <div
                style={css(
                  "max-width:min(640px,78%);padding:10px 14px;border-radius:14px;font-family:'Inter',sans-serif;font-size:13.5px;line-height:1.5;" +
                    (isMe
                      ? "background:#663af3;color:#ffffff;border-bottom-right-radius:4px"
                      : "background:rgba(186,214,247,.06);color:#d1e4fa;border-bottom-left-radius:4px;box-shadow:inset 0 0 0 1px " + glassEdge)
                )}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        {sending && (
          <div style={css("display:flex;flex-direction:column;gap:5px;align-items:flex-start")}>
            <div
              style={css(
                "display:flex;align-items:center;gap:5px;padding:12px 16px;border-radius:14px;border-bottom-left-radius:4px;background:rgba(186,214,247,.06);box-shadow:inset 0 0 0 1px " +
                  glassEdge
              )}
            >
              <span style={css("width:6px;height:6px;border-radius:50%;background:#c7d3ea;animation:pulse 1.1s ease-in-out infinite")} />
              <span style={css("width:6px;height:6px;border-radius:50%;background:#c7d3ea;animation:pulse 1.1s ease-in-out .18s infinite")} />
              <span style={css("width:6px;height:6px;border-radius:50%;background:#c7d3ea;animation:pulse 1.1s ease-in-out .36s infinite")} />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={css("display:flex;gap:10px;flex:none")}>
        <input
          style={inputStyle}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='e.g. "@Research find me some fitness brands"'
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <Box
          onClick={handleSend}
          style={pillPrimary + (sending ? ";opacity:.6;cursor:wait" : "")}
          styleHover={sending ? undefined : pillPrimaryHover}
        >
          Send
        </Box>
      </div>
    </div>
  );
}
