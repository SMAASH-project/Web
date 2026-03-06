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
import { getLiquidGlassClasses, getLiquidGlassTextShadow } from "@/lib/utils";

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
            className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
          >
            Edit
          </Button>
        </SheetTrigger>
        <SheetContent
          className={getLiquidGlassClasses(
            settings.useLiquidGlass,
            settings.useDarkMode,
          )}
        >
          <SheetHeader>
            <SheetTitle
              className={`text-white text-lg ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Edit profile
            </SheetTitle>
            <SheetDescription
              className={`text-white text-sm ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Make changes to your profile here. <br />
              Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label
                htmlFor="sheet-username"
                className={`text-white text-md ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
              >
                Username
              </Label>
              <Input
                id="sheet-name"
                className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} placeholder:text-white/50`}
                defaultValue={Username}
              />
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="sheet-email"
                className={`text-white text-md ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
              >
                Email Address
              </Label>
              <Input
                id="sheet-email"
                type="email"
                className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} placeholder:text-white/50`}
                defaultValue={Email}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="sheet-username"
                  className={`cursor-pointer text-white text-md ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
                >
                  Password
                </Label>
                <FieldGroup>
                  <Field>
                    {/* Container to align checkbox and label horizontally */}
                    <div className="flex items-center gap-2">
                      <span className="flex flex-row items-center gap-1">
                        <Checkbox
                          className={`cursor-pointer rounded-sm lg-inner ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")}`}
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
                          className={`text-white/50 text-xs cursor-pointer ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
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
                className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode, "input")} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)} placeholder:text-white/50`}
                type={showPassword ? "text" : "password"}
                defaultValue={Password}
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
            >
              Save changes
            </Button>
            <SheetClose asChild>
              <Button
                className={`text-white cursor-pointer ${getLiquidGlassClasses(settings.useLiquidGlass, settings.useDarkMode)} ${getLiquidGlassTextShadow(settings.useLiquidGlass, settings.useDarkMode)}`}
              >
                Close
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
