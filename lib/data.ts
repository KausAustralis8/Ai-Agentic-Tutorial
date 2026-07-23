export type StatusKey = "working" | "waiting" | "offline" | "error";
export interface StatusMeta { label: string; bg: string; color: string; dot: string }
const STATUS_META: Record<StatusKey, StatusMeta> = {
  working: { label: "Working", bg: "rgba(38,150,132,.15)", color: "#269684", dot: "#269684" },
  waiting: { label: "Waiting", bg: "rgba(228,109,76,.15)", color: "#e46d4c", dot: "#e46d4c" },
  offline: { label: "Offline", bg: "rgba(157,167,186,.15)", color: "#9da7ba", dot: "#9da7ba" },
  error:   { label: "Error",   bg: "rgba(228,109,76,.2)", color: "#e46d4c", dot: "#e46d4c" },
};
export function statusMeta(s: StatusKey): StatusMeta { return STATUS_META[s] ?? STATUS_META.offline; }
