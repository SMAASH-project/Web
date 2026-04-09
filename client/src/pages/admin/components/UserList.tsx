import { useTranslation } from "react-i18next";
import React from "react";
import { Search, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import UserListItem from "./UserListItem";
import type { AdminPageLogic } from "@/pages/admin/useAdminPageLogic";
import { LoadPost } from "@/animations/LoadPost";
import { Skeleton } from "@/components/ui/skeleton";

export default function UserList({ logic }: { logic: AdminPageLogic }) {
  const { t } = useTranslation("admin");
  const {
    useLiquidGlass,
    useDarkMode,
    usersLoading,
    filteredUsers,
    paginatedUsers,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    inputClass,
    panelBg,
    subtextColor,
    countBadge,
    handleUserSelect,
    selectedUserId,
  } = logic;

  return (
    <div className={`flex w-full flex-col gap-3 rounded-xl p-3 xl:w-72 xl:shrink-0 ${panelBg}`}>
      <div className="flex items-center gap-2 px-1">
        <Shield size={14} className={subtextColor} />
        <span className={`text-xs font-semibold tracking-wider uppercase ${subtextColor}`}>
          {t("users.title")}
        </span>
        {!usersLoading && <span className={countBadge}>{filteredUsers.length}</span>}
      </div>

      <div className="relative">
        <Search
          size={14}
          className={`pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 ${subtextColor}`}
        />
        <input
          type="text"
          placeholder={t("users.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full rounded-xl py-2 pr-3 pl-8 text-sm ${inputClass}`}
        />
      </div>

      <div className="flex max-h-100 flex-1 flex-col gap-1 overflow-y-auto xl:max-h-none xl:min-h-0">
        {usersLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            </div>
          ))
        ) : filteredUsers.length === 0 ? (
          <p className={`py-6 text-center text-xs ${subtextColor}`}>{t("users.noResults")}</p>
        ) : (
          paginatedUsers.map((user, index) => (
            <LoadPost key={user.id} index={index}>
              <UserListItem
                user={user}
                isSelected={user.id === selectedUserId}
                onClick={() => handleUserSelect(user.id)}
                useLiquidGlass={useLiquidGlass}
                useDarkMode={useDarkMode}
              />
            </LoadPost>
          ))
        )}
      </div>

      {/* Pagination controls */}
      {!usersLoading && totalPages > 1 && (
        <div
          className={`flex items-center justify-between border-t pt-2 ${
            useLiquidGlass
              ? useDarkMode
                ? "border-white/10"
                : "border-black/10"
              : useDarkMode
                ? "border-gray-700"
                : "border-gray-200"
          }`}
        >
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className={`rounded-lg p-1 transition-opacity disabled:opacity-30 ${subtextColor}`}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} />
          </button>
          <span className={`text-xs ${subtextColor}`}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className={`rounded-lg p-1 transition-opacity disabled:opacity-30 ${subtextColor}`}
            aria-label="Next page"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
