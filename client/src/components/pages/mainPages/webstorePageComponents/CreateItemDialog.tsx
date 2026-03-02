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
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { Plus } from "lucide-react";

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
const CATEGORIES = [
  "Weapons",
  "Armor",
  "Consumables",
  "Utilities",
  "Accessories",
];

interface CreateItemDialogProps {
  onCreate: (data: {
    name: string;
    category: string;
    rarity: (typeof RARITIES)[number];
    description: string;
    price: number;
  }) => void;
}

export function CreateItemDialog({ onCreate }: CreateItemDialogProps) {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>("Common");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || !price) return;
    onCreate({
      name: name.trim(),
      category,
      rarity,
      description: description.trim(),
      price: Number(price),
    });
    setName("");
    setCategory(CATEGORIES[0]);
    setRarity("Common");
    setDescription("");
    setPrice("");
    setOpen(false);
  };

  const inputCls = `text-white ${
    glass
      ? "bg-white/10 border-white/20 focus:bg-white/15 focus:border-white/40"
      : "bg-gray-700/60 border-gray-600 focus:bg-gray-700"
  }`;

  const selectCls = `w-full rounded-lg border px-3 py-2 text-sm outline-none transition-all ${inputCls}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`cursor-pointer gap-2 ${
            glass
              ? "bg-white/20 text-white hover:bg-white/30 [text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
              : "bg-green-600 text-white hover:bg-green-500"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Create Item</span>
        </Button>
      </DialogTrigger>

      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create New Item</DialogTitle>
          <DialogDescription>Add a new item to the webstore.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-white/80 text-xs">Name</Label>
            <Input
              value={name}
              onChange={(e) => setName((e.target as HTMLInputElement).value)}
              placeholder="Item name"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-white/80 text-xs">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectCls}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="bg-gray-800">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-white/80 text-xs">Rarity</Label>
              <select
                value={rarity}
                onChange={(e) =>
                  setRarity(e.target.value as (typeof RARITIES)[number])
                }
                className={selectCls}
              >
                {RARITIES.map((r) => (
                  <option key={r} value={r} className="bg-gray-800">
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-white/80 text-xs">Description</Label>
            <Input
              value={description}
              onChange={(e) =>
                setDescription((e.target as HTMLInputElement).value)
              }
              placeholder="Item description"
              className={inputCls}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-white/80 text-xs">Price</Label>
            <Input
              type="number"
              min={1}
              value={price}
              onChange={(e) => setPrice((e.target as HTMLInputElement).value)}
              placeholder="0"
              className={inputCls}
            />
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={!name.trim() || !description.trim() || !price}
            className="cursor-pointer"
          >
            Create Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
