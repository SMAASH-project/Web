import React from "react";
import { Search, Shield } from "lucide-react";
import { Card } from "@/components/ui/card";
import UserListItem from "./UserListItem";
import type { AdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";

export default function UserList({ logic }: { logic: AdminPageLogic }) {
  const {
    useLiquidGlass,
    useDarkMode,
    usersLoading,
    filteredUsers,
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
    <div
      className={`flex flex-col gap-3 rounded-xl p-3 w-full xl:w-72 xl:shrink-0 ${panelBg}`}
    >
      <div className="flex items-center gap-2 px-1">
        <Shield size={14} className={subtextColor} />
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
        >
          Users
        </span>
        {!usersLoading && (
          <span className={countBadge}>{filteredUsers.length}</span>
        )}
      </div>

      <div className="relative">
        <Search
          size={14}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${subtextColor}`}
        />
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-8 pr-3 py-2 text-sm rounded-xl ${inputClass}`}
        />
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-1 max-h-100 xl:max-h-none xl:min-h-0">
        {usersLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current opacity-40" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className={`text-xs text-center py-6 ${subtextColor}`}>
            No users found
          </p>
        ) : (
          filteredUsers.map((user) => (
            <UserListItem
              key={user.id}
              user={user}
              isSelected={user.id === selectedUserId}
              onClick={() => handleUserSelect(user.id)}
              useLiquidGlass={useLiquidGlass}
              useDarkMode={useDarkMode}
            />
          ))
        )}
      </div>
    </div>
  );
}
