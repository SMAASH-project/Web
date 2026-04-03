import { useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DateTime } from "luxon";
import apiClient from "@/lib/apiClient";
import { queryKeys } from "@/lib/queryKeys";
import type { WebstoreItem } from "@/types/PageTypes";
import type { Rarity } from "@/types/PageTypes";
import { useProfiles } from "@/pages/profile-selector/useProfiles";
import { AuthContext } from "@/context/AuthContext";
import { toast } from "@/lib/toast";

const PAGE_SIZE = 12;
const LOAD_DELAY_MS = 400;

// ─── Backend DTOs ─────────────────────────────────────────────────────────────
// NOTE: ItemReadDTO and PurchaseReadDTO are not yet included in the backend Swagger spec.
// Once backend updates swagger.json to include these endpoints, import from @/lib/api.generated
// with types: DtosItemReadDTO, DtosPurchaseReadDTO

interface ItemReadDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  rarity: string;
  // Category names encode kind + combat type:
  //   "Character" | "Skin"    → kind
  //   "Melee"     | "Ranged"  → combatType (only when kind is Character)
  categories: string[];
}

// Go's PurchaseReadDTO json tags are snake_case
interface PurchaseReadDTO {
  id: number;
  item: string; // item name (unique, used to match ownership)
  count: number;
  total: number;
  profile: string;
  date: string;
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function itemDTOToWebstoreItem(dto: ItemReadDTO): WebstoreItem {
  const kind: WebstoreItem["kind"] = dto.categories.includes("Character") ? "Character" : "Skin";

  const combatType: WebstoreItem["combatType"] = dto.categories.includes("Melee")
    ? "Melee"
    : dto.categories.includes("Ranged")
      ? "Ranged"
      : undefined;

  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description,
    price: dto.price,
    rarity: dto.rarity as Rarity,
    kind,
    combatType,
    owned: false, // will be overridden via ownedNames merge below
    createdAt: DateTime.now(),
  };
}

/**
 * Returns today's date as YYYY-MM-DD.
 * The backend's PurchaseCreateDTO.Date field parses with Go's "2006-01-02" layout.
 */
function nowDateString(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useItems() {
  const queryClient = useQueryClient();
  const { selectedProfile } = useProfiles();
  const { userId } = useContext(AuthContext);
  const profileId = selectedProfile?.id ?? null;

  // ── Fetch all items ──────────────────────────────────────────────────────
  const { data: fetchedItems = [], isLoading: itemsLoading } = useQuery<WebstoreItem[]>({
    queryKey: queryKeys.items.all,
    queryFn: async () => {
      const { data } = await apiClient.get<ItemReadDTO[]>("/items", {
        params: { page: 1, page_size: 100 },
      });
      return data.map(itemDTOToWebstoreItem);
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch purchases for the selected profile ─────────────────────────────
  const { data: purchases = [] } = useQuery<PurchaseReadDTO[]>({
    queryKey: queryKeys.purchases.byProfileId(profileId ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<PurchaseReadDTO[] | null>(
        `/profiles/${profileId}/purchases`,
      );
      // Backend may return null instead of [] when there are no purchases
      return data ?? [];
    },
    enabled: profileId !== null,
    staleTime: 2 * 60 * 1000,
  });

  // Build a set of owned item names from purchase history
  const ownedNames = useMemo(() => new Set((purchases ?? []).map((p) => p.item)), [purchases]);

  // Merge ownership into items
  const allItems = useMemo(
    () =>
      fetchedItems.map((item) => ({
        ...item,
        owned: ownedNames.has(item.name),
      })),
    [fetchedItems, ownedNames],
  );

  // ── Unlock (purchase) mutation ───────────────────────────────────────────
  const purchaseMutation = useMutation<void, Error, { itemId: number }>({
    mutationFn: async ({ itemId }) => {
      if (!profileId) throw new Error("No profile selected");
      await apiClient.post("/purchases", {
        player_profile_id: profileId,
        item_id: itemId,
        count: 1,
        date: nowDateString(),
      });
    },
    onSuccess: () => {
      // Refetch purchases so owned state updates immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.purchases.byProfileId(profileId ?? 0),
      });
      // Refetch profile so coin balance updates after purchase
      if (userId !== null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.byUserId(Number(userId)),
        });
      }
      toast.success("Item unlocked!");
    },
    onError: (err) => {
      const msg = (err as any)?.response?.data?.error ?? err?.message ?? "Purchase failed.";
      toast.error(msg);
    },
  });

  // ── Admin: create item mutation ──────────────────────────────────────────
  const createMutation = useMutation<
    void,
    Error,
    {
      name: string;
      kind: string;
      combatType?: string;
      rarity: string;
      description: string;
      price: number;
    }
  >({
    mutationFn: async (data) => {
      const categories: string[] = [data.kind];
      if (data.kind === "Character" && data.combatType) {
        categories.push(data.combatType);
      }
      await apiClient.post("/items", {
        name: data.name,
        description: data.description,
        price: data.price,
        rarity: data.rarity,
        categories,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      toast.success("Item created.");
    },
    onError: (err) => {
      const msg = (err as any)?.response?.data?.error ?? err?.message ?? "Failed to create item.";
      toast.error(msg);
    },
  });

  // ── Admin: delete item mutation ──────────────────────────────────────────
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await apiClient.delete(`/items/${itemId}`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items.all });
      const previousItems = queryClient.getQueryData<WebstoreItem[]>(queryKeys.items.all);
      queryClient.setQueryData<WebstoreItem[]>(queryKeys.items.all, (old) =>
        (old ?? []).filter((item) => item.id !== itemId),
      );
      return { previousItems };
    },
    onError: (_err, _itemId, context) => {
      const ctx = context as { previousItems?: WebstoreItem[] } | undefined;
      if (ctx?.previousItems !== undefined) {
        queryClient.setQueryData(queryKeys.items.all, ctx.previousItems);
      }
      toast.error("Failed to delete item.");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items.all });
      toast.success("Item deleted.");
    },
  });

  // ── Pagination / infinite scroll ─────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKind, setSelectedKind] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [selectedCombatType, setSelectedCombatType] = useState("All");
  const [selectedOwnership, setSelectedOwnership] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const kinds: string[] = ["All", "Character", "Skin"];
  const rarities: string[] = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
  const combatTypes: string[] = ["All", "Melee", "Ranged"];
  const ownershipOptions: string[] = ["All", "Owned", "Unowned"];

  const showOwnershipFilter = true;
  const showCombatTypeFilter = selectedKind !== "Skin";

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesKind = selectedKind === "All" || item.kind === selectedKind;
      const matchesRarity = selectedRarity === "All" || item.rarity === selectedRarity;
      const matchesCombatType =
        selectedCombatType === "All" ||
        item.kind !== "Character" ||
        item.combatType === selectedCombatType;
      const matchesOwnership =
        selectedOwnership === "All" ||
        (selectedOwnership === "Owned" && item.owned) ||
        (selectedOwnership === "Unowned" && !item.owned);
      return matchesKind && matchesRarity && matchesCombatType && matchesOwnership;
    });
  }, [allItems, selectedKind, selectedRarity, selectedCombatType, selectedOwnership]);

  const hasMore = useMemo(() => {
    if (searchQuery) return false;
    return page * PAGE_SIZE < filteredItems.length;
  }, [searchQuery, page, filteredItems.length]);

  const visibleItems = useMemo(() => {
    let items = filteredItems;
    if (searchQuery) {
      items = items.filter((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return items;
    }
    return items.slice(0, page * PAGE_SIZE);
  }, [filteredItems, page, searchQuery]);

  const loadMore = useCallback(() => {
    if (searchQuery || isLoading) return;
    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    setIsLoading(true);
    loadTimerRef.current = setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
      loadTimerRef.current = null;
    }, LOAD_DELAY_MS);
  }, [searchQuery, isLoading]);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root: null, rootMargin: "0px 0px 200px 0px", threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, visibleItems.length]);

  // ── Filter handlers ───────────────────────────────────────────────────────

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  function handleKindChange(kind: string) {
    setSelectedKind(kind);
    setPage(1);
    if (kind === "Skin" || kind === "All") {
      setSelectedCombatType("All");
    }
  }

  function handleRarityChange(rarity: string) {
    setSelectedRarity(rarity);
    setPage(1);
  }
  function handleCombatTypeChange(combatType: string) {
    setSelectedCombatType(combatType);
    setPage(1);
    if (combatType !== "All") {
      setSelectedKind("Character");
    }
  }
  function handleOwnershipChange(ownership: string) {
    setSelectedOwnership(ownership);
    setPage(1);
  }

  // ── Action handlers ───────────────────────────────────────────────────────

  function unlockItem(itemId: string) {
    purchaseMutation.mutate({ itemId: Number(itemId) });
  }

  function handleCreateItem(data: {
    name: string;
    kind: string;
    combatType?: string;
    rarity: string;
    description: string;
    price: number;
  }) {
    createMutation.mutate(data);
  }

  function handleDeleteItem(itemId: string) {
    deleteMutation.mutate(itemId);
  }

  return {
    allItems,
    visibleItems,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading: itemsLoading || isLoading,
    kinds,
    rarities,
    combatTypes,
    ownershipOptions,
    selectedKind,
    selectedRarity,
    selectedCombatType,
    selectedOwnership,
    showOwnershipFilter,
    showCombatTypeFilter,
    handleSearch,
    handleKindChange,
    handleRarityChange,
    handleCombatTypeChange,
    handleOwnershipChange,
    unlockItem,
    handleCreateItem,
    handleDeleteItem,
    // Mutation states for UI feedback
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPurchasing: purchaseMutation.isPending,
    createError:
      (createMutation.error as any)?.response?.data?.error ?? createMutation.error?.message ?? null,
    deleteError:
      (deleteMutation.error as any)?.response?.data?.error ?? deleteMutation.error?.message ?? null,
    purchaseError:
      (purchaseMutation.error as any)?.response?.data?.error ??
      purchaseMutation.error?.message ??
      null,
  };
}
