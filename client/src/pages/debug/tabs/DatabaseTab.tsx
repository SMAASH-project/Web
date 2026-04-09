import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Users,
  UserCircle,
  ShoppingBag,
  Sword,
  Layers,
  Tag,
  Star,
  Receipt,
  Shield,
  FileText,
  BarChart2,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  Loader2,
  Ban,
  ShieldCheck,
  ShieldBan,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useAdminUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  usePromoteUserMutation,
  useDemoteUserMutation,
} from "@/hooks/useAdmin";
import {
  useDebugCharactersQuery,
  useDebugLevelsQuery,
  useDebugItemsQuery,
  useAdminProfilesQuery,
  useAdminPurchasesQuery,
  useRolesQuery,
  useCategoriesQuery,
  useRaritiesQuery,
  usePostsQuery,
  useTopItemsQuery,
  useTopPlayersQuery,
  useTopLevelsQuery,
  useLeaderboardQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
  useDeleteCharacterMutation,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useCreateRarityMutation,
  useUpdateRarityMutation,
  useDeleteRarityMutation,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useCreatePurchaseMutation,
  useUpdatePurchaseMutation,
  useDeletePurchaseMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from "@/hooks/useDebug";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourceId =
  | "users"
  | "profiles"
  | "items"
  | "characters"
  | "levels"
  | "categories"
  | "rarities"
  | "purchases"
  | "roles"
  | "posts"
  | "stats";

type UserAction = "ban" | "unban" | "promote" | "demote";

interface HistoryEntry {
  ts: number;
  action: string;
  ok: boolean;
}

// ─── Resource metadata ────────────────────────────────────────────────────────

interface ResourceMeta {
  id: ResourceId;
  label: string;
  icon: React.ReactNode;
  columns: string[];
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  isDangerDelete?: boolean;
  dangerNote?: string;
  noActionsNote?: string;
}

const RESOURCES: ResourceMeta[] = [
  {
    id: "users",
    label: "Users",
    icon: <Users size={11} />,
    columns: ["id", "email", "role", "is_banned", "last_login"],
    canCreate: false,
    canUpdate: true,
    canDelete: true,
    isDangerDelete: true,
    dangerNote: "Deletes all profiles, purchases, and match records for this user.",
  },
  {
    id: "profiles",
    label: "Profiles",
    icon: <UserCircle size={11} />,
    columns: ["id", "display_name", "user_id", "coins"],
    canCreate: false,
    canUpdate: true,
    canDelete: true,
    isDangerDelete: true,
    dangerNote: "Deletes all purchases associated with this profile.",
  },
  {
    id: "items",
    label: "Items",
    icon: <ShoppingBag size={11} />,
    columns: ["id", "name", "price", "rarity"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "characters",
    label: "Characters",
    icon: <Sword size={11} />,
    columns: ["id", "name"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "levels",
    label: "Levels",
    icon: <Layers size={11} />,
    columns: ["id", "name"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "categories",
    label: "Categories",
    icon: <Tag size={11} />,
    columns: ["id", "name"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "rarities",
    label: "Rarities",
    icon: <Star size={11} />,
    columns: ["id", "name"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "purchases",
    label: "Purchases",
    icon: <Receipt size={11} />,
    columns: ["id", "player_profile_id", "item_id", "count"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "roles",
    label: "Roles",
    icon: <Shield size={11} />,
    columns: ["id", "name"],
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  },
  {
    id: "posts",
    label: "Posts",
    icon: <FileText size={11} />,
    columns: ["id", "created_at", "updated_at"],
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    noActionsNote: "No create/delete endpoints. Use the Endpoints tab to manage posts.",
  },
  {
    id: "stats",
    label: "Stats",
    icon: <BarChart2 size={11} />,
    columns: [],
    canCreate: false,
    canUpdate: false,
    canDelete: false,
    noActionsNote: "Read-only aggregate statistics.",
  },
];

// ─── Hardcoded schema (derived from Go models) ────────────────────────────────

const SCHEMAS: Record<string, Array<{ field: string; type: string; notes?: string }>> = {
  users: [
    { field: "id", type: "uint", notes: "PK auto-increment" },
    { field: "email", type: "string unique" },
    { field: "password_hash", type: "string", notes: "bcrypt, write-only" },
    { field: "role_id", type: "uint → roles.id", notes: "FK" },
    { field: "is_banned", type: "bool" },
    { field: "banned_until", type: "datetime", notes: "null = not banned" },
    { field: "last_login", type: "datetime" },
  ],
  profiles: [
    { field: "id", type: "uint", notes: "PK auto-increment" },
    { field: "display_name", type: "string unique" },
    { field: "user_id", type: "uint → users.id", notes: "FK, cascade delete" },
    { field: "coins", type: "uint" },
    { field: "pfp_uri", type: "string" },
  ],
  items: [
    { field: "id", type: "uint" },
    { field: "name", type: "string unique" },
    { field: "description", type: "text" },
    { field: "rarity_id", type: "uint → rarities.id", notes: "FK" },
    { field: "price", type: "uint" },
    { field: "img_uri", type: "string" },
  ],
  characters: [
    { field: "id", type: "uint" },
    { field: "name", type: "string unique" },
    { field: "img_uri", type: "string" },
  ],
  levels: [
    { field: "id", type: "uint" },
    { field: "name", type: "string" },
    { field: "img_uri", type: "string" },
  ],
  categories: [
    { field: "id", type: "uint" },
    { field: "name", type: "string unique" },
  ],
  rarities: [
    { field: "id", type: "uint" },
    { field: "name", type: "string unique" },
  ],
  purchases: [
    { field: "id", type: "uint" },
    { field: "player_profile_id", type: "uint → profiles.id", notes: "FK" },
    { field: "item_id", type: "uint → items.id", notes: "FK" },
    { field: "count", type: "uint" },
  ],
  roles: [
    { field: "id", type: "uint" },
    { field: "name", type: "string" },
  ],
  posts: [
    { field: "id", type: "uint" },
    { field: "created_at", type: "datetime", notes: "GORM auto" },
    { field: "updated_at", type: "datetime", notes: "GORM auto" },
  ],
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface DatabaseTabProps {
  textColor: string;
  subtextColor: string;
  panelBg: string;
  inputClass: string;
  bgClass: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatabaseTab({ textColor, subtextColor, panelBg, inputClass }: DatabaseTabProps) {
  const { t } = useTranslation("debug");
  // ── UI state ──────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<ResourceId>("users");
  const [filter, setFilter] = useState("");
  const [showSchema, setShowSchema] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // ── Dialog state ──────────────────────────────────────────────────────────
  const [editTarget, setEditTarget] = useState<Record<string, unknown> | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    label: string;
    isDanger?: boolean;
    dangerNote?: string;
  } | null>(null);
  const [userActionTarget, setUserActionTarget] = useState<{
    userId: number;
    email: string;
    currentRole: string;
    isBanned: boolean;
  } | null>(null);
  const [userAction, setUserAction] = useState<UserAction | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState<Record<string, string>>({});
  const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);
  const [banMinutes, setBanMinutes] = useState("1440");
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<"admin" | "support">("support");

  // ── Queries ───────────────────────────────────────────────────────────────
  const { data: users = [], isLoading: usersLoading } = useAdminUsersQuery();
  const { data: profiles = [], isLoading: profilesLoading } = useAdminProfilesQuery();
  const { data: items = [], isLoading: itemsLoading } = useDebugItemsQuery();
  const { data: characters = [], isLoading: charsLoading } = useDebugCharactersQuery();
  const { data: levels = [], isLoading: levelsLoading } = useDebugLevelsQuery();
  const { data: categories = [], isLoading: catsLoading } = useCategoriesQuery();
  const { data: rarities = [], isLoading: rarsLoading } = useRaritiesQuery();
  const { data: purchases = [], isLoading: purchasesLoading } = useAdminPurchasesQuery();
  const { data: roles = [], isLoading: rolesLoading } = useRolesQuery();
  const { data: posts = [], isLoading: postsLoading } = usePostsQuery();
  const { data: topItems = [] } = useTopItemsQuery();
  const { data: topPlayers = [] } = useTopPlayersQuery();
  const { data: topLevels = [] } = useTopLevelsQuery();
  const { data: leaderboard = [] } = useLeaderboardQuery();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateUser = useUpdateUserMutation();
  const deleteUser = useDeleteUserMutation();
  const banUser = useBanUserMutation();
  const unbanUser = useUnbanUserMutation();
  const promoteUser = usePromoteUserMutation();
  const demoteUser = useDemoteUserMutation();

  const createChar = useCreateCharacterMutation();
  const updateChar = useUpdateCharacterMutation();
  const deleteChar = useDeleteCharacterMutation();

  const createLevel = useCreateLevelMutation();
  const updateLevel = useUpdateLevelMutation();
  const deleteLevel = useDeleteLevelMutation();

  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const createCat = useCreateCategoryMutation();
  const updateCat = useUpdateCategoryMutation();
  const deleteCat = useDeleteCategoryMutation();

  const createRarity = useCreateRarityMutation();
  const updateRarity = useUpdateRarityMutation();
  const deleteRarity = useDeleteRarityMutation();

  const createRole = useCreateRoleMutation();
  const updateRole = useUpdateRoleMutation();
  const deleteRole = useDeleteRoleMutation();

  const updateProfile = useUpdateProfileMutation();
  const deleteProfile = useDeleteProfileMutation();

  const createPurchase = useCreatePurchaseMutation();
  const updatePurchase = useUpdatePurchaseMutation();
  const deletePurchase = useDeletePurchaseMutation();

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addHistory = (action: string, ok: boolean) =>
    setHistory((prev) => [{ ts: Date.now(), action, ok }, ...prev].slice(0, 20));

  const currentMeta = RESOURCES.find((r) => r.id === selected)!;

  const currentData = useMemo((): Record<string, unknown>[] => {
    const map: Record<ResourceId, unknown[]> = {
      users,
      profiles,
      items,
      characters,
      levels,
      categories,
      rarities,
      purchases,
      roles,
      posts,
      stats: [],
    };
    return (map[selected] ?? []) as Record<string, unknown>[];
  }, [
    selected,
    users,
    profiles,
    items,
    characters,
    levels,
    categories,
    rarities,
    purchases,
    roles,
    posts,
  ]);

  const isLoading = useMemo(() => {
    const map: Record<ResourceId, boolean> = {
      users: usersLoading,
      profiles: profilesLoading,
      items: itemsLoading,
      characters: charsLoading,
      levels: levelsLoading,
      categories: catsLoading,
      rarities: rarsLoading,
      purchases: purchasesLoading,
      roles: rolesLoading,
      posts: postsLoading,
      stats: false,
    };
    return map[selected];
  }, [
    selected,
    usersLoading,
    profilesLoading,
    itemsLoading,
    charsLoading,
    levelsLoading,
    catsLoading,
    rarsLoading,
    purchasesLoading,
    rolesLoading,
    postsLoading,
  ]);

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return currentData;
    return currentData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [currentData, filter]);

  // ── Dialog handlers ───────────────────────────────────────────────────────

  const openEdit = (row: Record<string, unknown>) => {
    const fd: Record<string, string> = {};
    for (const [k, v] of Object.entries(row)) {
      fd[k] = String(v ?? "");
    }
    if (selected === "items") {
      const itemCats = (row.categories as string[]) ?? [];
      setFormCategoryIds(
        itemCats.map((n) => categories.find((c) => c.name === n)?.id).filter(Boolean) as number[],
      );
      const rarityId = rarities.find((r) => r.name === row.rarity)?.id;
      if (rarityId) fd.rarity_id = String(rarityId);
    }
    setForm(fd);
    setEditTarget(row);
    setIsCreating(false);
  };

  const openCreate = () => {
    setForm({});
    setFormCategoryIds([]);
    setEditTarget(null);
    setIsCreating(true);
  };

  const closeFormDialog = () => {
    setEditTarget(null);
    setIsCreating(false);
  };

  const setField = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const toggleCategoryId = (id: number) =>
    setFormCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // ── Submit handlers ───────────────────────────────────────────────────────

  const handleFormSubmit = async () => {
    try {
      if (isCreating) {
        switch (selected) {
          case "characters":
            await createChar.mutateAsync({ name: form.name });
            addHistory(`Created character "${form.name}"`, true);
            toast.success("Character created");
            break;
          case "levels":
            await createLevel.mutateAsync({ name: form.name });
            addHistory(`Created level "${form.name}"`, true);
            toast.success("Level created");
            break;
          case "items":
            await createItem.mutateAsync({
              name: form.name,
              description: form.description ?? "",
              price: Number(form.price) || 0,
              rarity_id: Number(form.rarity_id) || 1,
              category_ids: formCategoryIds,
            });
            addHistory(`Created item "${form.name}"`, true);
            toast.success("Item created");
            break;
          case "categories":
            await createCat.mutateAsync({ name: form.name });
            addHistory(`Created category "${form.name}"`, true);
            toast.success("Category created");
            break;
          case "rarities":
            await createRarity.mutateAsync({ name: form.name });
            addHistory(`Created rarity "${form.name}"`, true);
            toast.success("Rarity created");
            break;
          case "roles":
            await createRole.mutateAsync({ name: form.name });
            addHistory(`Created role "${form.name}"`, true);
            toast.success("Role created");
            break;
          case "purchases":
            await createPurchase.mutateAsync({
              player_profile_id: Number(form.player_profile_id),
              item_id: Number(form.item_id),
              count: Number(form.count) || 1,
            });
            addHistory(`Created purchase for profile #${form.player_profile_id}`, true);
            toast.success("Purchase created");
            break;
        }
      } else if (editTarget) {
        const id = Number(editTarget.id);
        switch (selected) {
          case "users":
            await updateUser.mutateAsync({ id, email: form.email });
            addHistory(`Updated user #${id} email → ${form.email}`, true);
            toast.success("User updated");
            break;
          case "profiles":
            await updateProfile.mutateAsync({
              id,
              display_name: form.display_name,
              coins: Number(form.coins) || 0,
            });
            addHistory(`Updated profile #${id}`, true);
            toast.success("Profile updated");
            break;
          case "characters":
            await updateChar.mutateAsync({ id, name: form.name });
            addHistory(`Updated character #${id} → "${form.name}"`, true);
            toast.success("Character updated");
            break;
          case "levels":
            await updateLevel.mutateAsync({ id, name: form.name });
            addHistory(`Updated level #${id} → "${form.name}"`, true);
            toast.success("Level updated");
            break;
          case "items":
            await updateItem.mutateAsync({
              id,
              name: form.name,
              description: form.description ?? "",
              price: Number(form.price) || 0,
              rarity_id: Number(form.rarity_id) || 1,
              category_ids: formCategoryIds,
            });
            addHistory(`Updated item #${id}`, true);
            toast.success("Item updated");
            break;
          case "categories":
            await updateCat.mutateAsync({ id, name: form.name });
            addHistory(`Updated category #${id}`, true);
            toast.success("Category updated");
            break;
          case "rarities":
            await updateRarity.mutateAsync({ id, name: form.name });
            addHistory(`Updated rarity #${id}`, true);
            toast.success("Rarity updated");
            break;
          case "roles":
            await updateRole.mutateAsync({ id, name: form.name });
            addHistory(`Updated role #${id}`, true);
            toast.success("Role updated");
            break;
          case "purchases":
            await updatePurchase.mutateAsync({
              id,
              player_profile_id: Number(form.player_profile_id),
              item_id: Number(form.item_id),
              count: Number(form.count) || 1,
            });
            addHistory(`Updated purchase #${id}`, true);
            toast.success("Purchase updated");
            break;
        }
      }
      closeFormDialog();
    } catch {
      addHistory(`Failed to ${isCreating ? "create" : "update"} ${selected}`, false);
      toast.error("Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    try {
      switch (selected) {
        case "users":
          await deleteUser.mutateAsync(id);
          break;
        case "profiles":
          await deleteProfile.mutateAsync(id);
          break;
        case "items":
          await deleteItem.mutateAsync(id);
          break;
        case "characters":
          await deleteChar.mutateAsync(id);
          break;
        case "levels":
          await deleteLevel.mutateAsync(id);
          break;
        case "categories":
          await deleteCat.mutateAsync(id);
          break;
        case "rarities":
          await deleteRarity.mutateAsync(id);
          break;
        case "purchases":
          await deletePurchase.mutateAsync(id);
          break;
        case "roles":
          await deleteRole.mutateAsync(id);
          break;
      }
      addHistory(`Deleted ${selected.replace(/s$/, "")} #${id} "${deleteTarget.label}"`, true);
      toast.success("Deleted");
      setDeleteTarget(null);
    } catch {
      addHistory(`Failed to delete ${selected.replace(/s$/, "")} #${id}`, false);
      toast.error("Delete failed");
      setDeleteTarget(null);
    }
  };

  const handleUserAction = async () => {
    if (!userActionTarget || !userAction) return;
    const { userId, email } = userActionTarget;
    try {
      switch (userAction) {
        case "ban":
          await banUser.mutateAsync({
            userId,
            payload: isPermanentBan
              ? { ban_type: "permanent" }
              : {
                  ban_type: "temporary",
                  ban_until: new Date(Date.now() + Number(banMinutes) * 60_000).toISOString(),
                },
          });
          addHistory(
            `Banned user #${userId} (${email}) ${isPermanentBan ? "permanently" : `for ${banMinutes}m`}`,
            true,
          );
          toast.success("User banned");
          break;
        case "unban":
          await unbanUser.mutateAsync({ userId });
          addHistory(`Unbanned user #${userId} (${email})`, true);
          toast.success("User unbanned");
          break;
        case "promote":
          await promoteUser.mutateAsync({ userId, targetRole: promoteTarget });
          addHistory(`Promoted #${userId} (${email}) → ${promoteTarget}`, true);
          toast.success(`Promoted to ${promoteTarget}`);
          break;
        case "demote":
          await demoteUser.mutateAsync({ userId });
          addHistory(`Demoted #${userId} (${email}) → user`, true);
          toast.success("User demoted");
          break;
      }
      setUserActionTarget(null);
      setUserAction(null);
    } catch {
      toast.error("Action failed");
      setUserActionTarget(null);
      setUserAction(null);
    }
  };

  // ── Row label helper ──────────────────────────────────────────────────────

  const getRowLabel = (row: Record<string, unknown>): string =>
    String(row.name ?? row.email ?? row.display_name ?? row.id ?? "");

  // ── Cell renderer ─────────────────────────────────────────────────────────

  const renderCell = (col: string, row: Record<string, unknown>) => {
    const value = row[col];
    if (col === "is_banned") {
      return value ? (
        <span className="font-medium text-red-400">{t("db.bannedStatus")}</span>
      ) : (
        <span className="text-green-400">{t("db.activeStatus")}</span>
      );
    }
    if (col === "last_login" || col === "created_at" || col === "updated_at") {
      if (!value) return <span className={subtextColor}>—</span>;
      try {
        return (
          <span className={`font-mono text-[10px] ${subtextColor}`}>
            {new Date(value as string).toLocaleDateString()}
          </span>
        );
      } catch {
        return String(value);
      }
    }
    return (
      <span className={`block max-w-32 truncate text-xs ${textColor}`}>{String(value ?? "—")}</span>
    );
  };

  // ── Form field renderer ───────────────────────────────────────────────────

  const renderFormFields = () => {
    const inp = (key: string, label: string, type: "text" | "number" = "text") => (
      <div key={key} className="flex flex-col gap-1">
        <label className={`text-[10px] ${subtextColor}`}>{label}</label>
        <input
          type={type}
          value={form[key] ?? ""}
          onChange={(e) => setField(key, e.target.value)}
          className={`rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
        />
      </div>
    );

    switch (selected) {
      case "users":
        return inp("email", "Email");
      case "profiles":
        return (
          <>
            {inp("display_name", "Display Name")}
            {inp("coins", "Coins", "number")}
          </>
        );
      case "characters":
      case "levels":
      case "categories":
      case "rarities":
      case "roles":
        return inp("name", "Name");
      case "purchases":
        return (
          <>
            {inp("player_profile_id", "Profile ID", "number")}
            {inp("item_id", "Item ID", "number")}
            {inp("count", "Count", "number")}
          </>
        );
      case "items":
        return (
          <>
            {inp("name", "Name")}
            {inp("description", "Description")}
            {inp("price", "Price", "number")}
            <div className="flex flex-col gap-1">
              <label className={`text-[10px] ${subtextColor}`}>Rarity</label>
              <select
                value={form.rarity_id ?? ""}
                onChange={(e) => setField("rarity_id", e.target.value)}
                className={`rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
              >
                <option value="">— select —</option>
                {rarities.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className={`text-[10px] ${subtextColor}`}>Categories</label>
              <div className="flex flex-wrap gap-1">
                {categories.map((c) => {
                  const active = formCategoryIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => toggleCategoryId(c.id)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-colors ${
                        active
                          ? "bg-violet-500/30 text-violet-300"
                          : `bg-current/10 ${subtextColor} hover:bg-current/20`
                      }`}
                    >
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        );
      default:
        return <p className={`text-xs ${subtextColor}`}>{t("db.noEditableFields")}</p>;
    }
  };

  // ── Stats view ────────────────────────────────────────────────────────────

  const renderStats = () => (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {[
        {
          title: t("db.topItems"),
          icon: <ShoppingBag size={11} />,
          rows: topItems.map((x) => ({
            label: x.name,
            value: `${x.count_of_purchases} ${t("db.purchases")}`,
          })),
        },
        {
          title: t("db.topPlayers"),
          icon: <UserCircle size={11} />,
          rows: topPlayers.map((x) => ({
            label: x.display_name,
            value: `${x.count_of_matches} ${t("db.matches")}`,
          })),
        },
        {
          title: t("db.topLevels"),
          icon: <Layers size={11} />,
          rows: topLevels.map((x) => ({
            label: x.name,
            value: `${x.count_of_plays} ${t("db.plays")}`,
          })),
        },
        {
          title: t("db.leaderboard"),
          icon: <Star size={11} />,
          rows: leaderboard.map((x) => ({
            label: x.display_name,
            value: `${x.count_of_wins} ${t("db.wins")}`,
          })),
        },
      ].map(({ title, icon, rows }) => (
        <div key={title} className={`flex flex-col gap-0.5 rounded-xl p-3 ${panelBg}`}>
          <div className={`mb-2 flex items-center gap-1.5 ${subtextColor}`}>
            {icon}
            <p className="text-[10px] font-semibold tracking-widest uppercase">{title}</p>
          </div>
          {rows.length === 0 ? (
            <p className={`py-2 text-center text-[10px] opacity-40 ${subtextColor}`}>
              {t("db.statsNoData")}
            </p>
          ) : (
            rows.slice(0, 8).map((row, i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-current/5 py-1 last:border-0"
              >
                <span className={`text-xs ${textColor}`}>{row.label}</span>
                <span className={`text-[10px] ${subtextColor}`}>{row.value}</span>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );

  // ── User action button group (inline in Users table) ─────────────────────

  const renderUserActions = (row: Record<string, unknown>) => {
    const uid = Number(row.id);
    const email = String(row.email ?? "");
    const currentRole = String(row.role ?? "user");
    const isBanned = Boolean(row.is_banned);

    const target = { userId: uid, email, currentRole, isBanned };

    const actionBtn = (icon: React.ReactNode, title: string, action: UserAction, cls: string) => (
      <button
        type="button"
        title={title}
        onClick={() => {
          setUserActionTarget(target);
          setUserAction(action);
          if (action === "ban") {
            setBanMinutes("1440");
            setIsPermanentBan(false);
          }
          if (action === "promote") setPromoteTarget("support");
        }}
        className={`rounded p-0.5 transition-colors hover:opacity-80 ${cls}`}
      >
        {icon}
      </button>
    );

    return (
      <div className="flex items-center gap-0.5">
        {!isBanned
          ? actionBtn(<Ban size={10} />, "Ban", "ban", "text-red-400")
          : actionBtn(<ShieldCheck size={10} />, "Unban", "unban", "text-green-400")}
        {currentRole === "user" &&
          actionBtn(<ArrowUpCircle size={10} />, "Promote", "promote", subtextColor)}
        {(currentRole === "admin" || currentRole === "support") &&
          actionBtn(<ArrowDownCircle size={10} />, "Demote", "demote", "text-amber-400")}
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const noActionsNotes: Partial<Record<ResourceId, string>> = {
    posts: t("db.postsNoActionsNote"),
    stats: t("db.statsNoActionsNote"),
  };
  const dangerNotes: Partial<Record<ResourceId, string>> = {
    users: t("db.usersDangerNote"),
    profiles: t("db.profilesDangerNote"),
  };

  const formDialogOpen = isCreating || editTarget !== null;
  const formDialogTitle = isCreating
    ? `${t("db.dialogNew")} ${currentMeta.label.replace(/s$/, "")}`
    : `${t("db.edit")} ${currentMeta.label.replace(/s$/, "")} #${editTarget?.id ?? ""}`;

  return (
    <div className="flex flex-col gap-3">
      {/* ── Resource selector pills ──────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1">
        {RESOURCES.map((r) => {
          const active = r.id === selected;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => {
                setSelected(r.id);
                setFilter("");
                setShowSchema(false);
              }}
              className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium transition-all ${
                active ? "bg-white/20 " + textColor : subtextColor + " hover:bg-white/10"
              }`}
            >
              {r.icon}
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ── Table panel ─────────────────────────────────────────────────── */}
      <div className={`flex flex-col gap-2 rounded-xl p-3 ${panelBg}`}>
        {/* Header */}
        <div className="flex flex-wrap items-center gap-2">
          <div className={`flex items-center gap-1.5 ${subtextColor} mr-auto`}>
            {currentMeta.icon}
            <p className="text-[10px] font-semibold tracking-widest uppercase">
              {currentMeta.label}
              {selected !== "stats" && !isLoading && (
                <span className="ml-1 opacity-50">({filteredRows.length})</span>
              )}
            </p>
          </div>

          {selected !== "stats" && (
            <>
              <input
                type="text"
                placeholder={t("db.filter")}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className={`w-32 rounded-lg px-2 py-1 text-[10px] ${inputClass}`}
              />
              {SCHEMAS[selected] && (
                <button
                  onClick={() => setShowSchema((v) => !v)}
                  className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] transition-colors ${subtextColor} hover:bg-current/10`}
                >
                  {showSchema ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                  {t("db.schema")}
                </button>
              )}
              {currentMeta.canCreate && (
                <button
                  onClick={openCreate}
                  className="flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
                >
                  <Plus size={10} /> {t("db.add")}
                </button>
              )}
            </>
          )}
        </div>

        {/* Schema collapsible */}
        {showSchema && SCHEMAS[selected] && (
          <div className="rounded-lg border border-current/10 p-2">
            <table className="w-full text-[10px]">
              <thead>
                <tr className={subtextColor}>
                  <th className="pb-1 text-left font-semibold">{t("db.schemaField")}</th>
                  <th className="pb-1 text-left font-semibold">{t("db.schemaType")}</th>
                  <th className="pb-1 text-left font-semibold">{t("db.schemaLabelNotes")}</th>
                </tr>
              </thead>
              <tbody>
                {SCHEMAS[selected].map((f) => (
                  <tr key={f.field} className="border-t border-current/5">
                    <td className={`py-0.5 font-mono ${textColor}`}>{f.field}</td>
                    <td className={`py-0.5 font-mono ${subtextColor}`}>{f.type}</td>
                    <td className={`py-0.5 ${subtextColor} opacity-60`}>{f.notes ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* No-actions note */}
        {currentMeta.noActionsNote && (
          <p className={`text-[10px] ${subtextColor} opacity-60`}>
            {noActionsNotes[selected] ?? currentMeta.noActionsNote}
          </p>
        )}

        {/* Stats special view */}
        {selected === "stats" && renderStats()}

        {/* Generic data table */}
        {selected !== "stats" && (
          <>
            {isLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={16} className={`animate-spin ${subtextColor}`} />
              </div>
            ) : filteredRows.length === 0 ? (
              <p className={`py-4 text-center text-xs opacity-40 ${subtextColor}`}>
                {filter ? t("db.noMatches") : t("db.noData")}
              </p>
            ) : (
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full min-w-0 border-collapse text-xs">
                  <thead>
                    <tr>
                      {currentMeta.columns.map((col) => (
                        <th
                          key={col}
                          className={`pb-1 text-left text-[10px] font-semibold ${subtextColor} capitalize`}
                        >
                          {col.replace(/_/g, " ")}
                        </th>
                      ))}
                      {(currentMeta.canUpdate || currentMeta.canDelete || selected === "users") && (
                        <th className={`pb-1 text-right text-[10px] font-semibold ${subtextColor}`}>
                          {t("db.actions")}
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <tr key={i} className="border-t border-current/5 hover:bg-current/3">
                        {currentMeta.columns.map((col) => (
                          <td key={col} className="py-1 pr-3">
                            {renderCell(col, row)}
                          </td>
                        ))}
                        {(currentMeta.canUpdate ||
                          currentMeta.canDelete ||
                          selected === "users") && (
                          <td className="py-1">
                            <div className="flex items-center justify-end gap-1">
                              {selected === "users" && renderUserActions(row)}
                              {currentMeta.canUpdate && (
                                <button
                                  type="button"
                                  title="Edit"
                                  onClick={() => openEdit(row)}
                                  className={`rounded p-0.5 transition-colors hover:opacity-80 ${subtextColor}`}
                                >
                                  <Pencil size={10} />
                                </button>
                              )}
                              {currentMeta.canDelete && (
                                <button
                                  type="button"
                                  title="Delete"
                                  onClick={() =>
                                    setDeleteTarget({
                                      id: Number(row.id),
                                      label: getRowLabel(row),
                                      isDanger: currentMeta.isDangerDelete,
                                      dangerNote: currentMeta.dangerNote,
                                    })
                                  }
                                  className="rounded p-0.5 text-red-400 transition-colors hover:text-red-300"
                                >
                                  <Trash2 size={10} />
                                </button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Session history ──────────────────────────────────────────────── */}
      <div className={`rounded-xl ${panelBg}`}>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          className={`flex w-full items-center justify-between rounded-xl p-3 text-[10px] font-semibold tracking-widest uppercase ${subtextColor} hover:bg-current/5`}
        >
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            {t("db.sessionHistory")}
            {history.length > 0 && (
              <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[9px]">
                {history.length}
              </span>
            )}
          </div>
          {showHistory ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
        </button>

        {showHistory && (
          <div className="border-t border-current/10 px-3 pb-3">
            {history.length === 0 ? (
              <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>
                {t("db.noActionsYet")}
              </p>
            ) : (
              <div className="flex flex-col gap-0.5 pt-2">
                {history.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 py-0.5">
                    {entry.ok ? (
                      <CheckCircle size={10} className="shrink-0 text-green-400" />
                    ) : (
                      <XCircle size={10} className="shrink-0 text-red-400" />
                    )}
                    <span className={`flex-1 text-[10px] ${textColor}`}>{entry.action}</span>
                    <span className={`shrink-0 font-mono text-[9px] ${subtextColor}`}>
                      {new Date(entry.ts).toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setHistory([])}
                  className={`mt-1 flex items-center gap-1 self-end text-[10px] ${subtextColor} hover:opacity-80`}
                >
                  <RefreshCw size={9} /> {t("db.clearHistory")}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Danger Zone ──────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-red-500/20 bg-red-500/5">
        <div className="flex items-center gap-2 border-b border-red-500/15 px-3 py-2">
          <AlertTriangle size={11} className="shrink-0 text-red-400" />
          <p className="text-[10px] font-semibold tracking-widest text-red-400 uppercase">
            {t("db.dangerZone")}
          </p>
        </div>
        <div className="px-3 py-2.5">
          <p className={`mb-2 text-[10px] leading-relaxed ${subtextColor}`}>{t("db.dangerDesc")}</p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <div className="rounded-lg border border-red-500/15 p-2">
              <p className={`mb-0.5 text-[10px] font-semibold ${textColor}`}>
                {t("db.deleteUserCascade")}
              </p>
              <p className={`text-[9px] leading-relaxed ${subtextColor}`}>
                {t("db.deleteUserCascadeDesc")}
              </p>
            </div>
            <div className="rounded-lg border border-red-500/15 p-2">
              <p className={`mb-0.5 text-[10px] font-semibold ${textColor}`}>
                {t("db.deleteProfileCascade")}
              </p>
              <p className={`text-[9px] leading-relaxed ${subtextColor}`}>
                {t("db.deleteProfileCascadeDesc")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit / Create dialog ─────────────────────────────────────────── */}
      <Dialog open={formDialogOpen} onOpenChange={(o) => !o && closeFormDialog()}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{formDialogTitle}</DialogTitle>
            {isCreating && (
              <DialogDescription className={`text-xs ${subtextColor}`}>
                {t("db.fillRequired")}
              </DialogDescription>
            )}
          </DialogHeader>
          <div className="flex flex-col gap-3 py-1">{renderFormFields()}</div>
          <DialogFooter>
            <button
              type="button"
              onClick={closeFormDialog}
              className={`rounded-lg border border-current/20 px-3 py-1.5 text-xs ${subtextColor} hover:border-current/40`}
            >
              {t("db.cancel")}
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              className="rounded-lg bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
            >
              {t("db.save")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ────────────────────────────────────────── */}
      <Dialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 size={14} className="text-red-400" />
              {t("db.delete")} {currentMeta.label.replace(/s$/, "")}
            </DialogTitle>
            <DialogDescription className={`text-xs ${subtextColor}`}>
              {t("db.deleteDesc", { id: deleteTarget?.id ?? "", label: deleteTarget?.label ?? "" })}
            </DialogDescription>
          </DialogHeader>
          {deleteTarget?.isDanger && deleteTarget.dangerNote && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2.5">
              <AlertTriangle size={11} className="mt-0.5 shrink-0 text-red-400" />
              <p className="text-[10px] text-red-300">
                {dangerNotes[selected] ?? deleteTarget.dangerNote}
              </p>
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className={`rounded-lg border border-current/20 px-3 py-1.5 text-xs ${subtextColor} hover:border-current/40`}
            >
              {t("db.cancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
            >
              {t("db.delete")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User action dialog ───────────────────────────────────────────── */}
      <Dialog
        open={userActionTarget !== null && userAction !== null}
        onOpenChange={(o) => {
          if (!o) {
            setUserActionTarget(null);
            setUserAction(null);
          }
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {userAction === "ban" && <ShieldBan size={14} className="text-red-400" />}
              {userAction === "unban" && <ShieldCheck size={14} className="text-green-400" />}
              {userAction === "promote" && <ArrowUpCircle size={14} className="text-violet-400" />}
              {userAction === "demote" && <ArrowDownCircle size={14} className="text-amber-400" />}
              {userAction === "ban" && t("db.banUser")}
              {userAction === "unban" && t("db.unbanUser")}
              {userAction === "promote" && t("db.promoteUser")}
              {userAction === "demote" && t("db.demoteUser")}
            </DialogTitle>
            <DialogDescription className={`text-xs ${subtextColor}`}>
              {userActionTarget?.email} #{userActionTarget?.userId}
            </DialogDescription>
          </DialogHeader>

          {userAction === "ban" && (
            <div className="flex flex-col gap-3 py-1">
              <label className="flex items-center justify-between">
                <span className={`text-xs ${subtextColor}`}>{t("db.permanent")}</span>
                <button
                  type="button"
                  onClick={() => setIsPermanentBan((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${isPermanentBan ? "bg-red-500/40" : "bg-current/20"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${isPermanentBan ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </button>
              </label>
              {!isPermanentBan && (
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] ${subtextColor}`}>{t("db.durationMinutes")}</label>
                  <input
                    type="number"
                    min={1}
                    value={banMinutes}
                    onChange={(e) => setBanMinutes(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
                  />
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {[
                      { label: "1h", val: "60" },
                      { label: "1d", val: "1440" },
                      { label: "7d", val: "10080" },
                      { label: "30d", val: "43200" },
                    ].map(({ label, val }) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setBanMinutes(val)}
                        className={`rounded-full px-2 py-0.5 text-[10px] transition-colors ${banMinutes === val ? "bg-red-500/20 text-red-400" : `${subtextColor} bg-current/10 hover:bg-current/20`}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {userAction === "promote" && (
            <div className="flex gap-2 py-1">
              {(["support", "admin"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setPromoteTarget(role)}
                  className={`flex-1 rounded-lg border py-1.5 text-xs font-medium capitalize transition-colors ${
                    promoteTarget === role
                      ? "border-violet-500/40 bg-violet-500/20 text-violet-300"
                      : `border-current/20 ${subtextColor} hover:border-current/40`
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          <DialogFooter>
            <button
              type="button"
              onClick={() => {
                setUserActionTarget(null);
                setUserAction(null);
              }}
              className={`rounded-lg border border-current/20 px-3 py-1.5 text-xs ${subtextColor} hover:border-current/40`}
            >
              {t("db.cancel")}
            </button>
            <button
              type="button"
              onClick={handleUserAction}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                userAction === "ban"
                  ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  : userAction === "unban"
                    ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    : userAction === "promote"
                      ? "bg-violet-500/20 text-violet-300 hover:bg-violet-500/30"
                      : "bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
              }`}
            >
              {t("db.confirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
