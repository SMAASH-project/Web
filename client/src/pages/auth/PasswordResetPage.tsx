import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { FormAlert } from "@/components/ui/form-alert";
import { Link } from "react-router-dom";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/pages/settings/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function PasswordResetPage({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation("auth");
  const { settings, updateSetting } = useSettings();

  const [email, setEmail] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
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
          <CardTitle>{t("reset.title")}</CardTitle>
          <CardDescription>{t("reset.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-900!">
                  {t("reset.email")}
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={submitted}
                />
              </Field>

              {submitted && <FormAlert variant="info" message={t("reset.notAvailable")} />}

              <Field>
                <Button type="submit" className="text-white" disabled={submitted}>
                  {t("reset.submit")}
                </Button>
                <FieldDescription className="text-center">
                  {t("reset.backToLogin")} <Link to="/app/login">{t("reset.logIn")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
