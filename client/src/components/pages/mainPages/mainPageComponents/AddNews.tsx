import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SquarePen, Trash2, MessageSquarePlus } from "lucide-react";

export function AddNews() {
  return (
    <Dialog>
      <DialogTrigger>
        <ButtonGroup orientation="horizontal">
          <Button className="cursor-pointer">
            <MessageSquarePlus />
          </Button>
          <Button className="cursor-pointer">
            <SquarePen />
          </Button>
          <Button className="cursor-pointer">
            <Trash2 />
          </Button>
        </ButtonGroup>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create new News Article</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="username-1">Username</Label>
            <Input />
          </Field>
          <Field>
            <Label htmlFor="profile-picture-1">Profile Picture</Label>
            <Input />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
