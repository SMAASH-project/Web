import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { FormAlert } from "../ui/form-alert";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useLoginMutation } from "@/hooks/useQueryHooks";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { extractErrorMessage } from "@/lib/utils/extractErrorMessage";
import type { AxiosError } from "axios";

const MAX_ATTEMPTS = 5;
const LOCKOUT_SECONDS = 30;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const { isLoggedIn, setIsLoggedIn, setUserId, setIsAdmin } =
    React.useContext(AuthContext);

  // ── Brute-force friction ────────────────────────────────────────────────
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startLockout = () => {
    const until = Date.now() + LOCKOUT_SECONDS * 1000;
    setLockedUntil(until);
    setCountdown(LOCKOUT_SECONDS);
    timerRef.current = setInterval(() => {
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining <= 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
        setLockedUntil(null);
        setCountdown(0);
        setAttempts(0);
      } else {
        setCountdown(remaining);
      }
    }, 500);
  };

  const isLockedOut = lockedUntil !== null && Date.now() < lockedUntil;

  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const { t } = useTranslation("auth");
  const { settings, updateSetting } = useSettings();

  const parseUserId = (value: unknown): bigint | null => {
    if (typeof value === "bigint") return value;
    if (typeof value === "number" && Number.isFinite(value)) {
      return BigInt(Math.trunc(value));
    }
    if (typeof value === "string" && value.trim() !== "") {
      try {
        return BigInt(value);
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setIsLoggedIn(false);
    setUserId(null);
    setIsAdmin(false);
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      const parsedUserId = parseUserId(response?.id);
      if (parsedUserId === null) return;
      // Successful login — clear the attempt counter
      setAttempts(0);
      setUserId(parsedUserId);
      setIsAdmin(response?.role === "admin");
      setIsLoggedIn(true);
    } catch {
      // Count credential failures (401s that are not a ban response)
      const err = loginMutation.error as AxiosError | null;
      const data = err?.response?.data as Record<string, unknown> | undefined;
      const isBan = data && "banned_until" in data;
      if (!isBan && err?.response?.status === 401) {
        const next = attempts + 1;
        setAttempts(next);
        if (next >= MAX_ATTEMPTS) startLockout();
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn) navigate("/app/profile-selector");
  }, [navigate, isLoggedIn]);

  // Determine the best error message to show.
  // Any 401 that isn't a ban gets a single vague message — never reveal
  // whether the email exists or the password was wrong.
  const loginError = loginMutation.isError
    ? (() => {
        const err = loginMutation.error as AxiosError;
        const data = err?.response?.data as Record<string, unknown> | undefined;
        if (data && "banned_until" in data) {
          const until = data.banned_until;
          return until
            ? `Your account is banned until ${until}.`
            : "Your account has been permanently banned.";
        }
        if (err?.response?.status === 401)
          return t("login.errorInvalidCredentials");
        return extractErrorMessage(err, t("login.failed"));
      })()
    : null;

  const attemptsLeft = MAX_ATTEMPTS - attempts;
  const isFormDisabled = loginMutation.isPending || isLockedOut;

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
          <CardTitle>{t("login.title")}</CardTitle>
          <CardDescription>{t("login.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-900!">
                  {t("login.email")}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password" className="text-gray-900!">
                    {t("login.password")}
                  </FieldLabel>
                  <Link
                    to="/app/reset-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isFormDisabled}
                />
              </Field>

              {isLockedOut ? (
                <FormAlert
                  variant="error"
                  message={`Too many failed attempts. Try again in ${countdown}s.`}
                />
              ) : (
                <>
                  {loginError && (
                    <FormAlert variant="error" message={loginError} />
                  )}
                  {attempts > 0 && attempts < MAX_ATTEMPTS && (
                    <FormAlert
                      variant="info"
                      message={`${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining before a temporary lockout.`}
                    />
                  )}
                </>
              )}

              <Field>
                <Button
                  type="submit"
                  id="login-button"
                  className="text-white"
                  disabled={isFormDisabled}
                >
                  {loginMutation.isPending
                    ? t("login.submitting")
                    : isLockedOut
                      ? `Locked (${countdown}s)`
                      : t("login.submit")}
                </Button>
                <FieldDescription className="text-center">
                  {t("login.noAccount")}{" "}
                  <Link to="/app/signup">{t("login.signUp")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
