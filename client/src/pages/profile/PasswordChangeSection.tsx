import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSecurityKey } from "@/context/SecurityKeyContext";
import { useChangePasswordMutation } from "@/hooks/useQueryHooks";
import { useWhoAmIQuery } from "@/hooks/useQueryHooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AnimatePresence, motion } from "motion/react";
import { useSettings } from "@/pages/settings/SettingsContext";
import { cn } from "@/lib/utils";
import { Lock, ChevronDown, ChevronUp, Check, Copy, Download, AlertCircle } from "lucide-react";
import { extractErrorMessage } from "@/lib/utils/extractErrorMessage";
import type { AxiosError } from "axios";
import { AnimatedPress } from "@/animations/AnimatedPress";

interface PasswordChangeSectionProps {
  textColor: string;
  textShadow: string;
  subtextColor: string;
  inputClass: string;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
  navigate: (path: string) => void;
  onSheetClose: () => void;
}

export function PasswordChangeSection({
  textColor,
  textShadow,
  subtextColor,
  inputClass,
  useLiquidGlass,
  useDarkMode,
  navigate,
  onSheetClose,
}: PasswordChangeSectionProps) {
  const { t } = useTranslation("profile");
  const { settings } = useSettings();
  const { securityKey: ctxKey, setSecurityKey } = useSecurityKey();
  const { data: whoAmI } = useWhoAmIQuery();

  const [expanded, setExpanded] = useState(false);
  const [securityKeyInput, setSecurityKeyInput] = useState(ctxKey ?? "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copiedNewKey, setCopiedNewKey] = useState(false);

  const mutation = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.reset();
    setValidationError("");

    if (newPassword.length < 8) {
      setValidationError(
        t("sheet.passwordNewPasswordShort") || "Password must be at least 8 characters.",
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError(t("sheet.passwordMismatch") || "Passwords do not match.");
      return;
    }
    if (!whoAmI?.email) return;

    try {
      const result = await mutation.mutateAsync({
        email: whoAmI.email,
        securityKey: securityKeyInput,
        newPassword,
      });
      setSecurityKey(result.new_key);
      setNewKey(result.new_key);
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      // shown via mutation.isError
    }
  };

  const handleCopyNewKey = async () => {
    if (!newKey) return;
    await navigator.clipboard.writeText(newKey);
    setCopiedNewKey(true);
    setTimeout(() => setCopiedNewKey(false), 2000);
  };

  const handleDownloadNewKey = () => {
    if (!newKey) return;
    const blob = new Blob([newKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smaash-security-key.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorMessage =
    validationError ||
    (mutation.isError ? extractErrorMessage(mutation.error as AxiosError, t("sheet.error")) : "");

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

  const successBoxClass = cn(
    "rounded-xl border px-3 py-2.5 text-xs",
    useLiquidGlass
      ? useDarkMode
        ? "border-green-500/25 bg-green-500/15"
        : "border-green-500/20 bg-green-500/10"
      : useDarkMode
        ? "border-green-800 bg-green-950"
        : "border-green-200 bg-green-50",
  );

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "flex items-center justify-between text-sm font-medium",
          textColor,
          textShadow,
        )}
      >
        <span className="flex items-center gap-1.5">
          <Lock size={13} />
          {t("sheet.password")}
        </span>
        {expanded ? (
          <ChevronUp size={14} className="opacity-60" />
        ) : (
          <ChevronDown size={14} className="opacity-60" />
        )}
      </button>

      {settings.useAnimations ? (
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="pw-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-3 pt-1">
                {newKey ? (
                  <div className={successBoxClass}>
                    <p className="mb-2 text-green-600 dark:text-green-400">
                      {t("sheet.passwordSuccess")}
                    </p>
                    <p className={cn("mb-1 text-xs font-medium", textColor)}>
                      {t("sheet.securityKeyNewLabel")}
                    </p>
                    <div className={keyBoxClass}>
                      <code
                        className={cn("min-w-0 flex-1 font-mono text-xs break-all", subtextColor)}
                      >
                        {newKey}
                      </code>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 shrink-0 px-2"
                        onClick={handleCopyNewKey}
                      >
                        {copiedNewKey ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 opacity-60" />
                        )}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="h-7 shrink-0 px-2"
                        onClick={handleDownloadNewKey}
                      >
                        <Download className="h-4 w-4 opacity-60" />
                      </Button>
                    </div>
                    <p className={cn("mt-1 text-xs", subtextColor)}>
                      {t("sheet.securityKeyWarning")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor="pw-security-key"
                        className={cn("text-xs font-medium", textColor)}
                      >
                        {t("sheet.passwordSecurityKey")}
                      </Label>
                      <AnimatedPress scale={1.02} tapScale={1} className="w-full">
                        <Input
                          id="pw-security-key"
                          type="text"
                          value={securityKeyInput}
                          onChange={(e) => setSecurityKeyInput(e.target.value)}
                          placeholder={t("sheet.passwordSecurityKeyPlaceholder")}
                          className={cn(inputClass, "font-mono text-xs")}
                          disabled={mutation.isPending}
                          required
                        />
                      </AnimatedPress>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pw-new" className={cn("text-xs font-medium", textColor)}>
                        {t("sheet.passwordNewPassword")}
                      </Label>
                      <AnimatedPress scale={1.02} tapScale={1} className="w-full">
                        <Input
                          id="pw-new"
                          type="password"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value);
                            if (validationError) setValidationError("");
                          }}
                          className={inputClass}
                          disabled={mutation.isPending}
                          required
                        />
                      </AnimatedPress>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="pw-confirm" className={cn("text-xs font-medium", textColor)}>
                        {t("sheet.passwordConfirmPassword")}
                      </Label>
                      <AnimatedPress scale={1.02} tapScale={1} className="w-full">
                        <Input
                          id="pw-confirm"
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (validationError) setValidationError("");
                          }}
                          className={inputClass}
                          disabled={mutation.isPending}
                          required
                        />
                      </AnimatedPress>
                    </div>

                    {errorMessage && (
                      <div
                        className={cn(
                          "flex items-start gap-2 rounded-xl border px-3 py-2 text-xs",
                          useLiquidGlass
                            ? useDarkMode
                              ? "border-red-500/25 bg-red-500/15"
                              : "border-red-500/20 bg-red-500/10"
                            : useDarkMode
                              ? "border-red-800 bg-red-950"
                              : "border-red-200 bg-red-50",
                        )}
                      >
                        <AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
                        <span className="text-red-400">{errorMessage}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          onSheetClose();
                          navigate("/app/reset-password");
                        }}
                        className={cn(
                          "cursor-pointer text-xs underline underline-offset-2 transition-opacity hover:opacity-100",
                          subtextColor,
                        )}
                      >
                        {t("sheet.passwordReset")}
                      </button>
                      <AnimatedPress>
                        <Button
                          type="submit"
                          size="sm"
                          className="text-white"
                          disabled={mutation.isPending}
                        >
                          {mutation.isPending
                            ? t("sheet.passwordSubmitting")
                            : t("sheet.passwordSubmit")}
                        </Button>
                      </AnimatedPress>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      ) : (
        expanded && (
          <div className="overflow-hidden">
            <div className="flex flex-col gap-3 pt-1">
              {newKey ? (
                <div className={successBoxClass}>
                  <p className="mb-2 text-green-600 dark:text-green-400">
                    {t("sheet.passwordSuccess")}
                  </p>
                  <p className={cn("mb-1 text-xs font-medium", textColor)}>
                    {t("sheet.securityKeyNewLabel")}
                  </p>
                  <div className={keyBoxClass}>
                    <code
                      className={cn("min-w-0 flex-1 font-mono text-xs break-all", subtextColor)}
                    >
                      {newKey}
                    </code>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 px-2"
                      onClick={handleCopyNewKey}
                    >
                      {copiedNewKey ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 opacity-60" />
                      )}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 shrink-0 px-2"
                      onClick={handleDownloadNewKey}
                    >
                      <Download className="h-4 w-4 opacity-60" />
                    </Button>
                  </div>
                  <p className={cn("mt-1 text-xs", subtextColor)}>
                    {t("sheet.securityKeyWarning")}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label
                      htmlFor="pw-security-key"
                      className={cn("text-xs font-medium", textColor)}
                    >
                      {t("sheet.passwordSecurityKey")}
                    </Label>
                    <Input
                      id="pw-security-key"
                      type="text"
                      value={securityKeyInput}
                      onChange={(e) => setSecurityKeyInput(e.target.value)}
                      placeholder={t("sheet.passwordSecurityKeyPlaceholder")}
                      className={cn(inputClass, "font-mono text-xs")}
                      disabled={mutation.isPending}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pw-new" className={cn("text-xs font-medium", textColor)}>
                      {t("sheet.passwordNewPassword")}
                    </Label>
                    <Input
                      id="pw-new"
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (validationError) setValidationError("");
                      }}
                      className={inputClass}
                      disabled={mutation.isPending}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="pw-confirm" className={cn("text-xs font-medium", textColor)}>
                      {t("sheet.passwordConfirmPassword")}
                    </Label>
                    <Input
                      id="pw-confirm"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (validationError) setValidationError("");
                      }}
                      className={inputClass}
                      disabled={mutation.isPending}
                      required
                    />
                  </div>
                  {errorMessage && (
                    <div
                      className={cn(
                        "flex items-start gap-2 rounded-xl border px-3 py-2 text-xs",
                        useLiquidGlass
                          ? useDarkMode
                            ? "border-red-500/25 bg-red-500/15"
                            : "border-red-500/20 bg-red-500/10"
                          : useDarkMode
                            ? "border-red-800 bg-red-950"
                            : "border-red-200 bg-red-50",
                      )}
                    >
                      <AlertCircle size={12} className="mt-0.5 shrink-0 text-red-400" />
                      <span className="text-red-400">{errorMessage}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        onSheetClose();
                        navigate("/app/reset-password");
                      }}
                      className={cn(
                        "cursor-pointer text-xs underline underline-offset-2 transition-opacity hover:opacity-100",
                        subtextColor,
                      )}
                    >
                      {t("sheet.passwordReset")}
                    </button>
                    <Button
                      type="submit"
                      size="sm"
                      className="text-white"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending
                        ? t("sheet.passwordSubmitting")
                        : t("sheet.passwordSubmit")}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )
      )}

      {!expanded && <p className={cn("text-xs", subtextColor)}>{t("sheet.passwordHint")}</p>}
    </div>
  );
}
