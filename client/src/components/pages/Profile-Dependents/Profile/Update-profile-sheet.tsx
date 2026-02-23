import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FieldGroup, Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { useSettings } from "../Settings/settings-logic/SettingsContext";

const Username = "placeholder";
const Email = "lorem@ipsum.com";
const Password = "password";

export function UpdateSheet() {
  const { settings } = useSettings();
  const [showPassword, setShowPassword] = React.useState(false);
  return (
    <div className="z-101">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
          >
            Edit
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. <br />
              Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label htmlFor="sheet-username">Username</Label>
              <Input id="sheet-name" defaultValue={Username} />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="sheet-email">Email Adress</Label>
              <Input id="sheet-email" type="email" defaultValue={Email} />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="sheet-username" className="cursor-pointer">
                  Password
                </Label>
                <FieldGroup>
                  <Field>
                    {/* Container to align checkbox and label horizontally */}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        className="cursor-pointer"
                        id="show-password-check" // Add an ID
                        checked={showPassword}
                        onCheckedChange={(checked) => {
                          setShowPassword(
                            checked === "indeterminate" ? true : checked,
                          );
                        }}
                      />
                      <FieldLabel
                        htmlFor="show-password-check" // Link to checkbox ID
                        className="text-muted-foreground text-sm cursor-pointer"
                      >
                        Show password
                      </FieldLabel>
                    </div>
                  </Field>
                </FieldGroup>
              </div>
              <Input
                id="sheet-password"
                // 2. Change type dynamically based on state
                type={showPassword ? "text" : "password"}
                defaultValue={Password}
              />
            </div>
          </div>
          <SheetFooter>
            <Button type="submit" className="text-white cursor-pointer">
              Save changes
            </Button>
            <SheetClose asChild>
              <Button className="text-white cursor-pointer">Close</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
