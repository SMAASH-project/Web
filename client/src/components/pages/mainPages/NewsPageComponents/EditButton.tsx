import { useState, useRef } from "react";
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
import { SquarePen } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { FieldGroup, Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { NewsPost } from "@/types/PageTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RadioGroupChoiceCard } from "./RadioGroupChoiceCard";
import { ResizableVertical } from "./ResizeableVertical";
import { ResizableHorizontal } from "./ResizeableHorizontal";

export function EditButton({
  post,
  onUpdate,
}: {
  post: NewsPost;
  onUpdate?: (p: NewsPost) => void;
}) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(post.title ?? "");
  const [content, setContent] = useState(post.content ?? "");
  const [imagePosition, setImagePosition] = useState<"Top" | "Right">(
    post.imagePosition ?? "Top",
  );
  const [image, setImage] = useState(post.image ?? "");
  const [imageAlt, setImageAlt] = useState(post.imageAlt ?? "");
  const [imageSize, setImageSize] = useState(post.imageSize ?? 25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageAlt(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  // When dialog opens, ensure inputs reflect current post
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(post.title ?? "");
      setContent(post.content ?? "");
      setImagePosition(post.imagePosition ?? "Top");
      setImage(post.image ?? "");
      setImageAlt(post.imageAlt ?? "");
      setImageSize(post.imageSize ?? 25);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    onUpdate?.({
      ...post,
      title,
      content,
      image,
      imageAlt,
      imagePosition,
      imageSize,
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
              </div>
              <div className="ml-auto">
                {imagePosition === "Top" ? (
                  <ResizableVertical
                    onImageSizeChange={setImageSize}
                    initialImageSize={imageSize}
                  />
                ) : (
                  <ResizableHorizontal
                    onImageSizeChange={setImageSize}
                    initialImageSize={imageSize}
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
