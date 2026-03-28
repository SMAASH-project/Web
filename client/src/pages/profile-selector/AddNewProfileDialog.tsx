import { useTranslation } from "react-i18next";
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
import { FormAlert } from "@/components/ui/form-alert";
import { generateRandomUsername } from "@/lib/GenerateRandomUsername";
import { useProfiles } from "./useProfiles";
import { useEffect, useState } from "react";

interface AddNewProfileProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddNewProfile({ open, onOpenChange }: AddNewProfileProps) {
  const { addProfile, profiles } = useProfiles();
  const { t } = useTranslation("profile");
  const [username, setUsername] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate a username that's not already in `profiles`.
  const generateUniqueUsername = () => {
    const existing = new Set(profiles.map((p) => p.name));
    for (let i = 0; i < 20; i++) {
      const r = generateRandomUsername();
      const candidate = `${r.prefix}${r.suffix}`;
      if (!existing.has(candidate)) return candidate;
    }
    let counter = 1;
    while (true) {
      const r = generateRandomUsername();
      const candidate = `${r.prefix}${r.suffix}-${counter}`;
      if (!existing.has(candidate)) return candidate;
      counter++;
    }
  };

  // When the dialog opens, pick a fresh unique username and clear state.
  useEffect(() => {
    if (open) {
      setError(null);
      setUsername(generateUniqueUsername());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const normalizedUsername = username.trim();

    if (!normalizedUsername) {
      setError(t("addProfile.errorUsernameRequired"));
      return;
    }

    if (normalizedUsername.length > 20) {
      setError(t("addProfile.errorUsernameTooLong"));
      return;
    }

    if (profiles.some((p) => p.name === normalizedUsername)) {
      setError(t("addProfile.errorUsernameTaken"));
      setUsername(generateUniqueUsername());
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await addProfile({
        name: normalizedUsername,
        avatar: "",
        avatarFile: profilePicture,
      });
      onOpenChange(false);
      setUsername("");
      setProfilePicture(null);
    } catch (err) {
      console.error("Failed to add profile:", err);
      setError(t("addProfile.errorSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("addProfile.title")}</DialogTitle>
            <DialogDescription>{t("addProfile.description")}</DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field>
              <Label htmlFor="username-1" className="text-gray-900!">
                {t("addProfile.username")}
              </Label>
              <Input
                type="text"
                id="username-1"
                name="username"
                value={username}
                maxLength={20}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
              />
            </Field>
            <Field>
              <Label htmlFor="profile-picture-1" className="text-gray-900!">
                {t("addProfile.profilePicture")}
              </Label>
              <Input
                type="file"
                id="profile-picture-1"
                name="profilePicture"
                onChange={(e) => {
                  if (e.target.files) {
                    const file = e.target.files[0];
                    setProfilePicture(file ?? null);
                  }
                }}
              />
            </Field>
            {error && <FormAlert variant="error" message={error} />}
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isSubmitting}>
                {t("addProfile.cancel")}
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("addProfile.saving") : t("addProfile.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
