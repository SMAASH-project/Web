import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";
import { useSettings } from "../settings/settingsLogic/SettingsContext";
import { useMediaQuery } from "@/components/nav/navLogic/useMediaQuery";
import { m, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

const DisplayName = "Your Display Name";
const Email = "lorem@ipsum.com";
const Password = "password";

const themeClass = (settings: { useLiquidGlass: boolean }, type: string) => {
  const base = settings.useLiquidGlass
    ? "bg-white/20 border-white/30"
    : "bg-gray-700 border-green-500";
  const focus = settings.useLiquidGlass
    ? "focus:border-white/50"
    : "focus:border-green-400";
  const text = "text-white";
  const placeholder = settings.useLiquidGlass
    ? "placeholder:text-white/60"
    : "placeholder:text-gray-400";

  switch (type) {
    case "input":
      return `${base} ${focus} ${text} ${placeholder}`;
    case "border":
      return settings.useLiquidGlass ? "border-white/20" : "border-green-400";
    case "label":
      return settings.useLiquidGlass
        ? "[text-shadow:0_1px_2px_rgba(163,163,163,0.6)]"
        : "";
    case "button-primary":
      return settings.useLiquidGlass
        ? "bg-white/40 hover:bg-white/50 backdrop-blur-lg"
        : "bg-green-600 hover:bg-green-700";
    case "button-secondary":
      return settings.useLiquidGlass
        ? "bg-white/20 hover:bg-white/30 backdrop-blur-lg"
        : "bg-gray-700 hover:bg-gray-800";
    case "bg":
      return settings.useLiquidGlass
        ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
        : "bg-gray-600 border-2 border-green-400";
    default:
      return "";
  }
};

// Mobile Modal Component
const ModalContent = ({
  setIsOpen,
  settings,
  showPassword,
  setShowPassword,
}: {
  setIsOpen: (open: boolean) => void;
  settings: { useLiquidGlass: boolean };
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
}) => (
  <m.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.2 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <m.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
    />
    <m.div
      className={`relative w-full max-w-sm rounded-2xl shadow-2xl flex flex-col max-h-[90vh] ${themeClass(settings, "bg")}`}
    >
      <div
        className={`flex px-4 py-3 border-b ${themeClass(settings, "border")}`}
      >
        <span
          className={`text-lg font-semibold text-white flex-1 ${themeClass(settings, "label")}`}
        >
          Edit Profile
        </span>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/70 hover:text-white inline-flex items-start pt-0.5"
        >
          <X size={20} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <div className="space-y-1">
          <Label
            className={`text-white text-sm ${themeClass(settings, "label")}`}
          >
            Display Name
          </Label>
          <Input
            type="text"
            defaultValue={DisplayName}
            className={themeClass(settings, "input")}
          />
        </div>
        <div className="space-y-1">
          <Label
            className={`text-white text-sm ${themeClass(settings, "label")}`}
          >
            Email Address
          </Label>
          <Input
            type="email"
            defaultValue={Email}
            className={themeClass(settings, "input")}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label
              className={`text-white text-sm ${themeClass(settings, "label")}`}
            >
              Password
            </Label>
            <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
              <input
                type="checkbox"
                checked={showPassword}
                onChange={(e) => setShowPassword(e.target.checked)}
                className="w-4 h-4"
              />
              Show password
            </label>
          </div>
          <Input
            type={showPassword ? "text" : "password"}
            defaultValue={Password}
            className={themeClass(settings, "input")}
          />
        </div>
      </div>
      <div
        className={`flex flex-col gap-2 px-4 pb-4 border-t ${themeClass(settings, "border")} pt-4`}
      >
        <Button
          className={`w-full text-white cursor-pointer ${themeClass(settings, "button-primary")}`}
        >
          Save
        </Button>
        <Button
          onClick={() => setIsOpen(false)}
          className={`w-full text-white cursor-pointer ${themeClass(settings, "button-secondary")}`}
        >
          Close
        </Button>
      </div>
    </m.div>
  </m.div>
);

export function UpdateSheet() {
  const { settings } = useSettings();
  const isMobile = !useMediaQuery("(min-width: 768px)");
  const [showPassword, setShowPassword] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const btnClass = `text-white cursor-pointer ${themeClass(settings, "button-primary")} [text-shadow:0_2px_4px_rgba(163,163,163,0.8)]`;

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
        <SheetContent
          className={`${
            settings.useLiquidGlass
              ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20"
              : ""
          }`}
        >
          <SheetHeader>
            <SheetTitle
              className={`text-white text-lg ${
                settings.useLiquidGlass
                  ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                  : ""
              }`}
            >
              Edit profile
            </SheetTitle>
            <SheetDescription
              className={`text-white text-sm ${
                settings.useLiquidGlass
                  ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                  : ""
              }`}
            >
              Make changes to your profile here. <br />
              Click save when you&apos;re done.
            </SheetDescription>
          </SheetHeader>
          <div className="grid flex-1 auto-rows-min gap-6 px-4">
            <div className="grid gap-3">
              <Label
                htmlFor="sheet-username"
                className={`text-white text-md ${
                  settings.useLiquidGlass
                    ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                    : ""
                }`}
              >
                Username
              </Label>
              <Input
                id="sheet-name"
                className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 ring-1 ring-white/20 [text-shadow:0_2px_4px_rgba(163,163,163,0.8)] placeholder:text-white/50" : ""}`}
                defaultValue={Username}
              />
            </div>
            <div className="grid gap-3">
              <Label
                htmlFor="sheet-email"
                className={`text-white text-md ${
                  settings.useLiquidGlass
                    ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                    : ""
                }`}
              >
                Email Address
              </Label>
              <Input
                id="sheet-email"
                type="email"
                className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 ring-1 ring-white/20 [text-shadow:0_2px_4px_rgba(163,163,163,0.8)] placeholder:text-white/50" : ""}`}
                defaultValue={Email}
              />
            </div>
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <Label
                  htmlFor="sheet-username"
                  className={`cursor-pointer text-white text-md ${
                    settings.useLiquidGlass
                      ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                      : ""
                  }`}
                >
                  Password
                </Label>
                <FieldGroup>
                  <Field>
                    {/* Container to align checkbox and label horizontally */}
                    <div className="flex items-center gap-2">
                      <span className="flex flex-row items-center gap-1">
                        <Checkbox
                          className={`cursor-pointer rounded-sm lg-inner ${settings.useLiquidGlass ? "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 ring-1 ring-white/20" : ""}`}
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
                          className={`text-white/50 text-xs cursor-pointer ${
                            settings.useLiquidGlass
                              ? "[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]"
                              : ""
                          }`}
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
                className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/20 backdrop-blur-xl border border-white/30 shadow-lg shadow-white/10 ring-1 ring-white/20 [text-shadow:0_2px_4px_rgba(163,163,163,0.8)] placeholder:text-white/50" : ""}`}
                // 2. Change type dynamically based on state
                type={showPassword ? "text" : "password"}
                defaultValue={Password}
              />
            </div>
          </div>
          <SheetFooter>
            <Button
              type="submit"
              className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
            >
              Save changes
            </Button>
            <SheetClose asChild>
              <Button
                className={`text-white cursor-pointer ${settings.useLiquidGlass ? "bg-white/30 backdrop-blur-lg border-white/30 shadow-sm shadow-white/20[text-shadow:0_2px_4px_rgba(163,163,163,0.8)]" : ""}`}
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
