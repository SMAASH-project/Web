import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSecurityKey } from "@/context/SecurityKeyContext";
import { Button } from "@/components/ui/button";
import { cn, getSubtextColor, getTextColor, getTextShadow } from "@/lib/utils";
import { Copy, Check, Download, KeyRound, AlertTriangle } from "lucide-react";
import { AnimatedPress } from "@/animations/AnimatedPress";

interface SecurityKeySectionProps {
  textColor: string;
  textShadow: string;
  subtextColor: string;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
}

export function SecurityKeySection({
  textColor,
  textShadow,
  subtextColor,
  useLiquidGlass,
  useDarkMode,
}: SecurityKeySectionProps) {
  const { t } = useTranslation("profile");
  const { securityKey } = useSecurityKey();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!securityKey) return;
    await navigator.clipboard.writeText(securityKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [securityKey]);

  const handleDownload = useCallback(() => {
    if (!securityKey) return;
    const blob = new Blob([securityKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smaash-security-key.txt";
    a.click();
    URL.revokeObjectURL(url);
  }, [securityKey]);

  const keyBoxClass = cn(
    "flex items-center gap-2 rounded-xl border px-3 py-2",
    useLiquidGlass
      ? useDarkMode
        ? "border-white/10 bg-white/5"
        : "border-black/10 bg-black/5"
      : useDarkMode
        ? "border-white/15 bg-white/8"
        : "border-gray-200 bg-gray-50",
  );

  return (
    <div className="flex flex-col gap-2">
      <div className={cn("flex items-center gap-1.5 text-sm font-medium", textColor, textShadow)}>
        <KeyRound size={13} />
        {t("sheet.securityKey")}
      </div>

      {securityKey ? (
        <>
          <div className={keyBoxClass}>
            <code className={cn("min-w-0 flex-1 font-mono text-xs break-all", subtextColor)}>
              {securityKey}
            </code>
            <AnimatedPress>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2"
                onClick={handleCopy}
                aria-label={t("sheet.securityKeyCopy")}
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 opacity-60" />
                )}
              </Button>
            </AnimatedPress>
            <AnimatedPress>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 shrink-0 px-2"
                onClick={handleDownload}
                aria-label={t("sheet.securityKeyDownload")}
              >
                <Download className="h-4 w-4 opacity-60" />
              </Button>
            </AnimatedPress>
          </div>
          <p className={cn("text-xs", subtextColor)}>{t("sheet.securityKeyDescription")}</p>
        </>
      ) : (
        <div
          className={cn(
            "flex items-start gap-2 rounded-xl border px-3 py-2.5 text-xs",
            useLiquidGlass
              ? useDarkMode
                ? "border-yellow-500/25 bg-yellow-500/10"
                : "border-yellow-500/20 bg-yellow-500/8"
              : useDarkMode
                ? "border-yellow-800 bg-yellow-950"
                : "border-yellow-200 bg-yellow-50",
          )}
        >
          <AlertTriangle size={13} className="mt-0.5 shrink-0 text-yellow-500" />
          <span className={cn("text-xs text-yellow-600 dark:text-yellow-400")}>
            {t("sheet.securityKeyMissing")}
          </span>
        </div>
      )}
    </div>
  );
}
