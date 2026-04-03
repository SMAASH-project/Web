import { useState, useMemo, useEffect } from "react";
import {
  useAdminUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  usePromoteUserMutation,
  useDemoteUserMutation,
  type AdminUserDTO,
} from "@/hooks/useAdmin";
import {
  useProfilesQuery,
  useUpdateProfileMutation,
} from "@/hooks/useQueryHooks";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getInputClasses,
} from "@/lib/utils";
import { toast } from "@/lib/toast";

export function useAdminPageLogic() {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedProfileIdx, setSelectedProfileIdx] = useState(0);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  const { data: users = [], isLoading: usersLoading } = useAdminUsersQuery();
  const banMutation = useBanUserMutation();
  const unbanMutation = useUnbanUserMutation();
  const promoteMutation = usePromoteUserMutation();
  const demoteMutation = useDemoteUserMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId],
  );

  const { data: profiles = [], isLoading: profilesLoading } =
    useProfilesQuery(selectedUserId);

  const selectedProfile = profiles[selectedProfileIdx] ?? null;

  const PAGE_SIZE = 15;

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  // Reset to page 1 whenever the search query changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const paginatedUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  const handleUserSelect = (id: number) => {
    setSelectedUserId(id);
    setSelectedProfileIdx(0);
  };

  const handleBanConfirm = async (
    banType: "permanent" | "temporary",
    banUntil?: string,
    reason?: string,
  ) => {
    if (!selectedUserId) return;
    try {
      await banMutation.mutateAsync({
        userId: selectedUserId,
        payload: { ban_type: banType, ban_until: banUntil, reason },
      });
      setBanDialogOpen(false);
      toast.success("User banned successfully.");
    } catch {
      toast.error("Failed to ban user. Please try again.");
    }
  };

  const handleUnban = async () => {
    if (!selectedUserId) return;
    try {
      await unbanMutation.mutateAsync({ userId: selectedUserId });
      toast.success("User unbanned.");
    } catch {
      toast.error("Failed to unban user.");
    }
  };

  const handlePromote = async (targetRole: "admin" | "support") => {
    if (!selectedUserId) return;
    try {
      await promoteMutation.mutateAsync({ userId: selectedUserId, targetRole });
      toast.success(`User promoted to ${targetRole}.`);
    } catch {
      toast.error("Failed to promote user.");
    }
  };

  const handleDemote = async () => {
    if (!selectedUserId) return;
    try {
      await demoteMutation.mutateAsync({ userId: selectedUserId });
      toast.success("User demoted to user.");
    } catch {
      toast.error("Failed to demote user.");
    }
  };

  const handleUpdateCoins = async (
    profileId: number,
    displayName: string,
    coins: number,
  ) => {
    try {
      await updateProfileMutation.mutateAsync({
        profileId,
        payload: { id: profileId, display_name: displayName, coins },
        optimistic: false,
        invalidateAfterSuccess: true,
      });
      toast.success("Coins updated.");
    } catch {
      toast.error("Failed to update coins.");
    }
  };

  const cardBg = getBackgroundClasses(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const sepClass = useLiquidGlass
    ? useDarkMode
      ? "bg-white/10"
      : "bg-black/10"
    : useDarkMode
      ? "bg-gray-700"
      : "bg-gray-200";

  const statCard = `rounded-xl p-3 flex flex-col gap-1 ${
    useLiquidGlass
      ? useDarkMode
        ? "bg-white/10 border border-white/10"
        : "bg-black/10 border border-black/10"
      : useDarkMode
        ? "bg-gray-800 border border-gray-700"
        : "bg-gray-50 border border-gray-200"
  }`;

  const profileBtnClass = (isSelected: boolean) =>
    `flex items-center gap-2.5 px-2.5 py-2 rounded-xl border transition-all duration-150 text-left w-full ${
      isSelected
        ? useLiquidGlass
          ? useDarkMode
            ? "bg-white/20 border-white/30"
            : "bg-black/15 border-black/20"
          : useDarkMode
            ? "bg-gray-700 border-gray-500"
            : "bg-gray-100 border-gray-300"
        : useLiquidGlass
          ? useDarkMode
            ? "bg-transparent border-transparent hover:bg-white/10"
            : "bg-transparent border-transparent hover:bg-white/10"
          : useDarkMode
            ? "bg-transparent border-transparent hover:bg-gray-800"
            : "bg-transparent border-transparent hover:bg-gray-50"
    }`;

  const countBadge = `ml-auto text-xs px-1.5 py-0.5 rounded-full ${
    useLiquidGlass
      ? useDarkMode
        ? "bg-white/15 text-white/70"
        : "bg-black/10 text-white/70"
      : useDarkMode
        ? "bg-gray-700 text-gray-300"
        : "bg-gray-200 text-gray-500"
  }`;

  return {
    settings,
    useLiquidGlass,
    useDarkMode,
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    PAGE_SIZE,
    selectedUserId,
    setSelectedUserId,
    selectedProfileIdx,
    setSelectedProfileIdx,
    banDialogOpen,
    setBanDialogOpen,
    users,
    usersLoading,
    profiles,
    profilesLoading,
    selectedUser,
    selectedProfile,
    filteredUsers,
    paginatedUsers,
    handleUserSelect,
    handleBanConfirm,
    handleUnban,
    banMutation,
    unbanMutation,
    promoteMutation,
    demoteMutation,
    handlePromote,
    handleDemote,
    updateProfileMutation,
    handleUpdateCoins,
    cardBg,
    panelBg,
    textColor,
    subtextColor,
    textShadow,
    inputClass,
    sepClass,
    statCard,
    profileBtnClass,
    countBadge,
  } as const;
}

export type AdminPageLogic = ReturnType<typeof useAdminPageLogic>;
