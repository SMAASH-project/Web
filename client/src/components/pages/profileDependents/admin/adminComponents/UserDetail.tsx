import { useTranslation } from "react-i18next";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Clock,
  ShieldCheck,
  Ban,
  Shield,
  Users,
  Headphones,
} from "lucide-react";
import type { AdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";
import { getButtonClasses } from "@/lib/utils";

// ─── Role config ──────────────────────────────────────────────────────────────
// Backend roles (Role.Name, varchar(7)): "admin" | "support" | "user"
// Colours are purely semantic and intentionally fixed regardless of theme mode.

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  /** Tailwind classes for the badge pill */
  badgeClass: string;
  /** Tailwind classes for the larger stat-card value */
  statClass: string;
}

function getRoleConfig(role: string, t: (k: string) => string): RoleConfig {
  switch (role) {
    case "admin":
      return {
        label: t("roles.admin"),
        icon: <Shield size={10} />,
        badgeClass:
          "bg-purple-500/20 text-purple-300 border border-purple-500/30",
        statClass: "text-purple-400",
      };
    case "support":
      return {
        label: t("roles.support"),
        icon: <Headphones size={10} />,
        badgeClass: "bg-sky-500/20 text-sky-300 border border-sky-500/30",
        statClass: "text-sky-400",
      };
    case "user":
    default:
      return {
        label: t("roles.user"),
        icon: <Users size={10} />,
        // Neutral — uses no semantic colour, falls through to a muted pill
        badgeClass: "bg-gray-500/15 text-gray-300 border border-gray-500/25",
        statClass: "text-gray-400",
      };
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function UserDetail({ logic }: { logic: AdminPageLogic }) {
  const { t } = useTranslation("admin");
  const {
    selectedUser,
    selectedProfile,
    panelBg,
    textColor,
    textShadow,
    subtextColor,
    unbanMutation,
    handleUnban,
    setBanDialogOpen,
  } = logic;

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-75">
        <div className="text-center flex flex-col items-center gap-3 opacity-50">
          <div className={`text-lg ${subtextColor}`}>
            {t("users.noSelected")}
          </div>
        </div>
      </div>
    );
  }

  const roleConfig = getRoleConfig(selectedUser.role, t);
  const avatarFallbackClass = getButtonClasses(
    logic.useLiquidGlass,
    logic.useDarkMode,
    "secondary",
  );

  return (
    <>
      {/* ── User header card ──────────────────────────────────────────── */}
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
            className={`text-lg font-bold ${avatarFallbackClass}`}
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

          {/* Role + ban badges */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            {/* Role badge — styled per backend role */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${roleConfig.badgeClass}`}
            >
              {roleConfig.icon}
              {roleConfig.label}
            </span>

            {/* Ban badge */}
            {selectedUser.is_banned && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <Ban size={10} />
                {selectedUser.ban_until
                  ? t("detail.bannedUntil", {
                      date: new Date(
                        selectedUser.ban_until,
                      ).toLocaleDateString(),
                    })
                  : t("detail.bannedPermanent")}
              </span>
            )}
          </div>
        </div>

        {/* Ban / unban action */}
        <div className="flex flex-col gap-2 shrink-0">
          {selectedUser.is_banned ? (
            <Button
              size="sm"
              onClick={handleUnban}
              disabled={unbanMutation.isPending}
              className="text-xs flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white border-green-700"
            >
              <ShieldCheck size={13} />
              {unbanMutation.isPending
                ? t("detail.unbanning")
                : t("detail.unban")}
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

      {/* ── Account details card ──────────────────────────────────────── */}
      <div className={`rounded-xl p-4 flex flex-col gap-3 ${panelBg}`}>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${subtextColor}`}
        >
          Account Details
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>{t("detail.userId")}</p>
            <p className={`text-sm font-semibold font-mono ${textColor}`}>
              #{selectedUser.id}
            </p>
          </div>

          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>{t("detail.lastLogin")}</p>
            <p
              className={`text-sm font-semibold flex items-center gap-1 ${textColor}`}
            >
              <Clock size={12} />
              {selectedUser.last_login || t("detail.never")}
            </p>
          </div>

          {/* Role stat — shows badge inline so it matches the header */}
          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>{t("detail.role")}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit mt-0.5 ${roleConfig.badgeClass}`}
            >
              {roleConfig.icon}
              {roleConfig.label}
            </span>
          </div>

          <div className={logic.statCard}>
            <p className={`text-xs ${subtextColor}`}>{t("detail.status")}</p>
            <p
              className={`text-sm font-semibold ${selectedUser.is_banned ? "text-red-400" : "text-green-400"}`}
            >
              {selectedUser.is_banned ? t("detail.banned") : t("detail.active")}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
