import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { Link } from "react-router-dom";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/pages/settings/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { extractErrorMessage } from "@/lib/utils/extractErrorMessage";
import { useChangePasswordMutation } from "@/hooks/useQueryHooks";
import { useSecurityKey } from "@/context/SecurityKeyContext";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Check, KeyRound } from "lucide-react";
import { AnimatedPress } from "@/animations/AnimatedPress";
import type { AxiosError } from "axios";

// ─── Success state ─────────────────────────────────────────────────────────

interface ResetSuccessProps {
  newKey: string;
}

function ResetSuccess({ newKey }: ResetSuccessProps) {
  const { t } = useTranslation("auth");
  const { settings } = useSettings();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const successContent = (
    <>
      <FormAlert variant="success" message={t("reset.successDescription")} />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-900">{t("reset.newKeyLabel")}</p>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <code className="min-w-0 flex-1 font-mono text-xs break-all text-gray-800">{newKey}</code>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 px-2"
            onClick={handleCopy}
            aria-label={t("reset.copy")}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4 text-gray-500" />
            )}
          </Button>
        </div>
        <FormAlert variant="info" message={t("reset.newKeyWarning")} />
      </div>

      <AnimatedPress>
        <Link to="/app/login" className="block w-full">
          <Button type="button" className="w-full text-white">
            {t("reset.goToLogin")}
          </Button>
        </Link>
      </AnimatedPress>
    </>
  );

  if (settings.useAnimations) {
    return (
      <motion.div
        key="success"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col gap-4"
      >
        {successContent}
      </motion.div>
    );
  }

  return (
    <div key="success" className="flex flex-col gap-4">
      {successContent}
    </div>
  );
}

// ─── Reset form ─────────────────────────────────────────────────────────────

interface ResetFormProps {
  onSuccess: (newKey: string) => void;
}

function ResetForm({ onSuccess }: ResetFormProps) {
  const { t } = useTranslation("auth");
  const { settings } = useSettings();
  const [email, setEmail] = useState("");
  const [securityKey, setSecurityKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationError, setValidationError] = useState("");
  const { setSecurityKey: storeSecurityKey } = useSecurityKey();

  const mutation = useChangePasswordMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    mutation.reset();
    setValidationError("");

    if (newPassword.length < 8) {
      setValidationError(t("reset.errorPasswordShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setValidationError(t("reset.errorPasswordMismatch"));
      return;
    }

    try {
      const result = await mutation.mutateAsync({
        email,
        securityKey,
        newPassword,
      });
      storeSecurityKey(result.new_key);
      onSuccess(result.new_key);
    } catch {
      // error displayed via mutation.isError below
    }
  };

  const errorMessage =
    validationError ||
    (mutation.isError ? extractErrorMessage(mutation.error as AxiosError, t("reset.failed")) : "");

  const formContent = (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="reset-email" className="text-gray-900!">
          {t("reset.email")}
        </FieldLabel>
        <AnimatedPress scale={1.02} tapScale={1} className="w-full">
          <Input
            id="reset-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={mutation.isPending}
            className="hover:border-gray-400"
          />
        </AnimatedPress>
        <FieldDescription>{t("reset.emailHint")}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="security-key" className="text-gray-900!">
          {t("reset.securityKey")}
        </FieldLabel>
        <AnimatedPress scale={1.02} tapScale={1} className="w-full">
          <Input
            id="security-key"
            type="text"
            value={securityKey}
            onChange={(e) => setSecurityKey(e.target.value)}
            placeholder={t("reset.securityKeyPlaceholder")}
            required
            disabled={mutation.isPending}
            className="font-mono text-xs hover:border-gray-400"
          />
        </AnimatedPress>
        <FieldDescription>{t("reset.securityKeyHint")}</FieldDescription>
      </Field>

      <Field>
        <FieldLabel htmlFor="new-password" className="text-gray-900!">
          {t("reset.newPassword")}
        </FieldLabel>
        <AnimatedPress scale={1.02} tapScale={1} className="w-full">
          <Input
            id="new-password"
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (validationError) setValidationError("");
            }}
            required
            disabled={mutation.isPending}
            className="hover:border-gray-400"
          />
        </AnimatedPress>
      </Field>

      <Field>
        <FieldLabel htmlFor="confirm-password" className="text-gray-900!">
          {t("reset.confirmPassword")}
        </FieldLabel>
        <AnimatedPress scale={1.02} tapScale={1} className="w-full">
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationError) setValidationError("");
            }}
            required
            disabled={mutation.isPending}
            className="hover:border-gray-400"
          />
        </AnimatedPress>
      </Field>

      {errorMessage && <FormAlert variant="error" message={errorMessage} />}

      <Field>
        <AnimatedPress className="w-full">
          <Button type="submit" className="w-full text-white" disabled={mutation.isPending}>
            {mutation.isPending ? t("reset.submitting") : t("reset.submit")}
          </Button>
        </AnimatedPress>
        <FieldDescription className="text-center">
          {t("reset.backToLogin")} <Link to="/app/login">{t("reset.logIn")}</Link>
        </FieldDescription>
      </Field>
    </FieldGroup>
  );

  if (settings.useAnimations) {
    return (
      <motion.form
        key="form"
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
      >
        {formContent}
      </motion.form>
    );
  }

  return (
    <form key="form" onSubmit={handleSubmit}>
      {formContent}
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function PasswordResetPage({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation("auth");
  const { settings, updateSetting } = useSettings();
  const [newKey, setNewKey] = useState<string | null>(null);

  return (
    <div className={cn("relative z-10 w-full max-w-md px-4 sm:px-0", className)} {...props}>
      <div className="mb-2 flex justify-end">
        <LanguageToggle
          language={settings.language}
          onChange={(lang) => updateSetting("language", lang)}
        />
      </div>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-gray-500" />
            <CardTitle>{newKey ? t("reset.successTitle") : t("reset.title")}</CardTitle>
          </div>
          <CardDescription>
            {newKey ? t("reset.successSubtitle") : t("reset.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings.useAnimations ? (
            <AnimatePresence mode="wait">
              {newKey ? <ResetSuccess newKey={newKey} /> : <ResetForm onSuccess={setNewKey} />}
            </AnimatePresence>
          ) : (
            <>{newKey ? <ResetSuccess newKey={newKey} /> : <ResetForm onSuccess={setNewKey} />}</>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
