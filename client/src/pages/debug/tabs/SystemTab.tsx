import { useContext } from "react";
import { Monitor, Database, Wifi, WifiOff, Bug } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation("debug");
  const cacheSize = queryClient.getQueryCache().getAll().length;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const role = isAdmin ? "admin" : isSupport ? "support" : "user";

  return (
    <div className="grid auto-rows-min grid-cols-1 gap-3 sm:grid-cols-2">
      <Section
        title={t("system.browser")}
        icon={<Monitor size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label={t("system.userAgent")}
          value={
            <span className="block max-w-48 truncate">
              {navigator.userAgent.split(")")[0] + ")"}
            </span>
          }
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.language")}
          value={navigator.language}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.online")}
          value={
            navigator.onLine ? (
              <span className="flex items-center gap-1 text-green-400">
                <Wifi size={10} /> {t("system.online")}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <WifiOff size={10} /> {t("system.offline")}
              </span>
            )
          }
          textColor={textColor}
          subtextColor={subtextColor}
        />
        {nav.connection?.effectiveType && (
          <InfoRow
            label={t("system.connection")}
            value={nav.connection.effectiveType}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
        {nav.deviceMemory !== undefined && (
          <InfoRow
            label={t("system.deviceMemory")}
            value={`${nav.deviceMemory} GB`}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
        {nav.hardwareConcurrency !== undefined && (
          <InfoRow
            label={t("system.cpuThreads")}
            value={String(nav.hardwareConcurrency)}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
      </Section>

      <Section
        title={t("system.display")}
        icon={<Monitor size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label={t("system.viewport")}
          value={`${window.innerWidth} × ${window.innerHeight}`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.screen")}
          value={`${window.screen.width} × ${window.screen.height}`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.pixelRatio")}
          value={`${window.devicePixelRatio}x`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.colorDepth")}
          value={`${window.screen.colorDepth}-bit`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>

      <Section
        title={t("system.session")}
        icon={<Database size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label={t("system.role")}
          value={role}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.userId")}
          value={userId !== null ? `#${userId}` : "—"}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.queryCache")}
          value={t("system.queryCacheCount", { count: cacheSize })}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.timezone")}
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.localTime")}
          value={new Date().toLocaleTimeString()}
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>

      <Section
        title={t("system.environment")}
        icon={<Bug size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label={t("system.baseUrl")}
          value={window.location.origin}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.path")}
          value={window.location.pathname}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.buildMode")}
          value={import.meta.env.MODE}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label={t("system.devServer")}
          value={import.meta.env.DEV ? t("system.yes") : t("system.no")}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>
    </div>
  );
}
