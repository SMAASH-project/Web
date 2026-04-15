import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/pages/settings/SettingsContext";
import {
  getDialogClasses,
  getDialogFooterClasses,
  getTextShadow,
  getBackgroundClasses,
} from "@/lib/utils";
import { StyledSelect } from "@/components/ui/styled-select";
import {
  Loader2,
  Sword,
  Layers,
  ShoppingBag,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Users,
  Ban,
  ShieldCheck,
  ShieldBan,
  ArrowUpCircle,
  ArrowDownCircle,
  Search,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  useDebugCharactersQuery,
  useDebugLevelsQuery,
  useDebugItemsQuery,
  useCategoriesQuery,
  useRaritiesQuery,
  useCreateCharacterMutation,
  useUpdateCharacterMutation,
  useDeleteCharacterMutation,
  useCreateLevelMutation,
  useUpdateLevelMutation,
  useDeleteLevelMutation,
  useCreateItemMutation,
  useUpdateItemMutation,
  useDeleteItemMutation,
} from "@/hooks/useDebug";
import {
  useAdminUsersQuery,
  useBanUserMutation,
  useUnbanUserMutation,
  usePromoteUserMutation,
  useDemoteUserMutation,
} from "@/hooks/useAdmin";
import { toast } from "@/lib/toast";

// ─── Rarity colours ────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

// ─── Props ─────────────────────────────────────────────────────────────────────

interface GameDataTabProps {
  textColor: string;
  subtextColor: string;
  panelBg: string;
  inputClass?: string;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function GameDataTab({
  textColor,
  subtextColor,
  panelBg,
  inputClass = "",
}: GameDataTabProps) {
  const { t } = useTranslation("debug");
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const dialogClass = getDialogClasses(useLiquidGlass, useDarkMode);
  const footerClass = getDialogFooterClasses(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const bgClass = getBackgroundClasses(useLiquidGlass, useDarkMode, "strong");
  // ── Queries ──────────────────────────────────────────────────────────────
  const {
    data: characters = [],
    isLoading: charsLoading,
    isError: charsError,
  } = useDebugCharactersQuery();
  const {
    data: levels = [],
    isLoading: levelsLoading,
    isError: levelsError,
  } = useDebugLevelsQuery();
  const { data: items = [], isLoading: itemsLoading, isError: itemsError } = useDebugItemsQuery();
  const { data: categories = [] } = useCategoriesQuery();
  const { data: rarities = [] } = useRaritiesQuery();
  const { data: users = [], isLoading: usersLoading, isError: usersError } = useAdminUsersQuery();

  // ── Mutations ─────────────────────────────────────────────────────────────
  const createChar = useCreateCharacterMutation();
  const updateChar = useUpdateCharacterMutation();
  const deleteChar = useDeleteCharacterMutation();

  const createLevel = useCreateLevelMutation();
  const updateLevel = useUpdateLevelMutation();
  const deleteLevel = useDeleteLevelMutation();

  const createItem = useCreateItemMutation();
  const updateItem = useUpdateItemMutation();
  const deleteItem = useDeleteItemMutation();

  const banUser = useBanUserMutation();
  const unbanUser = useUnbanUserMutation();
  const promoteUser = usePromoteUserMutation();
  const demoteUser = useDemoteUserMutation();

  // ── Local state ───────────────────────────────────────────────────────────
  const [itemSearch, setItemSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Game content edit/create dialog
  type Section = "character" | "level" | "item";
  const [editSection, setEditSection] = useState<Section | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formRarityId, setFormRarityId] = useState("");
  const [formCategoryIds, setFormCategoryIds] = useState<number[]>([]);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<{
    section: Section;
    id: number;
    label: string;
  } | null>(null);

  // User action dialog
  const [userActionTarget, setUserActionTarget] = useState<{
    userId: number;
    email: string;
    currentRole: string;
    isBanned: boolean;
  } | null>(null);
  const [userAction, setUserAction] = useState<"ban" | "unban" | "promote" | "demote" | null>(null);
  const [banMinutes, setBanMinutes] = useState("1440");
  const [isPermanentBan, setIsPermanentBan] = useState(false);
  const [promoteTarget, setPromoteTarget] = useState<"admin" | "support">("support");

  // ── Dialog helpers ────────────────────────────────────────────────────────

  const openCreate = (section: Section) => {
    setEditSection(section);
    setEditId(null);
    setFormName("");
    setFormDesc("");
    setFormPrice("");
    setFormRarityId(rarities[0] ? String(rarities[0].id) : "");
    setFormCategoryIds([]);
  };

  const openEdit = (section: Section, id: number) => {
    setEditSection(section);
    setEditId(id);
    if (section === "character") {
      const c = characters.find((x) => x.id === id);
      setFormName(c?.name ?? "");
    } else if (section === "level") {
      const l = levels.find((x) => x.id === id);
      setFormName(l?.name ?? "");
    } else if (section === "item") {
      const item = items.find((x) => x.id === id);
      setFormName(item?.name ?? "");
      setFormDesc(item?.description ?? "");
      setFormPrice(String(item?.price ?? ""));
      const rid = rarities.find((r) => r.name === item?.rarity)?.id;
      setFormRarityId(rid ? String(rid) : "");
      const catIds = (item?.categories ?? [])
        .map((n) => categories.find((c) => c.name === n)?.id)
        .filter(Boolean) as number[];
      setFormCategoryIds(catIds);
    }
  };

  const closeDialog = () => {
    setEditSection(null);
    setEditId(null);
  };

  const toggleCatId = (id: number) =>
    setFormCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      if (editSection === "character") {
        if (editId !== null) {
          await updateChar.mutateAsync({ id: editId, name: formName });
          toast.success(t("toast.charUpdated"));
        } else {
          await createChar.mutateAsync({ name: formName });
          toast.success(t("toast.charCreated"));
        }
      } else if (editSection === "level") {
        if (editId !== null) {
          await updateLevel.mutateAsync({ id: editId, name: formName });
          toast.success(t("toast.levelUpdated"));
        } else {
          await createLevel.mutateAsync({ name: formName });
          toast.success(t("toast.levelCreated"));
        }
      } else if (editSection === "item") {
        const payload = {
          name: formName,
          description: formDesc,
          price: Number(formPrice) || 0,
          rarity_id: Number(formRarityId) || 1,
          category_ids: formCategoryIds,
        };
        if (editId !== null) {
          await updateItem.mutateAsync({ id: editId, ...payload });
          toast.success(t("toast.itemUpdated"));
        } else {
          await createItem.mutateAsync(payload);
          toast.success(t("toast.itemCreated"));
        }
      }
      closeDialog();
    } catch {
      toast.error(t("toast.opFailed"));
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.section === "character") await deleteChar.mutateAsync(deleteTarget.id);
      else if (deleteTarget.section === "level") await deleteLevel.mutateAsync(deleteTarget.id);
      else if (deleteTarget.section === "item") await deleteItem.mutateAsync(deleteTarget.id);
      toast.success(t("toast.deleted"));
      setDeleteTarget(null);
    } catch {
      toast.error(t("toast.deleteFailed"));
      setDeleteTarget(null);
    }
  };

  // ── User actions ──────────────────────────────────────────────────────────

  const handleUserAction = async () => {
    if (!userActionTarget || !userAction) return;
    const { userId } = userActionTarget;
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
          toast.success(t("toast.userBanned"));
          break;
        case "unban":
          await unbanUser.mutateAsync({ userId });
          toast.success(t("toast.userUnbanned"));
          break;
        case "promote":
          await promoteUser.mutateAsync({ userId, targetRole: promoteTarget });
          toast.success(t("toast.promotedTo", { role: promoteTarget }));
          break;
        case "demote":
          await demoteUser.mutateAsync({ userId });
          toast.success(t("toast.userDemoted"));
          break;
      }
      setUserActionTarget(null);
      setUserAction(null);
    } catch {
      toast.error(t("toast.actionFailed"));
    }
  };

  // ── Filtered data ─────────────────────────────────────────────────────────

  const filteredItems = itemSearch
    ? items.filter((x) => (x.name ?? "").toLowerCase().includes(itemSearch.toLowerCase()))
    : items;

  const filteredUsers = userSearch
    ? users.filter(
        (u) =>
          (u.email ?? "").toLowerCase().includes(userSearch.toLowerCase()) ||
          (u.role ?? "").toLowerCase().includes(userSearch.toLowerCase()),
      )
    : users;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const sectionTitle = (section: Section) => {
    if (section === "character") return "Character";
    if (section === "level") return "Level";
    return "Item";
  };

  const isEditingItem = editSection === "item";

  // ── Sub-components helpers ────────────────────────────────────────────────

  const cardHeader = (title: string, icon: React.ReactNode, count?: number, onAdd?: () => void) => (
    <div className={`mb-2 flex items-center gap-1.5 ${subtextColor}`}>
      {icon}
      <p className="flex-1 text-[10px] font-semibold tracking-widest uppercase">
        {title}
        {count !== undefined && <span className="ml-1 opacity-50">({count})</span>}
      </p>
      {onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
        >
          <Plus size={9} /> {t("gameData.add")}
        </button>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* ── Characters ───────────────────────────────────────────────── */}
        <div className={`flex flex-col gap-2 rounded-xl p-3 ${panelBg}`}>
          {cardHeader(
            t("gameData.characters"),
            <Sword size={11} />,
            charsLoading ? undefined : characters.length,
            () => openCreate("character"),
          )}
          {charsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
            </div>
          ) : charsError ? (
            <p className="py-3 text-center text-xs text-red-400 opacity-70">{t("gameData.none")}</p>
          ) : characters.length === 0 ? (
            <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>
              {t("gameData.none")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {characters.map((c) => (
                <div
                  key={c.id}
                  className="group flex items-center gap-2 rounded-lg bg-current/5 p-1.5"
                >
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-full bg-current/10">
                    <img
                      src={`/api/characters/${c.id}/img`}
                      alt={c.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-medium ${textColor}`}>{c.name}</p>
                    <p className={`font-mono text-[10px] ${subtextColor}`}>#{c.id}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit("character", c.id)}
                      className={`rounded p-0.5 ${subtextColor} hover:opacity-80`}
                    >
                      <Pencil size={9} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ section: "character", id: c.id, label: c.name })
                      }
                      className="rounded p-0.5 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Levels ───────────────────────────────────────────────────── */}
        <div className={`flex flex-col gap-2 rounded-xl p-3 ${panelBg}`}>
          {cardHeader(
            t("gameData.levels"),
            <Layers size={11} />,
            levelsLoading ? undefined : levels.length,
            () => openCreate("level"),
          )}
          {levelsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
            </div>
          ) : levelsError ? (
            <p className="py-3 text-center text-xs text-red-400 opacity-70">{t("gameData.none")}</p>
          ) : levels.length === 0 ? (
            <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>
              {t("gameData.none")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5">
              {levels.map((l) => (
                <div
                  key={l.id}
                  className="group flex items-center gap-2 rounded-lg bg-current/5 p-1.5"
                >
                  <div className="h-7 w-7 shrink-0 overflow-hidden rounded-lg bg-current/10">
                    <img
                      src={`/api/levels/${l.id}/img`}
                      alt={l.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-xs font-medium ${textColor}`}>{l.name}</p>
                    <p className={`font-mono text-[10px] ${subtextColor}`}>#{l.id}</p>
                  </div>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit("level", l.id)}
                      className={`rounded p-0.5 ${subtextColor} hover:opacity-80`}
                    >
                      <Pencil size={9} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ section: "level", id: l.id, label: l.name })}
                      className="rounded p-0.5 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Store Items ───────────────────────────────────────────────── */}
        <div className={`flex flex-col gap-2 rounded-xl p-3 sm:col-span-2 ${panelBg}`}>
          {cardHeader(
            t("gameData.storeItems"),
            <ShoppingBag size={11} />,
            itemsLoading ? undefined : items.length,
            () => openCreate("item"),
          )}
          {!itemsLoading && items.length > 0 && (
            <div className="relative">
              <Search
                size={10}
                className={`absolute top-1/2 left-2 -translate-y-1/2 ${subtextColor}`}
              />
              <input
                type="text"
                placeholder={t("gameData.searchItems")}
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className={`w-full rounded-lg py-1.5 pr-2 pl-6 text-[10px] ${inputClass}`}
              />
            </div>
          )}
          {itemsLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
            </div>
          ) : itemsError ? (
            <p className="py-3 text-center text-xs text-red-400 opacity-70">{t("gameData.none")}</p>
          ) : filteredItems.length === 0 ? (
            <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>
              {itemSearch ? t("gameData.noMatches") : t("gameData.none")}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group flex items-center gap-2 rounded-lg bg-current/5 px-2.5 py-1.5"
                >
                  <span className={`font-mono text-[10px] ${subtextColor} shrink-0`}>
                    #{item.id}
                  </span>
                  <span className={`flex-1 truncate text-xs font-medium ${textColor}`}>
                    {item.name}
                  </span>
                  <span
                    className="shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium"
                    style={{
                      color: RARITY_COLORS[item.rarity] ?? "#9ca3af",
                      backgroundColor: `${RARITY_COLORS[item.rarity] ?? "#9ca3af"}20`,
                    }}
                  >
                    {item.rarity}
                  </span>
                  <div className="flex shrink-0 gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit("item", item.id)}
                      className={`rounded p-0.5 ${subtextColor} hover:opacity-80`}
                    >
                      <Pencil size={9} />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDeleteTarget({ section: "item", id: item.id, label: item.name })
                      }
                      className="rounded p-0.5 text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={9} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── User Management ───────────────────────────────────────────── */}
        <div className={`flex flex-col gap-2 rounded-xl p-3 sm:col-span-2 ${panelBg}`}>
          <div className={`flex items-center gap-1.5 ${subtextColor}`}>
            <Users size={11} />
            <p className="flex-1 text-[10px] font-semibold tracking-widest uppercase">
              {t("gameData.userManagement")}
              {!usersLoading && <span className="ml-1 opacity-50">({users.length})</span>}
            </p>
          </div>

          {!usersLoading && users.length > 0 && (
            <div className="relative">
              <Search
                size={10}
                className={`absolute top-1/2 left-2 -translate-y-1/2 ${subtextColor}`}
              />
              <input
                type="text"
                placeholder={t("gameData.searchByEmailOrRole")}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className={`w-full rounded-lg py-1.5 pr-2 pl-6 text-[10px] ${inputClass}`}
              />
            </div>
          )}

          {usersLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
            </div>
          ) : usersError ? (
            <p className="py-3 text-center text-xs text-red-400 opacity-70">
              {t("gameData.noUsers")}
            </p>
          ) : filteredUsers.length === 0 ? (
            <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>
              {userSearch ? t("gameData.noMatches") : t("gameData.noUsers")}
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    {[
                      "#",
                      "Email",
                      "Role",
                      t("gameData.tableStatus"),
                      t("gameData.tableActions"),
                    ].map((h) => (
                      <th
                        key={h}
                        className={`pb-1 text-left text-[10px] font-semibold ${subtextColor}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-t border-current/5 hover:bg-current/3">
                      <td className={`py-1 pr-2 font-mono text-[10px] ${subtextColor}`}>{u.id}</td>
                      <td className={`max-w-40 truncate py-1 pr-2 text-xs ${textColor}`}>
                        {u.email}
                      </td>
                      <td className={`py-1 pr-2 text-xs capitalize ${subtextColor}`}>{u.role}</td>
                      <td className="py-1 pr-2">
                        {u.is_banned ? (
                          <span className="text-[10px] font-medium text-red-400">
                            {t("gameData.statusBanned")}
                          </span>
                        ) : (
                          <span className="text-[10px] text-green-400">
                            {t("gameData.statusActive")}
                          </span>
                        )}
                      </td>
                      <td className="py-1">
                        <div className="flex items-center gap-0.5">
                          {!u.is_banned ? (
                            <button
                              type="button"
                              onClick={() => {
                                setUserActionTarget({
                                  userId: u.id,
                                  email: u.email,
                                  currentRole: u.role,
                                  isBanned: u.is_banned,
                                });
                                setUserAction("ban");
                                setBanMinutes("1440");
                                setIsPermanentBan(false);
                              }}
                              className="rounded p-0.5 text-red-400 transition-colors hover:text-red-300"
                              title="Ban user"
                            >
                              <Ban size={11} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setUserActionTarget({
                                  userId: u.id,
                                  email: u.email,
                                  currentRole: u.role,
                                  isBanned: u.is_banned,
                                });
                                setUserAction("unban");
                              }}
                              className="rounded p-0.5 text-green-400 transition-colors hover:text-green-300"
                              title="Unban user"
                            >
                              <ShieldCheck size={11} />
                            </button>
                          )}
                          {u.role === "user" && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserActionTarget({
                                  userId: u.id,
                                  email: u.email,
                                  currentRole: u.role,
                                  isBanned: u.is_banned,
                                });
                                setUserAction("promote");
                                setPromoteTarget("support");
                              }}
                              className={`rounded p-0.5 transition-colors hover:opacity-80 ${subtextColor}`}
                              title="Promote"
                            >
                              <ArrowUpCircle size={11} />
                            </button>
                          )}
                          {(u.role === "admin" || u.role === "support") && (
                            <button
                              type="button"
                              onClick={() => {
                                setUserActionTarget({
                                  userId: u.id,
                                  email: u.email,
                                  currentRole: u.role,
                                  isBanned: u.is_banned,
                                });
                                setUserAction("demote");
                              }}
                              className="rounded p-0.5 text-amber-400 transition-colors hover:text-amber-300"
                              title="Demote"
                            >
                              <ArrowDownCircle size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ── Edit / Create dialog ──────────────────────────────────────────────── */}
      <Dialog
        open={editSection !== null}
        onOpenChange={(o) => {
          if (!o) closeDialog();
        }}
      >
        <DialogContent className={`max-w-sm ${dialogClass} ${textShadow}`}>
          <DialogHeader>
            <DialogTitle className={`${textColor} ${textShadow}`}>
              {editId !== null ? t("gameData.dialogEdit") : t("gameData.dialogNew")}{" "}
              {editSection ? sectionTitle(editSection) : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-1">
            <div className="flex flex-col gap-1">
              <label className={`text-[10px] ${subtextColor}`}>{t("gameData.dialogName")}</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                className={`rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
                autoFocus
              />
            </div>

            {isEditingItem && (
              <>
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] ${subtextColor}`}>
                    {t("gameData.dialogDescription")}
                  </label>
                  <input
                    type="text"
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] ${subtextColor}`}>
                    {t("gameData.dialogPrice")}
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className={`rounded-lg px-2.5 py-1.5 text-xs ${inputClass}`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] ${subtextColor}`}>
                    {t("gameData.dialogRarity")}
                  </label>
                  <StyledSelect
                    value={formRarityId}
                    options={["", ...rarities.map((r) => String(r.id))]}
                    onChange={setFormRarityId}
                    inputClass={`py-1.5 text-xs ${inputClass}`}
                    textColor={textColor}
                    bgClass={bgClass}
                    renderOption={(id) => {
                      if (!id)
                        return (
                          <span className="opacity-50">{t("gameData.dialogSelectRarity")}</span>
                        );
                      const r = rarities.find((x) => String(x.id) === id);
                      return r ? (
                        <>
                          <span
                            className="inline-block h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: RARITY_COLORS[r.name] ?? "#9ca3af" }}
                          />
                          {r.name}
                        </>
                      ) : (
                        id
                      );
                    }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] ${subtextColor}`}>
                    {t("gameData.dialogCategories")}
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {categories.map((c) => {
                      const active = formCategoryIds.includes(c.id);
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => toggleCatId(c.id)}
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
            )}
          </div>
          <DialogFooter className={footerClass}>
            <button
              type="button"
              onClick={closeDialog}
              className={`rounded-lg border border-current/20 px-3 py-1.5 text-xs ${subtextColor} hover:border-current/40`}
            >
              {t("gameData.dialogCancel")}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-lg bg-violet-500/20 px-3 py-1.5 text-xs font-medium text-violet-300 transition-colors hover:bg-violet-500/30"
            >
              {t("gameData.dialogSave")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ─────────────────────────────────────────────── */}
      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(o) => {
          if (!o) setDeleteTarget(null);
        }}
      >
        <DialogContent className={`max-w-sm ${dialogClass} ${textShadow}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${textColor} ${textShadow}`}>
              <Trash2 size={14} className="text-red-400" />
              {t("gameData.dialogDelete")} {deleteTarget ? sectionTitle(deleteTarget.section) : ""}
            </DialogTitle>
            <DialogDescription className={`text-xs ${subtextColor}`}>
              {t("gameData.dialogDeleteDesc", {
                id: deleteTarget?.id ?? "",
                label: deleteTarget?.label ?? "",
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={footerClass}>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className={`rounded-lg border border-current/20 px-3 py-1.5 text-xs ${subtextColor} hover:border-current/40`}
            >
              {t("gameData.dialogCancel")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
            >
              {t("gameData.dialogDelete")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── User action dialog ────────────────────────────────────────────────── */}
      <Dialog
        open={userActionTarget !== null && userAction !== null}
        onOpenChange={(o) => {
          if (!o) {
            setUserActionTarget(null);
            setUserAction(null);
          }
        }}
      >
        <DialogContent className={`max-w-sm ${dialogClass} ${textShadow}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center gap-2 ${textColor} ${textShadow}`}>
              {userAction === "ban" && <ShieldBan size={14} className="text-red-400" />}
              {userAction === "unban" && <ShieldCheck size={14} className="text-green-400" />}
              {userAction === "promote" && <ArrowUpCircle size={14} className="text-violet-400" />}
              {userAction === "demote" && <ArrowDownCircle size={14} className="text-amber-400" />}
              {userAction === "ban" && t("gameData.banUser")}
              {userAction === "unban" && t("gameData.unbanUser")}
              {userAction === "promote" && t("gameData.promoteUser")}
              {userAction === "demote" && t("gameData.demoteUser")}
            </DialogTitle>
            <DialogDescription className={`text-xs ${subtextColor}`}>
              {userActionTarget?.email}
            </DialogDescription>
          </DialogHeader>

          {userAction === "ban" && (
            <div className="flex flex-col gap-3 py-1">
              <label className="flex items-center justify-between">
                <span className={`text-xs ${subtextColor}`}>{t("gameData.permanentBan")}</span>
                <button
                  type="button"
                  onClick={() => setIsPermanentBan((v) => !v)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${isPermanentBan ? "bg-red-500/40" : "bg-current/20"}`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${isPermanentBan ? "translate-x-4" : "translate-x-0.5"}`}
                  />
                </button>
              </label>
              {!isPermanentBan && (
                <div className="flex flex-col gap-1">
                  <label className={`text-[10px] ${subtextColor}`}>
                    {t("gameData.durationMinutes")}
                  </label>
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

          {userAction === "demote" && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 p-2.5">
              <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-400" />
              <p className="text-[10px] text-amber-300">
                {t("gameData.demoteWarning", {
                  email: userActionTarget?.email ?? "",
                  role: userActionTarget?.currentRole ?? "",
                })}
              </p>
            </div>
          )}

          <DialogFooter className={footerClass}>
            <button
              type="button"
              onClick={() => {
                setUserActionTarget(null);
                setUserAction(null);
              }}
              className={`rounded-lg border border-current/20 px-3 py-1.5 text-xs ${subtextColor} hover:border-current/40`}
            >
              {t("gameData.dialogCancel")}
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
              {t("gameData.confirm")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
