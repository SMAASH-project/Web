import { useTranslation } from "react-i18next";
import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Clock,
  ShieldCheck,
  ArrowBigUpDash,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigDownDash,
  Ban,
  Shield,
  Users,
  Headphones,
} from "lucide-react";
import type { AdminPageLogic } from "@/components/pages/profileDependents/admin/adminLogic/useAdminPageLogic";
import { getButtonClasses } from "@/lib/utils";
import { DateTime } from "luxon";

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatBannedUntil(str: string): string {
  if (!str) return "";
  const parts = str.trim().split(/\s+/);
  if (parts.length >= 3) {
    const yy = parseInt(parts[2], 10);
    if (!isNaN(yy) && yy >= 0 && yy <= 99) {
      parts[2] = String(2000 + yy);
    }
  }
  const dt = DateTime.fromFormat(parts.join(" "), "dd MMM yyyy HH:mm ZZZ");
  if (!dt.isValid) return str;
  return dt.toLocaleString(DateTime.DATE_MED);
}

// ─── Role config ──────────────────────────────────────────────────────────────

interface RoleConfig {
  label: string;
  icon: React.ReactNode;
  badgeClass: string;
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
    promoteMutation,
    demoteMutation,
    handleUnban,
    handlePromote,
    handleDemote,
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
    <AnimatePresence mode="wait">
      <motion.div
        key={selectedUser.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col gap-4"
      >
        {/* ── User header card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0, ease: "easeOut" }}
          className={`rounded-xl p-4 flex items-center gap-4 ${panelBg}`}
        >
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
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1 ${roleConfig.badgeClass}`}
              >
                {roleConfig.icon}
                {roleConfig.label}
              </span>
              {selectedUser.is_banned && (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                  <Ban size={10} />
                  {selectedUser.banned_until
                    ? t("detail.bannedUntil", {
                        date: formatBannedUntil(selectedUser.banned_until),
                      })
                    : t("detail.bannedPermanent")}
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
                className="text-xs flex items-center justify-center gap-1.5 w-full bg-green-600 hover:bg-green-700 text-white border-green-700"
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
                className="text-xs flex items-center justify-center gap-1.5 w-full bg-red-600 hover:bg-red-700 text-white border-red-700"
              >
                <Ban size={13} />
                Ban User
              </Button>
            )}
            {selectedUser.role === "user" && (
              <Button
                size="sm"
                onClick={() => handlePromote("support")}
                disabled={promoteMutation.isPending}
                className="text-xs flex items-center justify-center gap-1.5 w-full bg-sky-600 hover:bg-sky-700 text-white border-sky-700"
              >
                <ArrowBigUp size={13} />
                {promoteMutation.isPending ? "..." : "Support"}
              </Button>
            )}
            {(selectedUser.role === "user" ||
              selectedUser.role === "support") && (
              <Button
                size="sm"
                onClick={() => handlePromote("admin")}
                disabled={promoteMutation.isPending}
                className="text-xs flex items-center justify-center gap-1.5 w-full bg-purple-600 hover:bg-purple-700 text-white border-purple-700"
              >
                <ArrowBigUpDash size={13} />
                {promoteMutation.isPending ? "..." : "Admin"}
              </Button>
            )}
            {selectedUser.role === "admin" && (
              <Button
                size="sm"
                onClick={() => handlePromote("support")}
                disabled={promoteMutation.isPending}
                className="text-xs flex items-center justify-center gap-1.5 w-full bg-sky-600 hover:bg-sky-700 text-white border-sky-700"
              >
                <ArrowBigDown size={13} />
                {promoteMutation.isPending ? "..." : "Support"}
              </Button>
            )}
            {(selectedUser.role === "admin" ||
              selectedUser.role === "support") && (
              <Button
                size="sm"
                onClick={handleDemote}
                disabled={demoteMutation.isPending}
                className="text-xs flex items-center justify-center gap-1.5 w-full bg-amber-600 hover:bg-amber-700 text-white border-amber-700"
              >
                <ArrowBigDownDash size={13} />
                {demoteMutation.isPending ? "..." : "User"}
              </Button>
            )}
          </div>
        </motion.div>

        {/* ── Account details card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
          className={`rounded-xl p-4 flex flex-col gap-3 ${panelBg}`}
        >
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
              <p className={`text-xs ${subtextColor}`}>
                {t("detail.lastLogin")}
              </p>
              <p
                className={`text-sm font-semibold flex items-center gap-1 ${textColor}`}
              >
                <Clock size={12} />
                {selectedUser.last_login || t("detail.never")}
              </p>
            </div>
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
                {selectedUser.is_banned
                  ? t("detail.banned")
                  : t("detail.active")}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
