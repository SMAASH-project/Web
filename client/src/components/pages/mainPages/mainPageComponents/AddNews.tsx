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
import { MessageSquarePlus } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { useState } from "react";
import { DateTime } from "luxon";
import type { NewsPost } from "@/lib/PageTypes";

export function AddNews({ onCreate }: { onCreate?: (post: NewsPost) => void }) {
  const { settings } = useSettings();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  function handleSave() {
    const newPost: NewsPost = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: DateTime.now() as ReturnType<typeof DateTime.now>,
    };

    onCreate?.(newPost);
    setTitle("");
    setContent("");
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
      <DialogContent className="w-full max-w-4xl! sm:max-w-4xl! overflow-visible">
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
          <Button onClick={handleSave}>Create Article</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
