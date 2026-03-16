import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronRight, Ban } from "lucide-react";
import { getTextColor, getSubtextColor } from "@/lib/utils";
import type { AdminUserDTO } from "@/hooks/useAdminHooks";

export default function UserListItem({
  user,
  isSelected,
  onClick,
  useLiquidGlass,
  useDarkMode,
}: {
  user: AdminUserDTO;
  isSelected: boolean;
  onClick: () => void;
  useLiquidGlass: boolean;
  useDarkMode: boolean;
}) {
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);

  const activeClass = isSelected
    ? useLiquidGlass
      ? useDarkMode
        ? "bg-white/20 border-white/30"
        : "bg-black/15 border-black/20"
      : useDarkMode
        ? "bg-gray-700 border-gray-500"
        : "bg-gray-100 border-gray-300"
    : useLiquidGlass
      ? useDarkMode
        ? "bg-transparent border-transparent hover:bg-white/10 hover:border-white/15"
        : "bg-transparent border-transparent hover:bg-white/10 hover:border-white/15"
      : useDarkMode
        ? "bg-transparent border-transparent hover:bg-gray-800"
        : "bg-transparent border-transparent hover:bg-gray-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left ${activeClass}`}
    >
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback
          className={`text-xs ${useLiquidGlass ? (useDarkMode ? "bg-white/20 text-white" : "bg-black/20 text-white") : useDarkMode ? "bg-gray-700 text-gray-300" : "bg-gray-200 text-gray-600"}`}
        >
          {(user.username || user.email).slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${textColor}`}>
          {user.username || "—"}
        </p>
        <p className={`text-xs truncate ${subtextColor}`}>{user.email}</p>
      </div>
      {user.is_banned && (
        <Ban size={12} className="text-red-400 shrink-0" aria-label="Banned" />
      )}
      {isSelected && (
        <ChevronRight size={14} className={`shrink-0 ${subtextColor}`} />
      )}
    </button>
  );
}
