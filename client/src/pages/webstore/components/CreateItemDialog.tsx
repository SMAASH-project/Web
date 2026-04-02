import { useState } from "react";
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
const KINDS = ["Character", "Skin"] as const;
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
    kind: (typeof KINDS)[number];
    combatType?: (typeof COMBAT_TYPES)[number];
    rarity: (typeof RARITIES)[number];
    description: string;
    price: number;
  }) => void;
  isLoading?: boolean;
}

// ─── Main component ────────────────────────────────────────────────────────────

export function CreateItemDialog({
  onCreate,
  isLoading = false,
}: CreateItemDialogProps) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [kind, setKind] = useState<(typeof KINDS)[number]>("Character");
  const [combatType, setCombatType] =
    useState<(typeof COMBAT_TYPES)[number]>("Melee");
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>("Common");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const buttonClass = getButtonClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const inputClass = getInputClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const dialogClass = getDialogClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const footerClass = getDialogFooterClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "strong",
  );

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || !price) return;
    onCreate({
      name: name.trim(),
      kind,
      ...(kind === "Character" ? { combatType } : {}),
      rarity,
      description: description.trim(),
      price: Number(price),
    });
    setName("");
    setKind("Character");
    setCombatType("Melee");
    setRarity("Common");
    setDescription("");
    setPrice("");
    setOpen(false);
  };

  const isFormValid =
    name.trim() !== "" &&
    description.trim() !== "" &&
    price !== "" &&
    Number(price) > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`cursor-pointer gap-2 ${buttonClass} ${textShadow}`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Create Item</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`${dialogClass} ${textShadow}`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={textColor}>Create New Item</DialogTitle>
          <DialogDescription className={subtextColor}>
            Add a new item to the webstore.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          {/* Name */}
          <Field>
            <Label className={textColor}>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Item name"
              maxLength={20}
              className={inputClass}
            />
          </Field>

          {/* Kind + Rarity row */}
          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label className={textColor}>Kind</Label>
              <StyledSelect
                value={kind}
                options={KINDS}
                onChange={setKind}
                inputClass={inputClass}
                textColor={textColor}
                bgClass={bgClass}
              />
            </Field>
            <Field>
              <Label className={textColor}>Rarity</Label>
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
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: RARITY_COLORS[r] }}
                    />
                    {r}
                  </>
                )}
              />
            </Field>
          </div>

          {/* Combat type — only for Characters */}
          {/* Combat type — only for Characters */}
          {kind === "Character" && (
            <Field>
              <Label className={textColor}>Combat Type</Label>
              <StyledSelect
                value={combatType}
                options={COMBAT_TYPES}
                onChange={setCombatType}
                inputClass={inputClass}
                textColor={textColor}
                bgClass={bgClass}
              />
            </Field>
          )}

          {/* Description */}
          <Field>
            <Label className={textColor}>Description</Label>
            <Input
              value={description}
              onChange={(e) =>
                setDescription((e.target as HTMLInputElement).value)
              }
              placeholder="Item description"
              maxLength={50}
              className={inputClass}
            />
          </Field>

          {/* Price */}
          <Field>
            <Label className={textColor}>Price</Label>
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
            <Button
              variant="outline"
              className={`cursor-pointer ${buttonClass} ${textShadow}`}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isLoading}
            className={`cursor-pointer ${buttonClass} ${textShadow}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Item"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
