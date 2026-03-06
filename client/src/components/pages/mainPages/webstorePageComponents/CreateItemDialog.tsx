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
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Plus } from "lucide-react";
import {
  getButtonClasses,
  getInputClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
} from "@/lib/utils";

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
const KINDS = ["Character", "Skin"] as const;
const COMBAT_TYPES = ["Melee", "Ranged"] as const;

interface CreateItemDialogProps {
  onCreate: (data: {
    name: string;
    kind: (typeof KINDS)[number];
    combatType?: (typeof COMBAT_TYPES)[number];
    rarity: (typeof RARITIES)[number];
    description: string;
    price: number;
  }) => void;
}

export function CreateItemDialog({ onCreate }: CreateItemDialogProps) {
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

  const selectCls =
    "w-full rounded-md border border-input bg-transparent dark:bg-input/30 px-3 py-2 text-base md:text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]";

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
          <DialogTitle className={textShadow}>Create New Item</DialogTitle>
          <DialogDescription className={subtextColor}>
            Add a new item to the webstore.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label>Name</Label>
            <Input
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Item name"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field>
              <Label>Kind</Label>
              <select
                value={kind}
                onChange={(e) =>
                  setKind(e.target.value as (typeof KINDS)[number])
                }
                className={`${selectCls} ${inputClass}`}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <Label>Rarity</Label>
              <select
                value={rarity}
                onChange={(e) =>
                  setRarity(e.target.value as (typeof RARITIES)[number])
                }
                className={`${selectCls} ${inputClass}`}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {kind === "Character" && (
            <Field>
              <Label>Combat Type</Label>
              <select
                value={combatType}
                onChange={(e) =>
                  setCombatType(e.target.value as (typeof COMBAT_TYPES)[number])
                }
                className={`${selectCls} ${inputClass}`}
              >
                {COMBAT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field>
            <Label>Description</Label>
            <Input
              value={description}
              onChange={(e) =>
                setDescription((e.target as HTMLInputElement).value)
              }
              placeholder="Item description"
              className={inputClass}
            />
          </Field>

          <Field>
            <Label>Price</Label>
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
            disabled={!name.trim() || !description.trim() || !price}
            className={`cursor-pointer ${buttonClass} ${textShadow}`}
          >
            Create Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
