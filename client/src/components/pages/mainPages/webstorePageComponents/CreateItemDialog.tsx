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
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Field, FieldGroup } from "@/components/ui/field";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Plus, Loader2, ChevronDown, Check } from "lucide-react";
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

// ─── Reusable styled dropdown ──────────────────────────────────────────────────

interface StyledSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (val: T) => void;
  inputClass: string;
  textColor: string;
  bgClass: string;
  renderOption?: (opt: T) => React.ReactNode;
}

function StyledSelect<T extends string>({
  value,
  options,
  onChange,
  inputClass,
  textColor,
  bgClass,
  renderOption,
}: StyledSelectProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`w-full flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition-colors cursor-pointer ${inputClass}`}
        >
          <span className={`${textColor} flex items-center gap-2`}>
            {renderOption ? renderOption(value) : value}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 opacity-50 ${textColor}`}
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`min-w-[var(--radix-dropdown-menu-trigger-width)] ${bgClass} border-none shadow-xl`}
        align="start"
        sideOffset={4}
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex items-center justify-between gap-2 cursor-pointer ${textColor} hover:opacity-80`}
          >
            <span className="flex items-center gap-2">
              {renderOption ? renderOption(opt) : opt}
            </span>
            {opt === value && <Check className="w-3.5 h-3.5 opacity-60" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
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
