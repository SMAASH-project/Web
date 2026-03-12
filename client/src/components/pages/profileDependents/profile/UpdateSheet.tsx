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
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import {
  getBackgroundClasses,
  getButtonClasses,
  getInputClasses,
  getTextColor,
  getTextShadow,
  getSubtextColor,
} from "@/lib/utils";

const Username = "placeholder";
const Email = "lorem@ipsum.com";
const Password = "password";

export function UpdateSheet() {
  const { settings } = useSettings();
  const [showPassword, setShowPassword] = React.useState(false);

  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const buttonClass = getButtonClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const inputClass = getInputClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );

  return (
    <div className="z-101">
      <Sheet>
        <SheetTrigger asChild>
          <Button className={`cursor-pointer ${buttonClass} ${textShadow}`}>
            Edit
          </Button>
        </SheetTrigger>
        <SheetContent className={bgClass}>
          <SheetHeader>
            <SheetTitle className={`text-lg ${textColor} ${textShadow}`}>
              Edit profile
            </SheetTitle>
            <SheetDescription className={`text-sm ${subtextColor}`}>
              Make changes to your profile here. <br />
              Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label
                htmlFor="sheet-username"
                className={`text-md ${textColor} ${textShadow}`}
              >
                Username
              </Label>
              <Input
                id="sheet-name"
                className={`cursor-pointer ${inputClass}`}
                defaultValue={Username}
              />
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="sheet-email"
                className={`text-md ${textColor} ${textShadow}`}
              >
                Email Address
              </Label>
              <Input
                id="sheet-email"
                type="email"
                className={`cursor-pointer ${inputClass}`}
                defaultValue={Email}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="sheet-username"
                  className={`cursor-pointer text-md ${textColor} ${textShadow}`}
                >
                  Password
                </Label>
                <FieldGroup>
                  <Field>
                    {/* Container to align checkbox and label horizontally */}
                    <div className="flex items-center gap-2">
                      <span className="flex flex-row items-center gap-1">
                        <Checkbox
                          className={`cursor-pointer rounded-sm lg-inner ${inputClass}`}
                          id="show-password-check"
                          checked={showPassword}
                          onCheckedChange={(checked) => {
                            setShowPassword(
                              checked === "indeterminate" ? true : checked,
                            );
                          }}
                        />
                        <FieldLabel
                          htmlFor="show-password-check"
                          className={`text-xs cursor-pointer ${subtextColor}`}
                        >
                          Show password
                        </FieldLabel>
                      </span>
                    </div>
                  </Field>
                </FieldGroup>
              </div>
              <Input
                id="sheet-password"
                className={`cursor-pointer ${inputClass}`}
                type={showPassword ? "text" : "password"}
                defaultValue={Password}
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              className={`cursor-pointer ${buttonClass} ${textShadow}`}
            >
              Save changes
            </Button>
            <SheetClose asChild>
              <Button className={`cursor-pointer ${buttonClass} ${textShadow}`}>
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
