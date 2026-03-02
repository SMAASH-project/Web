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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup } from "@/components/ui/radio-group";
import { FilePlusCorner } from "lucide-react";
import { useSettings } from "../../profileDependents/settings/settingsLogic/SettingsContext";
import { DateTime } from "luxon";
import type { Release } from "@/types/PageTypes";
import { OsTypes } from "@/types/OsTypes";
import { useState, useMemo } from "react";

type ReleaseType = "Major" | "Minor" | "Patch";

function computeNextVersion(
  allReleases: Release[],
  releaseType: ReleaseType,
): string {
  // Find the highest existing version
  let maxMajor = 0;
  let maxMinor = 0;
  let maxPatch = 0;

  for (const release of allReleases) {
    const parts = release.version.split(".").map(Number);
    const [maj = 0, min = 0, pat = 0] = parts;

    if (
      maj > maxMajor ||
      (maj === maxMajor && min > maxMinor) ||
      (maj === maxMajor && min === maxMinor && pat > maxPatch)
    ) {
      maxMajor = maj;
      maxMinor = min;
      maxPatch = pat;
    }
  }

  switch (releaseType) {
    case "Major":
      return `${maxMajor + 1}.0.0`;
    case "Minor":
      return `${maxMajor}.${maxMinor + 1}.0`;
    case "Patch":
      return `${maxMajor}.${maxMinor}.${maxPatch + 1}`;
  }
}

export function AddRelease({
  onCreate,
  allReleases,
}: {
  onCreate?: (release: Release) => void;
  allReleases: Release[];
}) {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [supports, setSupports] = useState<string[]>([]);
  const [releaseType, setReleaseType] = useState<ReleaseType>("Patch");
  const [autoName, setAutoName] = useState(false);
  const [fileName, setFileName] = useState("");
  const glass = settings.useLiquidGlass;

  const autoVersion = useMemo(
    () => computeNextVersion(allReleases, releaseType),
    [allReleases, releaseType],
  );

  const effectiveVersion = autoName ? autoVersion : version;

  function toggleOs(osName: string) {
    setSupports((prev) =>
      prev.includes(osName)
        ? prev.filter((o) => o !== osName)
        : [...prev, osName],
    );
  }

  function resetForm() {
    setVersion("");
    setSupports([]);
    setReleaseType("Patch");
    setAutoName(false);
    setFileName("");
  }

  function handleSave() {
    if (!effectiveVersion.trim() || supports.length === 0) return;

    const newRelease: Release = {
      id: Date.now().toString(),
      version: effectiveVersion.trim(),
      supports,
      createdAt: DateTime.now() as ReturnType<typeof DateTime.now>,
    };

    onCreate?.(newRelease);
    resetForm();
    setOpen(false);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      setFileName(file.name);
    } else {
      setFileName("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className={`cursor-pointer gap-2 ${
            glass
              ? "bg-white/20 backdrop-blur-lg border border-white/25 text-white hover:bg-white/30"
              : "bg-green-600 hover:bg-green-700 text-white"
          }`}
        >
          <FilePlusCorner className="w-4 h-4" />
          <span className="text-sm font-medium">New Release</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Upload New Release</DialogTitle>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label>Release Type</Label>
            <RadioGroup
              value={releaseType}
              onValueChange={(v) => setReleaseType(v as ReleaseType)}
            >
              <div className="grid grid-cols-3 gap-3 mt-1">
                {(["Major", "Minor", "Patch"] as const).map((type) => {
                  const colors: Record<ReleaseType, string> = {
                    Major: "#3b82f6",
                    Minor: "#10b981",
                    Patch: "#f59e0b",
                  };
                  return (
                    <label
                      key={type}
                      className="flex items-center gap-2 p-3 rounded border cursor-pointer hover:bg-muted/50 transition-colors"
                      style={{
                        borderLeftColor: colors[type],
                        borderLeftWidth: "3px",
                      }}
                    >
                      <input
                        type="radio"
                        value={type}
                        checked={releaseType === type}
                        onChange={(e) =>
                          setReleaseType(e.target.value as ReleaseType)
                        }
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{type}</span>
                    </label>
                  );
                })}
              </div>
            </RadioGroup>
          </Field>
          <Field>
            <div className="flex items-center justify-between">
              <Label>Version</Label>
              <label className="flex items-center gap-2 cursor-pointer">
                <Checkbox
                  checked={autoName}
                  onCheckedChange={(checked) => setAutoName(checked === true)}
                />
                <span className="text-sm text-muted-foreground">Auto-name</span>
              </label>
            </div>
            <Input
              placeholder="e.g. 3.0.0"
              value={effectiveVersion}
              onChange={(e) => setVersion((e.target as HTMLInputElement).value)}
              disabled={autoName}
              className={autoName ? "opacity-60" : ""}
            />
            {autoName && (
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated based on {releaseType.toLowerCase()} bump:{" "}
                <span className="font-mono font-semibold">{autoVersion}</span>
              </p>
            )}
          </Field>
          <Field>
            <Label>Release File</Label>
            <Input type="file" onChange={handleFileChange} />
            {fileName && (
              <p className="text-xs text-muted-foreground mt-1">
                Selected: {fileName}
              </p>
            )}
          </Field>
          <Field>
            <Label>Supported Platforms</Label>
            <div className="flex flex-col gap-2 mt-1">
              {OsTypes.map((os) => (
                <label
                  key={os.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={supports.includes(os.name)}
                    onCheckedChange={() => toggleOs(os.name)}
                  />
                  <span>{os.name}</span>
                </label>
              ))}
            </div>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={handleSave}
            disabled={!effectiveVersion.trim() || supports.length === 0}
          >
            Upload
          </Button>
          <DialogClose asChild>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={resetForm}
            >
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
