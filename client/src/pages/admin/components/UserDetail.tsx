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
import type { AdminPageLogic } from "@/pages/admin/useAdminPageLogic";
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
        badgeClass: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
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
      <div className="flex min-h-75 flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center opacity-50">
          <div className={`text-lg ${subtextColor}`}>{t("users.noSelected")}</div>
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
          className={`flex flex-wrap items-center gap-3 rounded-xl p-3 sm:p-4 ${panelBg}`}
        >
          {/* Avatar + info — w-full on mobile forces buttons to their own row below;
              sm:flex-1 lets them share a row with buttons on larger screens */}
          <div className="flex w-full min-w-0 items-center justify-center gap-3 sm:flex-1 sm:justify-start">
            <Avatar size="lg">
              <AvatarImage
                src={selectedProfile ? `/api/profiles/${selectedProfile.id}/pfp` : undefined}
                alt={selectedUser.username || selectedUser.email}
              />
              <AvatarFallback className={`text-lg font-bold ${avatarFallbackClass}`}>
                {(selectedUser.username || selectedUser.email).slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 sm:flex-1">
              <h2 className={`truncate text-base font-bold sm:text-lg ${textColor} ${textShadow}`}>
                {selectedUser.username || "—"}
              </h2>
              <p
                className={`flex items-center gap-1.5 truncate text-xs sm:text-sm ${subtextColor}`}
              >
                <Mail size={11} />
                {selectedUser.email}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleConfig.badgeClass}`}
                >
                  {roleConfig.icon}
                  {roleConfig.label}
                </span>
                {selectedUser.is_banned && (
                  <span className="flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
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
          </div>

          {/* Buttons — on mobile: w-full group above forces these to their own row,
              mx-auto centres them, flex-row lays them out horizontally.
              On sm+: flex-col stacks them vertically on the right of the avatar group. */}
          <div className="mx-auto flex shrink-0 flex-row flex-wrap justify-center gap-2 sm:flex-col">
            {selectedUser.is_banned ? (
              <Button
                size="sm"
                onClick={handleUnban}
                disabled={unbanMutation.isPending}
                className="flex w-full items-center justify-center gap-1.5 border-green-700 bg-green-600 text-xs text-white hover:bg-green-700"
              >
                <ShieldCheck size={13} />
                {unbanMutation.isPending ? t("detail.unbanning") : t("detail.unban")}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => setBanDialogOpen(true)}
                className="flex w-full items-center justify-center gap-1.5 border-red-700 bg-red-600 text-xs text-white hover:bg-red-700"
              >
                <Ban size={13} />
                {t("detail.banUser")}
              </Button>
            )}
            {selectedUser.role === "user" && (
              <Button
                size="sm"
                onClick={() => handlePromote("support")}
                disabled={promoteMutation.isPending}
                className="flex w-full items-center justify-center gap-1.5 border-sky-700 bg-sky-600 text-xs text-white hover:bg-sky-700"
              >
                <ArrowBigUp size={13} />
                {promoteMutation.isPending ? "..." : t("roles.support")}
              </Button>
            )}
            {(selectedUser.role === "user" || selectedUser.role === "support") && (
              <Button
                size="sm"
                onClick={() => handlePromote("admin")}
                disabled={promoteMutation.isPending}
                className="flex w-full items-center justify-center gap-1.5 border-purple-700 bg-purple-600 text-xs text-white hover:bg-purple-700"
              >
                <ArrowBigUpDash size={13} />
                {promoteMutation.isPending ? "..." : t("roles.admin")}
              </Button>
            )}
            {selectedUser.role === "admin" && (
              <Button
                size="sm"
                onClick={() => handlePromote("support")}
                disabled={promoteMutation.isPending}
                className="flex w-full items-center justify-center gap-1.5 border-sky-700 bg-sky-600 text-xs text-white hover:bg-sky-700"
              >
                <ArrowBigDown size={13} />
                {promoteMutation.isPending ? "..." : t("roles.support")}
              </Button>
            )}
            {(selectedUser.role === "admin" || selectedUser.role === "support") && (
              <Button
                size="sm"
                onClick={handleDemote}
                disabled={demoteMutation.isPending}
                className="flex w-full items-center justify-center gap-1.5 border-amber-700 bg-amber-600 text-xs text-white hover:bg-amber-700"
              >
                <ArrowBigDownDash size={13} />
                {demoteMutation.isPending ? "..." : t("roles.user")}
              </Button>
            )}
          </div>
        </motion.div>

        {/* ── Account details card ──────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.08, ease: "easeOut" }}
          className={`flex flex-col gap-3 rounded-xl p-4 ${panelBg}`}
        >
          <p className={`text-xs font-semibold tracking-wider uppercase ${subtextColor}`}>
            {t("detail.accountDetails")}
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className={logic.statCard}>
              <p className={`text-xs ${subtextColor}`}>{t("detail.userId")}</p>
              <p className={`font-mono text-sm font-semibold ${textColor}`}>#{selectedUser.id}</p>
            </div>
            <div className={logic.statCard}>
              <p className={`text-xs ${subtextColor}`}>{t("detail.lastLogin")}</p>
              <p className={`flex items-center gap-1 text-sm font-semibold ${textColor}`}>
                <Clock size={12} />
                {selectedUser.last_login || t("detail.never")}
              </p>
            </div>
            <div className={logic.statCard}>
              <p className={`text-xs ${subtextColor}`}>{t("detail.role")}</p>
              <span
                className={`mt-0.5 flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${roleConfig.badgeClass}`}
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
