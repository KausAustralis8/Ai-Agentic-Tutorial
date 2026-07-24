"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { css, Box } from "@/components/primitives";
import { av } from "@/lib/visuals";
import { addLead, setLeadStage, acceptLead, rejectLead, importLeadsCsv } from "@/lib/leads/actions";
import { enqueueResearch, enqueueProposal, enqueueFollowup } from "@/lib/jobs/actions";
import { STAGES } from "@/lib/leads/types";
import type { LeadView, LeadStatus } from "@/lib/leads/types";
import type { AgentView } from "@/lib/agents/types";
import type { ProposalView } from "@/lib/proposals/types";
import type { DraftView } from "@/lib/outreach/types";

const glassEdge = "rgba(186,215,247,.12)";
const glassCard =
  "background:rgba(186,214,247,.03);border-radius:16px;box-shadow:inset 0 1px 1px rgba(199,211,234,.12), inset 0 24px 48px rgba(199,211,234,.05), 0 24px 32px rgba(6,6,14,.7)";
const pillPrimary =
  "font-family:'Inter',sans-serif;font-weight:600;color:#ffffff;background:#663af3;border-radius:999px;cursor:pointer;transition:all .15s;box-shadow:0 0 0 1px rgba(102,58,243,.5), 0 8px 24px rgba(102,58,243,.4);padding:10px 20px;font-size:13.5px;border:none";
const pillPrimaryHover = "background:#7a51f5;box-shadow:0 0 0 1px rgba(122,81,245,.7), 0 8px 32px rgba(102,58,243,.6)";
const pillGhost =
  "font-family:'Inter',sans-serif;font-weight:500;color:#c7d3ea;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:9px 18px;font-size:13px;box-shadow:inset 0 0 0 1px " +
  glassEdge;
const pillGood =
  "font-family:'Inter',sans-serif;font-weight:600;color:#7ee2a8;background:rgba(38,150,132,.12);border-radius:999px;cursor:pointer;transition:background .12s;padding:8px 16px;font-size:12.5px;box-shadow:inset 0 0 0 1px rgba(38,150,132,.35);border:none";
const pillDanger =
  "font-family:'Inter',sans-serif;font-weight:500;color:#e46d4c;background:transparent;border-radius:999px;cursor:pointer;transition:background .12s;padding:8px 16px;font-size:12.5px;box-shadow:inset 0 0 0 1px rgba(228,109,76,.35)";

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
const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "auto" as const };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={css("display:flex;flex-direction:column;gap:7px")}>
      <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:600;color:#c7d3ea")}>{label}</div>
      {children}
    </div>
  );
}

function AgentPicker({ agents, value, onChange }: { agents: AgentView[]; value: string; onChange: (v: string) => void }) {
  return (
    <select style={selectStyle} value={value} onChange={(e) => onChange(e.target.value)}>
      {agents.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name} — {a.role}
        </option>
      ))}
    </select>
  );
}

function AddLeadForm({ agents, onClose }: { agents: AgentView[]; onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [platform, setPlatform] = useState("");
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();
  const canSave = name.trim().length > 0;

  function handleSave() {
    startTransition(async () => {
      await addLead({ name, company, email, platform, agentId: agentId || null });
      router.refresh();
      onClose();
    });
  }

  return (
    <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:14px")}>
      <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d8ecf8")}>Add a brand</div>
      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px")}>
        <Field label="Brand / contact name">
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Glow Skincare" />
        </Field>
        <Field label="Company">
          <input style={inputStyle} value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Optional" />
        </Field>
      </div>
      <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px")}>
        <Field label="Email">
          <input style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Optional" />
        </Field>
        <Field label="Platform / profile">
          <input style={inputStyle} value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g. Instagram" />
        </Field>
      </div>
      <Field label="Assign to">
        <AgentPicker agents={agents} value={agentId} onChange={setAgentId} />
      </Field>
      <div style={css("display:flex;gap:12px;justify-content:flex-end")}>
        <Box onClick={onClose} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
          Cancel
        </Box>
        <Box
          onClick={() => canSave && !isPending && handleSave()}
          style={pillPrimary + (canSave && !isPending ? "" : ";opacity:.5;cursor:not-allowed")}
          styleHover={canSave && !isPending ? pillPrimaryHover : undefined}
        >
          {isPending ? "Adding…" : "Add brand"}
        </Box>
      </div>
    </div>
  );
}

function ImportCsvForm({ agents, onClose }: { agents: AgentView[]; onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [agentId, setAgentId] = useState(agents[0]?.id ?? "");
  const [result, setResult] = useState<{ imported: number; skipped: number } | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setCsvText(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  function handleImport() {
    startTransition(async () => {
      const r = await importLeadsCsv(csvText, agentId || null);
      setResult(r);
      router.refresh();
    });
  }

  return (
    <div style={css(glassCard + ";padding:24px;display:flex;flex-direction:column;gap:14px")}>
      <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:16px;color:#d8ecf8")}>Import a list</div>
      <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#9da7ba")}>
        A CSV file with columns like name, company, email, and platform.
      </div>
      <Box
        onClick={() => fileRef.current?.click()}
        style={pillGhost + ";width:fit-content"}
        styleHover="background:rgba(186,214,247,.06)"
      >
        {fileName || "Choose CSV file"}
      </Box>
      <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} style={{ display: "none" }} />
      <Field label="Assign all to">
        <AgentPicker agents={agents} value={agentId} onChange={setAgentId} />
      </Field>
      {result && (
        <div style={css("font-family:'Inter',sans-serif;font-size:13px;color:#7ee2a8")}>
          Imported {result.imported}, skipped {result.skipped}.
        </div>
      )}
      <div style={css("display:flex;gap:12px;justify-content:flex-end")}>
        <Box onClick={onClose} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
          Close
        </Box>
        <Box
          onClick={() => csvText && !isPending && handleImport()}
          style={pillPrimary + (csvText && !isPending ? "" : ";opacity:.5;cursor:not-allowed")}
          styleHover={csvText && !isPending ? pillPrimaryHover : undefined}
        >
          {isPending ? "Importing…" : "Import"}
        </Box>
      </div>
    </div>
  );
}

function LeadCard({
  lead,
  agent,
  proposal,
  followup,
}: {
  lead: LeadView;
  agent?: AgentView;
  proposal?: ProposalView;
  followup?: DraftView;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [writingBrief, setWritingBrief] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [writingProposal, setWritingProposal] = useState(false);
  const [showProposal, setShowProposal] = useState(false);
  const [writingFollowup, setWritingFollowup] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);

  function handleStage(status: LeadStatus) {
    startTransition(async () => {
      await setLeadStage(lead.id, status);
      router.refresh();
    });
  }

  async function handleWriteBrief() {
    setWritingBrief(true);
    const jobId = await enqueueResearch(lead.id, lead.agentId);
    if (jobId) await fetch("/api/jobs/run", { method: "POST" });
    router.refresh();
    setWritingBrief(false);
    setShowBrief(true);
  }

  async function handleDraftProposal() {
    setWritingProposal(true);
    const jobId = await enqueueProposal(lead.id, lead.agentId);
    if (jobId) await fetch("/api/jobs/run", { method: "POST" });
    router.refresh();
    setWritingProposal(false);
    setShowProposal(true);
  }

  async function handleWriteFollowup() {
    setWritingFollowup(true);
    const jobId = await enqueueFollowup(lead.id, lead.agentId);
    if (jobId) await fetch("/api/jobs/run", { method: "POST" });
    router.refresh();
    setWritingFollowup(false);
    setShowFollowup(true);
  }

  const mailtoHref = followup
    ? "mailto:" + (lead.email ?? "") + "?subject=" + encodeURIComponent(followup.subject ?? "") + "&body=" + encodeURIComponent(followup.body)
    : undefined;

  return (
    <div style={css(glassCard + ";padding:16px;display:flex;flex-direction:column;gap:10px")}>
      <div style={css("font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:#ffffff")}>{lead.name}</div>
      {lead.company && <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba")}>{lead.company}</div>}
      {lead.platform && <div style={css("font-family:'Inter',sans-serif;font-size:12px;color:#9da7ba")}>{lead.platform}</div>}
      {agent && (
        <div style={css("display:flex;align-items:center;gap:6px")}>
          <span style={css(av(agent, 18))}>{agent.initials}</span>
          <span style={css("font-family:'Inter',sans-serif;font-size:12px;color:#c7d3ea")}>{agent.name}</span>
        </div>
      )}
      <select
        style={{ ...selectStyle, fontSize: 12.5, padding: "7px 10px", opacity: isPending ? 0.5 : 1 }}
        value={lead.status}
        disabled={isPending}
        onChange={(e) => handleStage(e.target.value as LeadStatus)}
      >
        {STAGES.map((s) => (
          <option key={s.id} value={s.id}>
            {s.label}
          </option>
        ))}
      </select>

      {lead.research ? (
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          <Box
            onClick={() => setShowBrief((v) => !v)}
            style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#b6d9fc;cursor:pointer;width:fit-content"
            styleHover="color:#d1e4fa"
          >
            {showBrief ? "Hide brief" : "View brief"}
          </Box>
          {showBrief && (
            <div style={css("display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:rgba(186,214,247,.04);box-shadow:inset 0 0 0 1px " + glassEdge)}>
              <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#d1e4fa;line-height:1.5")}>{lead.research.summary}</div>
              <div>
                <div style={css("font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:#9da7ba")}>PRIORITIES</div>
                <ul style={css("margin:4px 0 0;padding-left:16px;font-family:'Inter',sans-serif;font-size:12px;color:#c7d3ea;line-height:1.6")}>
                  {lead.research.priorities.map((p, i) => (
                    <li key={i}>{p}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={css("font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:#9da7ba")}>HOOKS</div>
                <ul style={css("margin:4px 0 0;padding-left:16px;font-family:'Inter',sans-serif;font-size:12px;color:#c7d3ea;line-height:1.6")}>
                  {lead.research.hooks.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div style={css("font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:#9da7ba")}>ANGLE</div>
                <div style={css("font-family:'Inter',sans-serif;font-size:12px;color:#c7d3ea;line-height:1.5;margin-top:4px")}>{lead.research.angle}</div>
              </div>
            </div>
          )}
          <Box
            onClick={() => !writingBrief && handleWriteBrief()}
            style={pillGhost + ";font-size:11.5px;padding:6px 12px;width:fit-content" + (writingBrief ? ";opacity:.6;cursor:wait" : "")}
            styleHover={writingBrief ? undefined : "background:rgba(186,214,247,.06)"}
          >
            {writingBrief ? "Writing…" : "Refresh brief"}
          </Box>
        </div>
      ) : (
        <Box
          onClick={() => !writingBrief && handleWriteBrief()}
          style={pillGhost + ";font-size:12px;width:fit-content" + (writingBrief ? ";opacity:.6;cursor:wait" : "")}
          styleHover={writingBrief ? undefined : "background:rgba(186,214,247,.06)"}
        >
          {writingBrief ? "Writing brief…" : "Write brief"}
        </Box>
      )}

      {proposal ? (
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          <Box
            onClick={() => setShowProposal((v) => !v)}
            style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#b6d9fc;cursor:pointer;width:fit-content"
            styleHover="color:#d1e4fa"
          >
            {showProposal ? "Hide proposal" : "View proposal"}
          </Box>
          {showProposal && (
            <div style={css("display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:rgba(186,214,247,.04);box-shadow:inset 0 0 0 1px " + glassEdge)}>
              <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#ffffff")}>{proposal.title}</div>
              <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#d1e4fa;line-height:1.5;white-space:pre-wrap")}>{proposal.body}</div>
              {proposal.packages.length > 0 && (
                <div>
                  <div style={css("font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.06em;color:#9da7ba")}>PACKAGES</div>
                  <ul style={css("margin:4px 0 0;padding-left:16px;font-family:'Inter',sans-serif;font-size:12px;color:#c7d3ea;line-height:1.6")}>
                    {proposal.packages.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          <Box
            onClick={() => !writingProposal && handleDraftProposal()}
            style={pillGhost + ";font-size:11.5px;padding:6px 12px;width:fit-content" + (writingProposal ? ";opacity:.6;cursor:wait" : "")}
            styleHover={writingProposal ? undefined : "background:rgba(186,214,247,.06)"}
          >
            {writingProposal ? "Writing…" : "Refresh proposal"}
          </Box>
        </div>
      ) : (
        <Box
          onClick={() => !writingProposal && handleDraftProposal()}
          style={pillGhost + ";font-size:12px;width:fit-content" + (writingProposal ? ";opacity:.6;cursor:wait" : "")}
          styleHover={writingProposal ? undefined : "background:rgba(186,214,247,.06)"}
        >
          {writingProposal ? "Drafting proposal…" : "Draft proposal"}
        </Box>
      )}

      {followup ? (
        <div style={css("display:flex;flex-direction:column;gap:8px")}>
          <Box
            onClick={() => setShowFollowup((v) => !v)}
            style="font-family:'Inter',sans-serif;font-size:12px;font-weight:600;color:#b6d9fc;cursor:pointer;width:fit-content"
            styleHover="color:#d1e4fa"
          >
            {showFollowup ? "Hide follow-up" : "View follow-up"}
          </Box>
          {showFollowup && (
            <div style={css("display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:10px;background:rgba(186,214,247,.04);box-shadow:inset 0 0 0 1px " + glassEdge)}>
              {followup.subject && <div style={css("font-family:'Inter',sans-serif;font-size:13px;font-weight:700;color:#ffffff")}>{followup.subject}</div>}
              <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#d1e4fa;line-height:1.5;white-space:pre-wrap")}>{followup.body}</div>
              {mailtoHref && (
                <a href={mailtoHref} style={{ ...css(pillGhost + ";font-size:11.5px;padding:6px 12px;width:fit-content;text-decoration:none;display:inline-block") }}>
                  Open in mail app
                </a>
              )}
            </div>
          )}
          <Box
            onClick={() => !writingFollowup && handleWriteFollowup()}
            style={pillGhost + ";font-size:11.5px;padding:6px 12px;width:fit-content" + (writingFollowup ? ";opacity:.6;cursor:wait" : "")}
            styleHover={writingFollowup ? undefined : "background:rgba(186,214,247,.06)"}
          >
            {writingFollowup ? "Writing…" : "Write another follow-up"}
          </Box>
        </div>
      ) : (
        <Box
          onClick={() => !writingFollowup && handleWriteFollowup()}
          style={pillGhost + ";font-size:12px;width:fit-content" + (writingFollowup ? ";opacity:.6;cursor:wait" : "")}
          styleHover={writingFollowup ? undefined : "background:rgba(186,214,247,.06)"}
        >
          {writingFollowup ? "Writing follow-up…" : "Write follow-up"}
        </Box>
      )}
    </div>
  );
}

export default function DealsView({
  leads,
  agents,
  proposalsByLead,
  followupsByLead,
}: {
  leads: LeadView[];
  agents: AgentView[];
  proposalsByLead: Record<string, ProposalView>;
  followupsByLead: Record<string, DraftView>;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [discovering, setDiscovering] = useState(false);
  const [discoverResult, setDiscoverResult] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const byId = (id: string | null) => (id ? agents.find((a) => a.id === id) : undefined);
  const pending = leads.filter((l) => l.review === "pending");
  const accepted = leads.filter((l) => l.review === "accepted");
  const researchAgent = agents.find((a) => a.capabilities.includes("scrape"));

  async function handleDiscover() {
    setDiscovering(true);
    setDiscoverResult(null);
    const res = await fetch("/api/scrape", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId: researchAgent?.id ?? null }),
    });
    const data = await res.json().catch(() => ({ added: 0 }));
    setDiscoverResult(data.added ?? 0);
    router.refresh();
    setDiscovering(false);
  }

  function handleAccept(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await acceptLead(id);
      router.refresh();
      setBusyId(null);
    });
  }
  function handleReject(id: string) {
    setBusyId(id);
    startTransition(async () => {
      await rejectLead(id);
      router.refresh();
      setBusyId(null);
    });
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:28px")}>
      <div style={css("display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px")}>
        <div>
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;color:#d8ecf8")}>Deals</div>
          <div style={css("font-family:'Inter',sans-serif;font-size:14px;color:#9da7ba;margin-top:6px")}>
            Brands moving from new to booked.
          </div>
        </div>
        <div style={css("display:flex;gap:10px")}>
          <Box onClick={() => setShowImport((v) => !v)} style={pillGhost} styleHover="background:rgba(186,214,247,.06)">
            Import CSV
          </Box>
          <Box onClick={() => setShowAdd((v) => !v)} style={pillPrimary} styleHover={pillPrimaryHover}>
            + Add brand
          </Box>
        </div>
      </div>

      {showAdd && <AddLeadForm agents={agents} onClose={() => setShowAdd(false)} />}
      {showImport && <ImportCsvForm agents={agents} onClose={() => setShowImport(false)} />}

      <div style={css("display:flex;flex-direction:column;gap:14px")}>
        <div style={css("display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px")}>
          <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#d8ecf8")}>Pending review</div>
          <div style={css("display:flex;align-items:center;gap:12px")}>
            {discoverResult !== null && (
              <span style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#7ee2a8")}>
                Found {discoverResult} new brand{discoverResult === 1 ? "" : "s"}
              </span>
            )}
            <Box
              onClick={() => !discovering && handleDiscover()}
              style={pillGhost + (discovering ? ";opacity:.6;cursor:wait" : "")}
              styleHover={discovering ? undefined : "background:rgba(186,214,247,.06)"}
            >
              {discovering ? "Searching…" : "Discover brands"}
            </Box>
          </div>
        </div>
        {pending.length === 0 ? (
          <div style={css(glassCard + ";padding:20px;font-family:'Inter',sans-serif;font-size:13.5px;color:#9da7ba")}>
            Nothing waiting — brands your agents discover on the web will land here for your approval.
          </div>
        ) : (
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:14px")}>
            {pending.map((lead) => (
              <div key={lead.id} style={css(glassCard + ";padding:16px;display:flex;flex-direction:column;gap:10px")}>
                <div style={css("font-family:'Inter',sans-serif;font-size:14px;font-weight:700;color:#ffffff")}>{lead.name}</div>
                {lead.company && <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;color:#9da7ba")}>{lead.company}</div>}
                <div style={css("display:flex;gap:8px")}>
                  <Box onClick={() => busyId !== lead.id && handleAccept(lead.id)} style={pillGood} styleHover="background:rgba(38,150,132,.2)">
                    Accept
                  </Box>
                  <Box onClick={() => busyId !== lead.id && handleReject(lead.id)} style={pillDanger} styleHover="background:rgba(228,109,76,.1)">
                    Reject
                  </Box>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:14px")}>
        <div style={css("font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:17px;color:#d8ecf8")}>Pipeline</div>
        <div style={css("display:grid;grid-template-columns:repeat(5,minmax(200px,1fr));gap:14px;overflow-x:auto")}>
          {STAGES.map((stage) => {
            const stageLeads = accepted.filter((l) => l.status === stage.id);
            return (
              <div key={stage.id} style={css("display:flex;flex-direction:column;gap:10px")}>
                <div style={css("font-family:'Inter',sans-serif;font-size:12.5px;font-weight:700;color:#c7d3ea;letter-spacing:.04em;text-transform:uppercase")}>
                  {stage.label} <span style={css("color:#9da7ba;font-weight:500")}>({stageLeads.length})</span>
                </div>
                <div style={css("display:flex;flex-direction:column;gap:10px")}>
                  {stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      agent={byId(lead.agentId)}
                      proposal={proposalsByLead[lead.id]}
                      followup={followupsByLead[lead.id]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
