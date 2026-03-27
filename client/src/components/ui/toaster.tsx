import { useEffect, useState } from "react";
import { toast, type ToastItem } from "@/lib/toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const ICON: Record<ToastItem["type"], React.ReactNode> = {
  success: <CheckCircle2 size={15} className="shrink-0 text-green-400" />,
  error: <AlertCircle size={15} className="shrink-0 text-red-400" />,
  info: <Info size={15} className="shrink-0 text-blue-400" />,
};

const STYLE: Record<ToastItem["type"], string> = {
  success:
    "bg-green-500/15 border-green-500/30 text-green-200",
  error:
    "bg-red-500/15 border-red-500/30 text-red-200",
  info:
    "bg-blue-500/15 border-blue-500/30 text-blue-200",
};

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => toast.subscribe(setItems), []);

  if (items.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-atomic="false"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-2.5 pl-3.5 pr-3 py-2.5 rounded-xl border",
            "backdrop-blur-md shadow-lg text-sm font-medium",
            "pointer-events-auto",
            "animate-in slide-in-from-right-4 fade-in duration-200",
            STYLE[item.type],
          )}
        >
          {ICON[item.type]}
          <span className="flex-1 leading-snug">{item.message}</span>
          <button
            onClick={() => setItems((prev) => prev.filter((t) => t.id !== item.id))}
            className="ml-1 opacity-60 hover:opacity-100 transition-opacity"
            aria-label="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
}
