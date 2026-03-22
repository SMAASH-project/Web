import * as React from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormAlertVariant = "error" | "success" | "info";

interface FormAlertProps {
  variant?: FormAlertVariant;
  title?: string;
  message: string;
  className?: string;
}

const variantStyles: Record<FormAlertVariant, string> = {
  error:
    "border-red-500/50 bg-red-50 text-red-900 dark:border-red-500/30 dark:bg-red-950/30 dark:text-red-200",
  success:
    "border-green-500/50 bg-green-50 text-green-900 dark:border-green-500/30 dark:bg-green-950/30 dark:text-green-200",
  info: "border-blue-500/50 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-950/30 dark:text-blue-200",
};

const iconStyles: Record<FormAlertVariant, string> = {
  error: "text-red-600 dark:text-red-400",
  success: "text-green-600 dark:text-green-400",
  info: "text-blue-600 dark:text-blue-400",
};

const icons: Record<FormAlertVariant, React.ElementType> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
};

/**
 * Inline alert for form-level error / success / info messages.
 * Styled to match shadcn's Alert component.
 */
export function FormAlert({
  variant = "error",
  title,
  message,
  className,
}: FormAlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={cn(
        "relative flex gap-3 rounded-lg border px-4 py-3 text-sm",
        variantStyles[variant],
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", iconStyles[variant])} />
      <div className="flex flex-col gap-0.5">
        {title && <p className="font-medium leading-none">{title}</p>}
        <p className={cn(title ? "text-xs opacity-80" : "")}>{message}</p>
      </div>
    </div>
  );
}
