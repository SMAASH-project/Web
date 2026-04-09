import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { StyledSelect } from "@/components/ui/styled-select";
import { useSettings } from "@/pages/settings/SettingsContext";
import { Plus, Loader2 } from "lucide-react";
import {
  getButtonClasses,
  getInputClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
  getTextColor,
  getBackgroundClasses,
} from "@/lib/utils";

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
const COMBAT_TYPES = ["Melee", "Ranged"] as const;

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

interface CreateItemDialogProps {
  onCreate: (data: {
    name: string;
    combatType: (typeof COMBAT_TYPES)[number];
    rarity: (typeof RARITIES)[number];
    description: string;
    price: number;
  }) => void;
  isLoading?: boolean;
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CreateItemDialog({ onCreate, isLoading = false }: CreateItemDialogProps) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [combatType, setCombatType] = useState<(typeof COMBAT_TYPES)[number]>("Melee");
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>("Common");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const { t } = useTranslation("webstore");
  const buttonClass = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode);
  const inputClass = getInputClasses(settings.useLiquidGlass, settings.useDarkMode);
  const dialogClass = getDialogClasses(settings.useLiquidGlass, settings.useDarkMode);
  const footerClass = getDialogFooterClasses(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode, "strong");

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || !price) return;
    onCreate({
      name: name.trim(),
      combatType,
      rarity,
      description: description.trim(),
      price: Number(price),
    });
    setName("");
    setCombatType("Melee");
    setRarity("Common");
    setDescription("");
    setPrice("");
    setOpen(false);
  };

  const isFormValid =
    name.trim() !== "" && description.trim() !== "" && price !== "" && Number(price) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={`cursor-pointer gap-2 ${buttonClass} ${textShadow}`}>
          <Plus className="h-4 w-4" />
          <span className="text-sm font-medium">{t("create.triggerButton")}</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`${dialogClass} ${textShadow}`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={textColor}>{t("create.title")}</DialogTitle>
          <DialogDescription className={subtextColor}>{t("create.description")}</DialogDescription>
        </DialogHeader>

        <FieldGroup>
          {/* Name */}
          <Field>
            <Label className={textColor}>{t("create.name")}</Label>
            <Input
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder={t("create.namePlaceholder")}
              maxLength={20}
              className={inputClass}
            />
          </Field>

          {/* Rarity + Combat Type row */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label className={textColor}>{t("create.rarity")}</Label>
              <StyledSelect
                value={rarity}
                options={RARITIES}
                onChange={setRarity}
                inputClass={inputClass}
                textColor={textColor}
                bgClass={bgClass}
                renderOption={(r) => (
                  <>
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: RARITY_COLORS[r] }}
                    />
                    {r}
                  </>
                )}
              />
            </Field>
            <Field>
              <Label className={textColor}>{t("create.combatType")}</Label>
              <StyledSelect
                value={combatType}
                options={COMBAT_TYPES}
                onChange={setCombatType}
                inputClass={inputClass}
                textColor={textColor}
                bgClass={bgClass}
              />
            </Field>
          </div>

          {/* Description */}
          <Field>
            <Label className={textColor}>{t("create.descriptionLabel")}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription((e.target as HTMLInputElement).value)}
              placeholder={t("create.descriptionPlaceholder")}
              maxLength={50}
              className={inputClass}
            />
          </Field>

          {/* Price */}
          <Field>
            <Label className={textColor}>{t("create.price")}</Label>
            <Input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice((e.target as HTMLInputElement).value)}
              placeholder="0"
              className={inputClass}
            />
          </Field>
        </FieldGroup>

        <DialogFooter className={footerClass}>
          <DialogClose asChild>
            <Button variant="outline" className={`cursor-pointer ${buttonClass} ${textShadow}`}>
              {t("create.cancel")}
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`cursor-pointer ${buttonClass} ${textShadow}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("create.creating")}
              </>
            ) : (
              t("create.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
