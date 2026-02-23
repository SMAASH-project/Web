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
import { useProfiles } from "./useProfiles";
import { useState } from "react";
import SlimeArt from "../../../assets/SlimeArt.png";

interface AddNewProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewProfile({ open, onOpenChange }: AddNewProfileProps) {
  const randomUsername = generateRandomUsername();
  const { addProfile } = useProfiles();
  const [username, setUsername] = useState(
    `${randomUsername.prefix}${randomUsername.suffix}`,
  );
  const [profilePicture, setProfilePicture] = useState(SlimeArt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addProfile({
      name: username,
      avatar: profilePicture,
    });
    onOpenChange(false);
    setUsername(`${randomUsername.prefix}${randomUsername.suffix}`);
    setProfilePicture(SlimeArt);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
            <DialogDescription>
              Add a new profile to your account. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="username-1">Username</Label>
              <Input
                id="username-1"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field>
            <Field>
              <Label htmlFor="profile-picture-1">Profile Picture URL</Label>
              <Input
                id="profile-picture-1"
                name="profilePicture"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
