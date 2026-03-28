import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function NotFoundPage() {
  const { t } = useTranslation("common");
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("notFound.title")}</h1>
      <p>{t("notFound.description")}</p>
      <Button className="mt-4" onClick={() => window.history.back()}>
        {t("notFound.back")}
      </Button>
    </div>
  );
}
