import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";

export function FilterSelection() {
  return (
    <FieldSet>
      <FieldDescription>
        Select which types of news posts you want to see.
      </FieldDescription>
      <FieldGroup className="gap-3">
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-hard-disks-ljj-checkbox"
            name="finder-pref-9k2-hard-disks-ljj-checkbox"
            defaultChecked
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-hard-disks-ljj-checkbox"
            className="font-normal"
          >
            Major updates
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-external-disks-1yg-checkbox"
            name="finder-pref-9k2-external-disks-1yg-checkbox"
            defaultChecked
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-external-disks-1yg-checkbox"
            className="font-normal flex flex-wrap items-center gap-1"
          >
            Minor updates
            <span className="text-xs text-muted-foreground">
              (QOL improvements, bug fixes, etc.)
            </span>
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-cds-dvds-fzt-checkbox"
            name="finder-pref-9k2-cds-dvds-fzt-checkbox"
            defaultChecked
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-cds-dvds-fzt-checkbox"
            className="font-normal flex flex-wrap items-center gap-1"
          >
            Patches
            <span className="text-xs text-muted-foreground">
              (Security updates, hotfixes, etc.)
            </span>
          </FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="finder-pref-9k2-connected-servers-6l2-checkbox"
            name="finder-pref-9k2-connected-servers-6l2-checkbox"
            defaultChecked
          />
          <FieldLabel
            htmlFor="finder-pref-9k2-connected-servers-6l2-checkbox"
            className="font-normal flex flex-wrap items-center gap-1"
          >
            Unrelated news
            <span className="text-xs text-muted-foreground">
              (Events, community highlights, etc.)
            </span>
          </FieldLabel>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}
