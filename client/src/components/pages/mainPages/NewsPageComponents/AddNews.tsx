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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquarePlus, X } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { useState, useRef } from "react";
import { DateTime } from "luxon";
import type { NewsPost } from "@/types/PageTypes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { RadioGroupChoiceCard } from "./RadioGroupChoiceCard";
import { ResizableVertical } from "./ResizableVertical";
import { ResizableHorizontal } from "./ResizableHorizontal";

export function AddNews({ onCreate }: { onCreate?: (post: NewsPost) => void }) {
  const { settings } = useSettings();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imagePosition, setImagePosition] = useState<"Top" | "Right">("Top");
  const [image, setImage] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageSize, setImageSize] = useState(25);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageAlt(file.name.replace(/\.[^.]+$/, ""));
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function handleSave() {
    const newPost: NewsPost = {
      id: Date.now().toString(),
      title,
      content,
      image,
      imageAlt,
      imagePosition,
      imageSize,
      createdAt: DateTime.now() as ReturnType<typeof DateTime.now>,
    };

    onCreate?.(newPost);
    setTitle("");
    setContent("");
    setImage("");
    setImageAlt("");
    setImagePosition("Top");
    setImageSize(25);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className={`text-white ${settings.useLiquidGlass ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)] rounded-lg bg-white/30" : ""} cursor-pointer`}
        >
          <MessageSquarePlus />
        </Button>
      </DialogTrigger>
      <DialogContent
        className="w-full max-w-4xl! sm:max-w-4xl! overflow-visible"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Create new News Article</DialogTitle>
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
                      onClick={() => {
                        setImage("");
                        setImageAlt("");
                        if (fileInputRef.current)
                          fileInputRef.current.value = "";
                      }}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="ml-auto">
                {imagePosition === "Top" ? (
                  <ResizableVertical onImageSizeChange={setImageSize} />
                ) : (
                  <ResizableHorizontal onImageSizeChange={setImageSize} />
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
            Create Article
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
