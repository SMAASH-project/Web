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
import React, { useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useLoginMutation } from "@/hooks/useQueryHooks";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { extractErrorMessage } from "@/lib/utils/extractErrorMessage";
import type { AxiosError } from "axios";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [password, setPassword] = React.useState("");
  const [email, setEmail] = React.useState("");
  const { isLoggedIn, setIsLoggedIn, setUserId, setIsAdmin } =
    React.useContext(AuthContext);

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
    setIsLoggedIn(false);
    setUserId(null);
    setIsAdmin(false);
    try {
      const response = await loginMutation.mutateAsync({ email, password });
      const parsedUserId = parseUserId(response?.id);
      if (parsedUserId === null) return;
      setUserId(parsedUserId);
      setIsAdmin(response?.role === "admin");
      setIsLoggedIn(true);
    } catch {
      // error displayed via loginMutation.isError below
    }
  };

  useEffect(() => {
    if (isLoggedIn) navigate("/app/profile-selector");
  }, [navigate, isLoggedIn]);

  // Determine the best error message to show
  const loginError = loginMutation.isError
    ? extractErrorMessage(
        loginMutation.error as AxiosError,
        // Use specific "invalid credentials" copy for 401, generic fallback otherwise
        (loginMutation.error as AxiosError)?.response?.status === 401
          ? t("login.errorInvalidCredentials")
          : t("login.failed"),
      )
    : null;

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
                  disabled={loginMutation.isPending}
                />
              </Field>

              {loginError && <FormAlert variant="error" message={loginError} />}

              <Field>
                <Button
                  type="submit"
                  id="login-button"
                  className="text-white"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending
                    ? t("login.submitting")
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
