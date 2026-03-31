import { useContext } from "react";
import { Monitor, Database, Wifi, WifiOff, Bug } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "@/context/AuthContext";
import { InfoRow, Section } from "./shared";

export function SystemTab({
  textColor,
  subtextColor,
  panelBg,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
}) {
  const { isAdmin, isSupport, userId } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const cacheSize = queryClient.getQueryCache().getAll().length;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const role = isAdmin ? "admin" : isSupport ? "support" : "user";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-min">
      <Section
        title="Browser"
        icon={<Monitor size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="User Agent"
          value={
            <span className="max-w-48 truncate block">
              {navigator.userAgent.split(")")[0] + ")"}
            </span>
          }
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Language"
          value={navigator.language}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Online"
          value={
            navigator.onLine ? (
              <span className="flex items-center gap-1 text-green-400">
                <Wifi size={10} /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <WifiOff size={10} /> Offline
              </span>
            )
          }
          textColor={textColor}
          subtextColor={subtextColor}
        />
        {nav.connection?.effectiveType && (
          <InfoRow
            label="Connection"
            value={nav.connection.effectiveType}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
        {nav.deviceMemory !== undefined && (
          <InfoRow
            label="Device Memory"
            value={`${nav.deviceMemory} GB`}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
        {nav.hardwareConcurrency !== undefined && (
          <InfoRow
            label="CPU Threads"
            value={String(nav.hardwareConcurrency)}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
      </Section>

      <Section
        title="Display"
        icon={<Monitor size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="Viewport"
          value={`${window.innerWidth} × ${window.innerHeight}`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Screen"
          value={`${window.screen.width} × ${window.screen.height}`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Pixel Ratio"
          value={`${window.devicePixelRatio}x`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Color Depth"
          value={`${window.screen.colorDepth}-bit`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>

      <Section
        title="Session"
        icon={<Database size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="Role"
          value={role}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="User ID"
          value={userId !== null ? `#${userId}` : "—"}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Query Cache"
          value={`${cacheSize} entries`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Timezone"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Local Time"
          value={new Date().toLocaleTimeString()}
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>

      <Section
        title="Environment"
        icon={<Bug size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="Base URL"
          value={window.location.origin}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Path"
          value={window.location.pathname}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Build Mode"
          value={import.meta.env.MODE}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Dev Server"
          value={import.meta.env.DEV ? "Yes" : "No"}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>
    </div>
  );
}
