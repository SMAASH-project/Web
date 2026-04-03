import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import React from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/pages/settings/SettingsContext";
import { LanguageToggle } from "@/components/ui/LanguageToggle";

export function PasswordResetPage({ className, ...props }: React.ComponentProps<"div">) {
  const { t } = useTranslation("auth");
  const { settings, updateSetting } = useSettings();

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
          <form>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="text-gray-900!">
                  {t("reset.email")}
                </FieldLabel>
                <Input id="email" type="email" placeholder="m@example.com" required />
              </Field>
              <Field>
                <Button type="submit" className="text-white">
                  {t("reset.submit")}
                </Button>
                <FieldDescription className="text-center">
                  {t("reset.noAccount")} <Link to="/app/signup">{t("reset.signUp")}</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
