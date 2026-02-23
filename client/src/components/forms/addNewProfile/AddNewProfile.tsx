import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateRandomUsername } from "@/lib/GenerateRandomUsername";

interface AddNewProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewProfile({ open, onOpenChange }: AddNewProfileProps) {
  const randomUsername = generateRandomUsername();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <form>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="username-1">Username</Label>
              <Input
                id="username-1"
                name="username"
                defaultValue={`${randomUsername.prefix}${randomUsername.suffix}`}
              />
            </Field>
            <Field>
              <Label htmlFor="profile-picture-1">Profile Picture</Label>
              <Input
                id="profile-picture-1"
                name="profilePicture"
                defaultValue=""
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
