import { currentUser } from "@/lib/auth/currentUser";
import { getUserRow } from "@/lib/db/users";
import SettingsForm from "./SettingsForm";

const DEFAULT_NOTIFICATIONS: Record<string, boolean> = {
  dealActivity: true,
  pitchesAndProposals: true,
  meetings: true,
};

export default async function SettingsPage() {
  const user = await currentUser();
  const row = user ? await getUserRow(user.id) : null;
  const saved = (row?.notifications as Record<string, boolean> | undefined) ?? {};
  const notifications = { ...DEFAULT_NOTIFICATIONS, ...saved };

  return (
    <div style={{ maxWidth: 560, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 26, color: "#d8ecf8" }}>Settings</div>
        <div style={{ fontFamily: "Inter,sans-serif", fontSize: 14, color: "#9da7ba", marginTop: 6 }}>
          Choose what you want to hear about.
        </div>
      </div>
      <SettingsForm initialNotifications={notifications} />
    </div>
  );
}
