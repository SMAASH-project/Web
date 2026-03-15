import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, Clock, ShieldCheck, Ban } from "lucide-react";
import type { AdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";
import { getButtonClasses } from "@/lib/utils";

export default function UserDetail({ logic }: { logic: AdminPageLogic }) {
  const {
    selectedUser,
    selectedProfile,
    panelBg,
    textColor,
    textShadow,
    subtextColor,
    unbanMutation,
    banMutation,
    handleUnban,
    setBanDialogOpen,
  } = logic;

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-75">
        <div className="text-center flex flex-col items-center gap-3 opacity-50">
          <div className={`text-lg ${subtextColor}`}>No user selected</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`rounded-xl p-4 flex items-center gap-4 ${panelBg}`}>
        <Avatar size="lg">
          <AvatarImage
            src={
              selectedProfile
                ? `/api/profiles/${selectedProfile.id}/pfp`
                : undefined
            }
            alt={selectedUser.username || selectedUser.email}
          />
          <AvatarFallback
            className={`text-lg font-bold ${useLiquidFallbackClass(logic)}`}
          >
            {(selectedUser.username || selectedUser.email)
              .slice(0, 2)
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2
            className={`text-lg font-bold truncate ${textColor} ${textShadow}`}
          >
            {selectedUser.username || "—"}
          </h2>
          <p
            className={`text-sm truncate flex items-center gap-1.5 ${subtextColor}`}
          >
            <Mail size={12} />
            {selectedUser.email}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                selectedUser.role === "admin"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                  : getButtonClasses(
                      logic.useLiquidGlass,
                      logic.useDarkMode,
                      "secondary",
                    )
              }`}
            >
              {selectedUser.role}
            </span>
            {selectedUser.is_banned && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <Ban size={10} />
                Banned
                {selectedUser.ban_until
                  ? ` until ${new Date(selectedUser.ban_until).toLocaleDateString()}`
                  : " (permanent)"}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 shrink-0">
          {selectedUser.is_banned ? (
            <Button
              size="sm"
              onClick={handleUnban}
              disabled={unbanMutation.isPending}
              className="text-xs flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white border-green-700"
            >
              <ShieldCheck size={13} />
              {unbanMutation.isPending ? "Unbanning…" : "Unban"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => setBanDialogOpen(true)}
              className="text-xs flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white border-red-700"
            >
              <Ban size={13} />
              Ban User
            </Button>
          )}
        </div>
      </div>

      <div className={`rounded-xl p-4 flex flex-col gap-3 ${panelBg}`}>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
        >
          Account Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>User ID</p>
            <p className={`text-sm font-semibold font-mono ${textColor}`}>
              #{selectedUser.id}
            </p>
          </div>
          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>Last Login</p>
            <p
              className={`text-sm font-semibold flex items-center gap-1 ${textColor}`}
            >
              <Clock size={12} />
              {selectedUser.last_login || "Never"}
            </p>
          </div>
          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>Role</p>
            <p className={`text-sm font-semibold capitalize ${textColor}`}>
              {selectedUser.role}
            </p>
          </div>
          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>Status</p>
            <p
              className={`text-sm font-semibold ${selectedUser.is_banned ? "text-red-400" : "text-green-400"}`}
            >
              {selectedUser.is_banned ? "Banned" : "Active"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

function useLiquidFallbackClass(logic: AdminPageLogic) {
  return getButtonClasses(logic.useLiquidGlass, logic.useDarkMode, "secondary");
}
