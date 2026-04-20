import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useSignupMutation } from "@/hooks/useQueryHooks";
import { useGoogleReCaptcha, GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/pages/settings/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { extractErrorMessage } from "@/lib/utils/extractErrorMessage";
import { useSecurityKey } from "@/context/SecurityKeyContext";
import { AnimatePresence, motion } from "motion/react";
import { Copy, Check, Download, KeyRound } from "lucide-react";
import type { AxiosError } from "axios";

// ─── Security Key Reveal (Step 2) ────────────────────────────────────────────

interface SignupSuccessProps {
  securityKey: string;
}

function SignupSuccess({ securityKey }: SignupSuccessProps) {
  const { t } = useTranslation("auth");
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(securityKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([securityKey], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smaash-security-key.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-4"
    >
      <FormAlert variant="success" message={t("signup.successDescription")} />

      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-900">{t("signup.securityKeyLabel")}</p>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <code className="min-w-0 flex-1 break-all font-mono text-xs text-gray-800">
            {securityKey}
          </code>
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
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 shrink-0 px-2"
            onClick={handleDownload}
            aria-label={t("signup.download")}
          >
            <Download className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
        <FormAlert variant="info" message={t("signup.securityKeyWarning")} />
      </div>

      <Button type="button" className="w-full text-white" onClick={() => navigate("/app/login")}>
        {t("signup.goToLogin")}
      </Button>
    </motion.div>
  );
}

// ─── Signup Form (Step 1) ─────────────────────────────────────────────────────

interface SignupFormProps {
  onSuccess: (key: string) => void;
}

function SignupForm({ onSuccess }: SignupFormProps) {
  const { t } = useTranslation("auth");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [validationError, setValidationError] = useState("");

  const signupMutation = useSignupMutation();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.reset();
    setValidationError("");

    if (password !== confirmPassword) {
      setValidationError(t("signup.errorPasswordMismatch"));
      return;
    }
    if (password.length < 8) {
      setValidationError(t("signup.errorPasswordShort"));
      return;
    }

    if (executeRecaptcha) {
      try {
        await executeRecaptcha("signup");
      } catch {
        console.warn("reCAPTCHA execution failed; continuing without token.");
      }
    }

    try {
      const data = await signupMutation.mutateAsync({ email, password });
      onSuccess(data.security_key);
    } catch {
      // error displayed via signupMutation.isError below
    }
  };

  const errorMessage =
    validationError ||
    (signupMutation.isError
      ? extractErrorMessage(signupMutation.error as AxiosError, t("signup.failed"))
      : "");

  return (
    <motion.form
      key="form"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email" className="text-gray-900!">
            {t("signup.email")}
          </FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={signupMutation.isPending}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="password" className="text-gray-900!">
            {t("signup.password")}
          </FieldLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (validationError) setValidationError("");
            }}
            disabled={signupMutation.isPending}
            required
          />
          <FieldDescription>{t("signup.passwordHint")}</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password" className="text-gray-900!">
            {t("signup.confirmPassword")}
          </FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (validationError) setValidationError("");
            }}
            disabled={signupMutation.isPending}
            required
          />
          <FieldDescription>{t("signup.confirmPasswordHint")}</FieldDescription>
        </Field>

        {errorMessage && <FormAlert variant="error" message={errorMessage} />}

        <Field>
          <Button type="submit" className="text-white" disabled={signupMutation.isPending}>
            {signupMutation.isPending ? t("signup.submitting") : t("signup.submit")}
          </Button>
          <FieldDescription className="px-6 text-center">
            {t("signup.hasAccount")} <Link to="/app/login">{t("signup.signIn")}</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </motion.form>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function SignUpPage(props: React.ComponentProps<"div">) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LfiUposAAAAAPLDMCXDkIBHkZ0JwtbQ-J5fbbdi">
      <SignupPageInner {...props} />
    </GoogleReCaptchaProvider>
  );
}

function SignupPageInner({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation("auth");
  const { settings, updateSetting } = useSettings();
  const { setSecurityKey } = useSecurityKey();
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const handleSuccess = (key: string) => {
    setSecurityKey(key);
    setRevealedKey(key);
  };

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
            {revealedKey && <KeyRound className="h-5 w-5 text-gray-500" />}
            <CardTitle>
              {revealedKey ? t("signup.successTitle") : t("signup.title")}
            </CardTitle>
          </div>
          <CardDescription>
            {revealedKey ? "" : t("signup.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {revealedKey ? (
              <SignupSuccess key="success" securityKey={revealedKey} />
            ) : (
              <SignupForm key="form" onSuccess={handleSuccess} />
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
