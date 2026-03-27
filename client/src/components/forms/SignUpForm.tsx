import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import React from "react";
import { generateRandomUsername } from "@/lib/GenerateRandomUsername";
import { useSignupMutation } from "@/hooks/useQueryHooks";
import {
  useGoogleReCaptcha,
  GoogleReCaptchaProvider,
} from "react-google-recaptcha-v3";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { extractErrorMessage } from "@/lib/utils/extractErrorMessage";
import type { AxiosError } from "axios";

export function SignupForm(props: React.ComponentProps<"div">) {
  return (
    <GoogleReCaptchaProvider reCaptchaKey="6LfiUposAAAAAPLDMCXDkIBHkZ0JwtbQ-J5fbbdi">
      <SignupFormInner {...props} />
    </GoogleReCaptchaProvider>
  );
}

function SignupFormInner({ className, ...props }: React.ComponentProps<"div">) {
  const captchaEnabled = true;
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [validationError, setValidationError] = React.useState("");

  const navigate = useNavigate();
  const randomUsername = generateRandomUsername();
  const signupMutation = useSignupMutation();
  const { t } = useTranslation("auth");
  const { settings, updateSetting } = useSettings();
  const { executeRecaptcha } = useGoogleReCaptcha();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      setValidationError(t("signup.errorUsernameShort"));
      return;
    }
    if (password !== confirmPassword) {
      setValidationError(t("signup.errorPasswordMismatch"));
      return;
    }
    if (password.length < 8) {
      setValidationError(t("signup.errorPasswordShort"));
      return;
    }

    let captchaToken: string | null = null;
    if (captchaEnabled) {
      if (!executeRecaptcha) {
        setValidationError(t("signup.errorCaptcha"));
        return;
      }
      try {
        captchaToken = await executeRecaptcha("signup");
      } catch {
        setValidationError(t("signup.errorCaptcha"));
        return;
      }
    }

    if (captchaEnabled && !captchaToken) {
      setValidationError(t("signup.errorCaptcha"));
      return;
    }

    setValidationError("");
    try {
      await signupMutation.mutateAsync({ email, password, username });
      navigate("/app/login");
    } catch {
      // error displayed via signupMutation.isError below
    }
  };

  // Client-side validation errors take priority; fall back to server error
  const errorMessage =
    validationError ||
    (signupMutation.isError
      ? extractErrorMessage(
          signupMutation.error as AxiosError,
          t("signup.failed"),
        )
      : "");

  return (
    <div className={cn("w-full max-w-md px-4 sm:px-0", className)} {...props}>
      <div className="flex justify-end mb-2">
        <LanguageToggle
          language={settings.language}
          onChange={(lang) => updateSetting("language", lang)}
        />
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("signup.title")}</CardTitle>
          <CardDescription>{t("signup.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="username" className="text-gray-900!">
                  {t("signup.username")}
                </FieldLabel>
                <Input
                  id="username"
                  type="text"
                  placeholder={`${randomUsername.prefix}${randomUsername.suffix}`}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (validationError) setValidationError("");
                  }}
                  disabled={signupMutation.isPending}
                  required
                />
                <FieldDescription>{t("signup.usernameHint")}</FieldDescription>
              </Field>
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
                <FieldLabel
                  htmlFor="confirm-password"
                  className="text-gray-900!"
                >
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
                <FieldDescription>
                  {t("signup.confirmPasswordHint")}
                </FieldDescription>
              </Field>

              {errorMessage && (
                <FormAlert variant="error" message={errorMessage} />
              )}

              <Field>
                <Button
                  type="submit"
                  className="text-white"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending
                    ? t("signup.submitting")
                    : t("signup.submit")}
                </Button>
                <FieldDescription className="px-6 text-center">
                  {t("signup.hasAccount")}{" "}
                  <Link to="/app/login">{t("signup.signIn")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
