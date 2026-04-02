import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StyledSelectProps<T extends string> {
  value: T;
  options: readonly T[];
  onChange: (val: T) => void;
  inputClass: string;
  textColor: string;
  bgClass: string;
  /** Render a custom label for each option (used for colored dots, icons, etc.) */
  renderOption?: (opt: T) => React.ReactNode;
  className?: string;
}

export function StyledSelect<T extends string>({
  value,
  options,
  onChange,
  inputClass,
  textColor,
  bgClass,
  renderOption,
  className = "w-full",
}: StyledSelectProps<T>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`flex items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm shadow-xs outline-none transition-colors cursor-pointer ${inputClass} ${className}`}
        >
          <span className={`${textColor} flex items-center gap-2 text-xs`}>
            {renderOption ? renderOption(value) : value}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 opacity-50 ${textColor}`} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={`min-w-(--radix-dropdown-menu-trigger-width) ${bgClass} border-none shadow-xl`}
        align="start"
        sideOffset={4}
      >
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onChange(opt)}
            className={`flex items-center justify-between gap-2 cursor-pointer text-xs ${textColor} hover:opacity-80`}
          >
            <span className="flex items-center gap-2">
              {renderOption ? renderOption(opt) : opt}
            </span>
            {opt === value && <Check className="w-3.5 h-3.5 opacity-60 shrink-0" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
