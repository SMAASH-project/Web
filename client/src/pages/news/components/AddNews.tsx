import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  getButtonClasses,
  getInputClasses,
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getSubtextColor,
  getBackgroundClasses,
  getTextColor,
} from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  AnimatedAccordion,
  AnimatedAccordionContent,
  AnimatedAccordionItem,
  AnimatedAccordionTrigger,
} from "@/animations/AnimatedAccordion";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, X } from "lucide-react";
import { useSettings } from "@/pages/settings/SettingsContext";
import { DateTime } from "luxon";
import type { NewsPost } from "@/types/PageTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RadioGroupChoiceCard } from "./RadioGroupChoiceCard";
import { ResizableVertical } from "./ResizableVertical";
import { ResizableHorizontal } from "./ResizableHorizontal";
import { CategorySelector } from "./CategorySelector";
import { useNewsForm } from "../useNewsForm";

export function AddNews({ onCreate }: { onCreate?: (post: NewsPost) => void }) {
  const { settings } = useSettings();
  const { t } = useTranslation("news");
  const buttonClass = getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "primary");
  const inputClass = getInputClasses(settings.useLiquidGlass, settings.useDarkMode);
  const dialogClass = getDialogClasses(settings.useLiquidGlass, settings.useDarkMode);
  const footerClass = getDialogFooterClasses(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode, "light");
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);

  const {
    open,
    setOpen,
    title,
    setTitle,
    content,
    setContent,
    category,
    setCategory,
    imagePosition,
    setImagePosition,
    imageAlt,
    setImageSize,
    fileInputRef,
    handleFileChange,
    clearImage,
    resetForm,
    getFormValues,
  } = useNewsForm();

  function handleSave() {
    const newPost: NewsPost = {
      id: Date.now().toString(),
      ...getFormValues(),
      createdAt: DateTime.now(),
    };

    onCreate?.(newPost);
    resetForm();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={`${buttonClass} ${textShadow} cursor-pointer rounded-lg`}>
          <MessageSquarePlus />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={`w-full max-w-full sm:max-w-3xl ${dialogClass} ${textShadow}`}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className={textColor}>{t("add.title")}</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label>{t("add.titleLabel")}</Label>
            <Input
              value={title}
              onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
              className={inputClass}
            />
          </Field>
          <Field>
            <Label>{t("add.categoryLabel")}</Label>
            <CategorySelector value={category} onValueChange={setCategory} />
          </Field>
        </FieldGroup>
        {settings.useAnimations ? (
          <AnimatedAccordion type="multiple" defaultValue={["content"]} className="w-full">
            <AnimatedAccordionItem value="image">
              <AnimatedAccordionTrigger className={textColor}>
                {t("add.imageSettings")}
              </AnimatedAccordionTrigger>
              <AnimatedAccordionContent>
                <FieldGroup>
                  <Field>
                    <Label className={`text-sm ${subtextColor}`}>{t("add.imagePosition")}</Label>
                    <div className="flex flex-row items-start gap-4">
                      <div className="flex shrink-0 flex-col gap-2">
                        <RadioGroupChoiceCard
                          value={imagePosition}
                          onValueChange={(v) => setImagePosition(v as "Top" | "Right")}
                          textColor={textColor}
                          subtextColor={subtextColor}
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          id="article-image"
                          name="articleImage"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className={inputClass}
                        />
                        {imageAlt && (
                          <div className="flex items-center gap-1">
                            <span className="text-muted-foreground truncate text-xs">
                              {t("add.current", { name: imageAlt })}
                            </span>
                            <button
                              type="button"
                              className="hover:bg-muted shrink-0 cursor-pointer rounded-md p-0.5 hover:text-red-500"
                              onClick={clearImage}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {imagePosition === "Top" ? (
                          <ResizableVertical
                            onImageSizeChange={setImageSize}
                            subtextColor={subtextColor}
                            inputClass={inputClass}
                          />
                        ) : (
                          <ResizableHorizontal
                            onImageSizeChange={setImageSize}
                            subtextColor={subtextColor}
                            inputClass={inputClass}
                          />
                        )}
                      </div>
                    </div>
                  </Field>
                </FieldGroup>
              </AnimatedAccordionContent>
            </AnimatedAccordionItem>
            <AnimatedAccordionItem value="content">
              <AnimatedAccordionTrigger className={textColor}>
                {t("add.content")}
              </AnimatedAccordionTrigger>
              <AnimatedAccordionContent>
                <FieldGroup>
                  <Field>
                    <Label className={`text-sm ${subtextColor}`}>
                      {t("add.markdownSupported")}
                    </Label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent((e.target as HTMLTextAreaElement).value)}
                      className={`min-h-32 w-full rounded-md px-3 py-2 text-sm ${inputClass}`}
                    />
                    {content && (
                      <div
                        className={`mt-2 rounded-md border ${bgClass} prose prose-sm prose-invert max-h-64 max-w-none overflow-y-auto p-3`}
                      >
                        <Label className="mb-1 text-xs">{t("add.previewText")}</Label>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                      </div>
                    )}
                  </Field>
                </FieldGroup>
              </AnimatedAccordionContent>
            </AnimatedAccordionItem>
          </AnimatedAccordion>
        ) : (
          <Accordion type="multiple" defaultValue={["content"]} className="w-full">
            <AccordionItem value="image">
              <AccordionTrigger className={textColor}>{t("add.imageSettings")}</AccordionTrigger>
              <AccordionContent>
                <FieldGroup>
                  <Field>
                    <Label className={`text-sm ${subtextColor}`}>{t("add.imagePosition")}</Label>
                    <div className="flex flex-row items-start gap-4">
                      <div className="flex shrink-0 flex-col gap-2">
                        <RadioGroupChoiceCard
                          value={imagePosition}
                          onValueChange={(v) => setImagePosition(v as "Top" | "Right")}
                          textColor={textColor}
                          subtextColor={subtextColor}
                        />
                        <Input
                          type="file"
                          accept="image/*"
                          id="article-image"
                          name="articleImage"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className={inputClass}
                        />
                        {imageAlt && (
                          <div className="flex items-center gap-1">
                            <span className={`text-xs ${subtextColor} truncate`}>
                              {t("add.current", { name: imageAlt })}
                            </span>
                            <button
                              type="button"
                              className="hover:bg-muted shrink-0 cursor-pointer rounded-md p-0.5 hover:text-red-500"
                              onClick={clearImage}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {imagePosition === "Top" ? (
                          <ResizableVertical
                            onImageSizeChange={setImageSize}
                            subtextColor={subtextColor}
                            inputClass={inputClass}
                          />
                        ) : (
                          <ResizableHorizontal
                            onImageSizeChange={setImageSize}
                            subtextColor={subtextColor}
                            inputClass={inputClass}
                          />
                        )}
                      </div>
                    </div>
                  </Field>
                </FieldGroup>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="content">
              <AccordionTrigger className={textColor}>{t("add.content")}</AccordionTrigger>
              <AccordionContent>
                <FieldGroup>
                  <Field>
                    <Label className={`text-sm ${subtextColor}`}>
                      {t("add.markdownSupported")}
                    </Label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent((e.target as HTMLTextAreaElement).value)}
                      className={`min-h-32 w-full rounded-md px-3 py-2 text-sm ${inputClass}`}
                    />
                    {content && (
                      <div
                        className={`mt-2 rounded-md border ${bgClass} prose prose-sm prose-invert max-h-64 max-w-none overflow-y-auto p-3`}
                      >
                        <Label className="mb-1 text-xs">{t("add.previewText")}</Label>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                      </div>
                    )}
                  </Field>
                </FieldGroup>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}
        <DialogFooter className={footerClass}>
          <DialogClose asChild>
            <Button
              variant="outline"
              className={`cursor-pointer ${getButtonClasses(settings.useLiquidGlass, settings.useDarkMode, "outline")} ${textShadow}`}
            >
              {t("add.cancel")}
            </Button>
          </DialogClose>
          <Button onClick={handleSave} className={`cursor-pointer ${buttonClass} ${textShadow}`}>
            {t("add.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
