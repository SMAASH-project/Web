import { Button } from "@/components/ui/button";
import {
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  Dialog,
} from "@/components/ui/dialog";
import { SquarePen, X } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NewsPost } from "@/types/PageTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RadioGroupChoiceCard } from "./RadioGroupChoiceCard";
import { ResizableVertical } from "./ResizableVertical";
import { ResizableHorizontal } from "./ResizableHorizontal";
import { useNewsForm } from "./newsPageLogic/useNewsForm";

export function EditButton({
  post,
  onUpdate,
}: {
  post: NewsPost;
  onUpdate?: (p: NewsPost) => void;
}) {
  const { settings } = useSettings();

  const {
    open,
    setOpen,
    title,
    setTitle,
    content,
    setContent,
    imagePosition,
    setImagePosition,
    imageAlt,
    setImageSize,
    fileInputRef,
    handleFileChange,
    clearImage,
    resetForm,
    getFormValues,
  } = useNewsForm({ initial: post });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      resetForm(post);
    }
  };

  const handleSave = () => {
    onUpdate?.({
      ...post,
      ...getFormValues(),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
        >
          <SquarePen />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-4xl! sm:max-w-4xl! overflow-visible"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit News Article</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle((e.target as HTMLInputElement).value)}
            />
          </Field>
          <Field>
            <Label>Image Position</Label>
            <div className="flex flex-row gap-4 items-start">
              <div className="flex flex-col gap-2 max-w-sm">
                <RadioGroupChoiceCard
                  value={imagePosition}
                  onValueChange={(v) => setImagePosition(v as "Top" | "Right")}
                />
                <Input
                  type="file"
                  accept="image/*"
                  id="article-image"
                  name="articleImage"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                />
                {imageAlt && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground truncate">
                      Current: {imageAlt}
                    </span>
                    <button
                      type="button"
                      className="shrink-0 cursor-pointer rounded-md p-0.5 hover:bg-muted hover:text-red-500"
                      onClick={clearImage}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-auto">
                {imagePosition === "Top" ? (
                  <ResizableVertical
                    onImageSizeChange={setImageSize}
                    initialImageSize={post.imageSize ?? 25}
                  />
                ) : (
                  <ResizableHorizontal
                    onImageSizeChange={setImageSize}
                    initialImageSize={post.imageSize ?? 25}
                  />
                )}
              </div>
            </div>
          </Field>
          <Field>
            <Label>Content (Markdown supported)</Label>
            <textarea
              value={content}
              onChange={(e) =>
                setContent((e.target as HTMLTextAreaElement).value)
              }
              className="w-full min-h-32 rounded-md bg-input px-3 py-2 text-sm"
            />
            {content && (
              <div className="mt-2 rounded-md border bg-gray-800/60 p-3 max-h-64 overflow-y-auto prose prose-sm prose-invert max-w-none">
                <Label className="text-xs mb-1">Preview Text</Label>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {content}
                </ReactMarkdown>
              </div>
            )}
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={handleSave} className="cursor-pointer">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
