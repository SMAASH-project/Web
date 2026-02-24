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
import { useEffect, useState } from "react";
import SlimeArt from "../../../assets/SlimeArt.png";

interface AddNewProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewProfile({ open, onOpenChange }: AddNewProfileProps) {
  const { addProfile, profiles } = useProfiles();
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Generate a username that's not already in `profiles`.
  const generateUniqueUsername = () => {
    const existing = new Set(profiles.map((p) => p.name));
    // Try a few times to get a random username that isn't taken.
    for (let i = 0; i < 20; i++) {
      const r = generateRandomUsername();
      const candidate = `${r.prefix}${r.suffix}`;
      if (!existing.has(candidate)) return candidate;
    }
    // Fallback: append a counter to ensure uniqueness.
    let counter = 1;
    while (true) {
      const r = generateRandomUsername();
      const candidate = `${r.prefix}${r.suffix}-${counter}`;
      if (!existing.has(candidate)) return candidate;
      counter++;
    }
  };

  // When the dialog opens, pick a fresh unique username.
  useEffect(() => {
    if (open) {
      setError(null);
      setUsername(generateUniqueUsername());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const [profilePicture, setProfilePicture] = useState(SlimeArt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate uniqueness on submit
    if (profiles.some((p) => p.name === username)) {
      setError(
        "That username is already in use. Please choose a different one.",
      );
      // Rerandomize so the user gets a fresh suggestion
      setUsername(generateUniqueUsername());
      return;
    }

    addProfile({
      name: username,
      avatar: profilePicture,
    });
    setError(null);
    onOpenChange(false);
    // Prepare a fresh suggestion for the next time the dialog opens.
    setUsername("");
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
                type="text"
                id="username-1"
                name="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
              />
            </Field>
            {error ? (
              <div className="mt-1 text-sm text-red-600" role="alert">
                {error}
              </div>
            ) : null}
            <Field>
              <Label htmlFor="profile-picture-1">Profile Picture</Label>
              <Input
                type="file"
                id="profile-picture-1"
                name="profilePicture"
                onChange={(e) => {
                  if (e.target.files) {
                    const file = e.target.files[0];
                    setProfilePicture(URL.createObjectURL(file));
                  }
                }}
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
