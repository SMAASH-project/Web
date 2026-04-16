import { useState, useRef } from "react";
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
import { SquarePen, Loader2, Upload, X, ImageOff } from "lucide-react";
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
import { motion, AnimatePresence } from "motion/react";
import type { WebstoreItem } from "@/types/PageTypes";
import { ImageCropDialog } from "@/components/ImageCropDialog";

const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Legendary"] as const;
const COMBAT_TYPES = ["Melee", "Ranged"] as const;

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

type UpdateData = {
  name: string;
  combatType?: (typeof COMBAT_TYPES)[number];
  rarity: (typeof RARITIES)[number];
  description: string;
  price: number;
  imageFile?: File;
};

interface EditItemDialogProps {
  item: WebstoreItem;
  onUpdate: (data: UpdateData) => void;
  isLoading?: boolean;
}

export function EditItemDialog({ item, onUpdate, isLoading = false }: EditItemDialogProps) {
  const { settings } = useSettings();
  const { t } = useTranslation("webstore");

  const [open, setOpen] = useState(false);
  const [name, setName] = useState(item.name);
  const [combatType, setCombatType] = useState<(typeof COMBAT_TYPES)[number]>(
    item.combatType ?? "Melee",
  );
  const [rarity, setRarity] = useState<(typeof RARITIES)[number]>(
    item.rarity as (typeof RARITIES)[number],
  );
  const [description, setDescription] = useState(item.description);
  const [price, setPrice] = useState(String(item.price));
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropOpen, setCropOpen] = useState(false);

  const buttonClass = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode);
  const inputClass = getInputClasses(settings.useLiquidGlass, settings.useDarkMode);
  const dialogClass = getDialogClasses(settings.useLiquidGlass, settings.useDarkMode);
  const footerClass = getDialogFooterClasses(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode, "strong");
  const glass = settings.useLiquidGlass;

  // Whether to show the current server image (no new file chosen yet)
  const showCurrentImage = item.imgUri !== "" && newImageFile === null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return;
    setCropFile(file);
    setCropOpen(true);
    // Reset so the same file can be re-selected after cancel
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCropApply = (croppedFile: File) => {
    setCropOpen(false);
    setCropFile(null);
    if (newImagePreview) URL.revokeObjectURL(newImagePreview);
    setNewImageFile(croppedFile);
    setNewImagePreview(URL.createObjectURL(croppedFile));
  };

  const handleCropCancel = () => {
    setCropOpen(false);
    setCropFile(null);
  };

  const clearNewImage = () => {
    setNewImageFile(null);
    if (newImagePreview) {
      URL.revokeObjectURL(newImagePreview);
      setNewImagePreview(null);
    }
    setCropFile(null);
    setCropOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetToItem = () => {
    setName(item.name);
    setCombatType(item.combatType ?? "Melee");
    setRarity(item.rarity as (typeof RARITIES)[number]);
    setDescription(item.description);
    setPrice(String(item.price));
    clearNewImage();
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || !price) return;
    onUpdate({
      name: name.trim(),
      combatType,
      rarity,
      description: description.trim(),
      price: Number(price),
      imageFile: newImageFile ?? undefined,
    });
    setOpen(false);
  };

  const isFormValid =
    name.trim() !== "" && description.trim() !== "" && price !== "" && Number(price) > 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) resetToItem();
        else clearNewImage();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={`h-8 w-8 cursor-pointer p-0 ${glass ? textColor : subtextColor} hover:text-blue-400 ${
            glass ? "hover:bg-blue-500/15" : "hover:bg-blue-900/30"
          }`}
        >
          <SquarePen className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent
        className={`${dialogClass} ${textShadow}`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={textColor}>{t("edit.title")}</DialogTitle>
          <DialogDescription className={subtextColor}>{t("edit.description")}</DialogDescription>
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
                    {t(`rarity.${r.toLowerCase()}`)}
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
                renderOption={(c) => t(`filters.${c.toLowerCase()}`)}
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
              maxLength={70}
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

          {/* Image section */}
          <Field>
            <Label className={textColor}>{t("create.image")}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={handleImageChange}
            />
            <AnimatePresence mode="wait">
              {newImagePreview ? (
                /* New file chosen — show preview with clear button */
                <motion.div
                  key="new-preview"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-32 w-full overflow-hidden rounded-lg"
                >
                  <img src={newImagePreview} alt="new preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={clearNewImage}
                    className="absolute top-1.5 right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : showCurrentImage ? (
                /* Existing server image — show it with a replace button */
                <motion.div
                  key="current-image"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative h-32 w-full overflow-hidden rounded-lg"
                >
                  <img
                    src={`/api/characters/${item.id}/img`}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity hover:opacity-100"
                  >
                    <Upload className="h-5 w-5 text-white" />
                    <span className="text-xs font-medium text-white">{t("edit.replaceImage")}</span>
                  </button>
                </motion.div>
              ) : (
                /* No image at all — show upload area */
                <motion.button
                  key="upload"
                  type="button"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed transition-colors ${inputClass}`}
                >
                  <ImageOff className={`h-5 w-5 ${subtextColor} opacity-50`} />
                  <span className={`text-xs ${subtextColor}`}>{t("create.imagePlaceholder")}</span>
                  <Upload className={`h-3.5 w-3.5 ${subtextColor} opacity-50`} />
                </motion.button>
              )}
            </AnimatePresence>
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
                {t("edit.saving")}
              </>
            ) : (
              t("edit.submit")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <ImageCropDialog
      open={cropOpen}
      file={cropFile}
      aspectRatio={16 / 9}
      onApply={handleCropApply}
      onCancel={handleCropCancel}
    />
  );
}
