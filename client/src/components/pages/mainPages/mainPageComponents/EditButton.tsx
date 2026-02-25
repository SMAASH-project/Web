import { useState } from "react";
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
import type { NewsPost } from "@/lib/PageTypes";

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

  // When dialog opens, ensure inputs reflect current post
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setTitle(post.title ?? "");
      setContent(post.content ?? "");
    }
  };

  const handleSave = () => {
    onUpdate?.({ ...post, title, content });
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
      <DialogContent className="w-full max-w-3xl">
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
            <Label>Content</Label>
            <textarea
              value={content}
              onChange={(e) =>
                setContent((e.target as HTMLTextAreaElement).value)
              }
              className="w-full min-h-32 rounded-md bg-input px-3 py-2 text-sm"
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
