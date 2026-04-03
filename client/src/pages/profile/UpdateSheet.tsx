import React, { useState, useEffect, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useSettings } from "@/pages/settings/SettingsContext";
import { useTranslation } from "react-i18next";
import {
  getBackgroundClasses,
  getButtonClasses,
  getInputClasses,
  getTextColor,
  getTextShadow,
  getSubtextColor,
  getDialogClasses,
  cn,
} from "@/lib/utils";
import { AuthContext } from "@/context/AuthContext";
import { useProfiles } from "@/pages/profile-selector/useProfiles";
import {
  useWhoAmIQuery,
  useUpdateUserEmailMutation,
  useUpdateProfileMutation,
} from "@/hooks/useQueryHooks";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CheckCircle2, AlertCircle, Loader2, Lock } from "lucide-react";

export function UpdateSheet() {
  const { settings } = useSettings();
  const { t } = useTranslation("profile");
  const { userId } = useContext(AuthContext);
  const numUserId = userId !== null ? Number(userId) : null;

  const { selectedProfile } = useProfiles();
  const { data: whoAmI } = useWhoAmIQuery();

  const updateEmailMutation = useUpdateUserEmailMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const queryClient = useQueryClient();

  // ─── Controlled field state (initialised from live data) ─────────────────
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);

  // Feedback state
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Sync fields from real data every time the sheet opens
  useEffect(() => {
    if (open) {
      setDisplayName(selectedProfile?.name ?? "");
      setEmail(whoAmI?.email ?? "");
      setSaveStatus("idle");
      setErrorMsg("");
    }
  }, [open, selectedProfile?.name, whoAmI?.email]);

  // ─── Save handler ─────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!selectedProfile?.id || !numUserId) return;

    setSaveStatus("saving");
    setErrorMsg("");

    const displayNameChanged = displayName.trim() !== (selectedProfile?.name ?? "");
    const emailChanged = email.trim() !== (whoAmI?.email ?? "");

    try {
      // Run changed fields in parallel
      await Promise.all([
        displayNameChanged
          ? updateProfileMutation.mutateAsync({
              profileId: selectedProfile.id,
              payload: {
                id: selectedProfile.id,
                display_name: displayName.trim(),
                coins: selectedProfile.coins ?? 0,
              },
              // Don't rely on the mutation's own invalidation — we do it
              // explicitly below so we can also write the cache directly.
              invalidateAfterSuccess: false,
            })
          : Promise.resolve(),

        emailChanged
          ? updateEmailMutation.mutateAsync({
              userId: numUserId,
              email: email.trim(),
            })
          : Promise.resolve(),
      ]);

      // mutateAsync has already confirmed the server persisted the change.
      // Refetch the profiles query directly — this is what React Query
      // subscribers (Navbar, ProfileContext) react to automatically.
      if (numUserId) {
        await queryClient.refetchQueries({
          queryKey: queryKeys.profiles.byUserId(numUserId),
          type: "active",
        });
      }

      setSaveStatus("success");
      // Auto-close after a short success flash
      setTimeout(() => setOpen(false), 900);
    } catch (err: unknown) {
      setSaveStatus("error");
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setErrorMsg(axiosErr?.response?.data?.message ?? t("sheet.error"));
    }
  };

  // ─── Theming ──────────────────────────────────────────────────────────────
  const { useLiquidGlass, useDarkMode } = settings;
  const sheetBg = getDialogClasses(useLiquidGlass, useDarkMode);
  const buttonClass = getButtonClasses(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);

  const disabledInputClass = cn(inputClass, "opacity-50 cursor-not-allowed");

  const isSaving = saveStatus === "saving";
  const hasChanged =
    displayName.trim() !== (selectedProfile?.name ?? "") || email.trim() !== (whoAmI?.email ?? "");

  return (
    <div className="z-101">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button className={`cursor-pointer ${buttonClass} ${textShadow}`}>
            {t("sheet.title")}
          </Button>
        </SheetTrigger>

        <SheetContent className={cn(sheetBg, textColor, "flex flex-col gap-0")}>
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className={cn("text-lg", textColor, textShadow)}>
              {t("sheet.title")}
            </SheetTitle>
            <SheetDescription className={cn("text-sm", subtextColor)}>
              {t("sheet.description")}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-6">
            {/* Display name */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="sheet-displayname"
                className={cn("text-sm font-medium", textColor, textShadow)}
              >
                {t("sheet.displayName")}
              </Label>
              <Input
                id="sheet-displayname"
                className={cn("cursor-text", inputClass)}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={20}
                disabled={isSaving}
                placeholder={t("sheet.displayNamePlaceholder")}
              />
              <p className={cn("text-xs", subtextColor)}>{t("sheet.displayNameHint")}</p>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="sheet-email"
                className={cn("text-sm font-medium", textColor, textShadow)}
              >
                {t("sheet.email")}
              </Label>
              <Input
                id="sheet-email"
                type="email"
                className={cn("cursor-text", inputClass)}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={30}
                disabled={isSaving}
                placeholder={t("sheet.emailPlaceholder")}
              />
              <p className={cn("text-xs", subtextColor)}>{t("sheet.emailHint")}</p>
            </div>

            {/* Password — disabled, TODO wired when backend supports it */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="sheet-password"
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  textColor,
                  textShadow,
                )}
              >
                <Lock size={13} />
                {t("sheet.password")}
              </Label>
              {/*
               * TODO: BACKEND — Password change is not supported by PUT /api/users/:id.
               * The UserUpdateDTO explicitly excludes password ("You can't change the
               * password here, that requires separate functionality" — users_controller.go).
               *
               * To enable this field:
               *   1. Add POST /api/auth/change-password endpoint on the backend.
               *   2. Body: { current_password: string, new_password: string }
               *   3. Add useChangePasswordMutation to useAuthHooks.ts.
               *   4. Replace the disabled input below with a real one.
               *
               * The existing /app/reset-password page handles the separate reset flow.
               */}
              <Input
                id="sheet-password"
                type="password"
                className={disabledInputClass}
                placeholder={t("sheet.passwordPlaceholder")}
                disabled
                readOnly
              />
              <p className={cn("text-xs", subtextColor)}>
                {t("sheet.passwordHint")}{" "}
                <span className={cn("cursor-default underline underline-offset-2", subtextColor)}>
                  {t("sheet.passwordReset")}
                </span>
              </p>
            </div>

            {/* Error feedback */}
            {saveStatus === "error" && (
              <div
                className={cn(
                  "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm",
                  useLiquidGlass
                    ? useDarkMode
                      ? "border border-red-500/25 bg-red-500/15"
                      : "border border-red-500/20 bg-red-500/10"
                    : useDarkMode
                      ? "border border-red-800 bg-red-950"
                      : "border border-red-200 bg-red-50",
                )}
              >
                <AlertCircle size={15} className="mt-0.5 shrink-0 text-red-400" />
                <span className="text-xs text-red-400">{errorMsg}</span>
              </div>
            )}

            {/* Success feedback */}
            {saveStatus === "success" && (
              <div
                className={cn(
                  "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm",
                  useLiquidGlass
                    ? useDarkMode
                      ? "border border-green-500/25 bg-green-500/15"
                      : "border border-green-500/20 bg-green-500/10"
                    : useDarkMode
                      ? "border border-green-800 bg-green-950"
                      : "border border-green-200 bg-green-50",
                )}
              >
                <CheckCircle2 size={15} className="shrink-0 text-green-400" />
                <span className="text-xs text-green-400">{t("sheet.saved")}</span>
              </div>
            )}
          </div>

          <SheetFooter className="flex flex-row justify-end gap-2 px-6 py-4">
            <SheetClose asChild>
              <Button variant="outline" className={cn(buttonClass, textColor)} disabled={isSaving}>
                {t("sheet.cancel")}
              </Button>
            </SheetClose>
            <Button
              onClick={handleSave}
              disabled={!hasChanged || isSaving}
              className={cn(
                "transition-all duration-200",
                hasChanged && !isSaving
                  ? buttonClass
                  : cn(buttonClass, "cursor-not-allowed opacity-40"),
                textColor,
              )}
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {t("sheet.saving")}
                </span>
              ) : (
                t("sheet.save")
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
