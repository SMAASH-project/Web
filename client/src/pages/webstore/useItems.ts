import { useState, useEffect, useRef, useMemo, useCallback, useContext } from "react";
import { useTranslation } from "react-i18next";
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

interface ItemReadDTO {
  id: number;
  name: string;
  description: string;
  price: number;
  rarity: string;
  // Category names: "Character" + optionally "Melee" | "Ranged" (combatType)
  categories: string[];
  images: {
    full_img_uri: string;
    cropped_img_uri: string;
  };
}

// ─── Mapping helpers ──────────────────────────────────────────────────────────

function mapItemDTO(dto: ItemReadDTO): WebstoreItem {
  const combatType: WebstoreItem["combatType"] = dto.categories?.includes("Melee")
    ? "Melee"
    : dto.categories?.includes("Ranged")
      ? "Ranged"
      : undefined;

  return {
    id: String(dto.id),
    name: dto.name,
    description: dto.description,
    price: dto.price,
    rarity: dto.rarity as Rarity,
    kind: "Character",
    combatType,
    owned: false,
    createdAt: DateTime.now(),
    imgUri: dto.images?.full_img_uri ?? "",
  };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useItems() {
  const queryClient = useQueryClient();
  const { t } = useTranslation("webstore");
  const { selectedProfile } = useProfiles();
  const { userId } = useContext(AuthContext);
  const profileId = selectedProfile?.id ?? null;

  // ── Fetch all items ──────────────────────────────────────────────────────
  const { data: fetchedItems = [], isLoading: itemsLoading } = useQuery<WebstoreItem[]>({
    queryKey: queryKeys.characters.all,
    queryFn: async () => {
      const { data } = await apiClient.get<ItemReadDTO[]>("/characters");
      console.log("data: ", data);
      try {
        const result = data.map(mapItemDTO);
        console.log("mapped: ", result);
        return result;
      } catch (err) {
        console.error(err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Fetch owned characters for the selected profile ──────────────────────
  // Uses GET /profiles/:id/characters which reads the profile_character many2many
  // association — the authoritative ownership source (populated on purchase).
  // Previously this used GET /profiles/:id/purchases but that endpoint does not
  // preload the nested Character, so p.Character.Name was always "" and ownership
  // never matched any item.
  const { data: ownedCharacters = [] } = useQuery<ItemReadDTO[]>({
    queryKey: queryKeys.characters.ownedByProfileId(profileId ?? 0),
    queryFn: async () => {
      const { data } = await apiClient.get<ItemReadDTO[] | null>(
        `/profiles/${profileId}/characters`,
      );
      return data ?? [];
    },
    enabled: profileId !== null,
    staleTime: 2 * 60 * 1000,
  });

  // Build a set of owned character IDs
  const ownedIds = useMemo(() => new Set(ownedCharacters.map((c) => c.id)), [ownedCharacters]);

  console.log("fetched items: ", fetchedItems)

  // Merge ownership into items
  const allItems = useMemo(
    () =>
      fetchedItems.map((item) => ({
        ...item,
        owned: ownedIds.has(Number(item.id)),
      })),
    [fetchedItems, ownedIds],
  );

  // ── Unlock (purchase) mutation ───────────────────────────────────────────
  const purchaseMutation = useMutation<void, Error, { itemId: number }>({
    mutationFn: async ({ itemId }) => {
      if (!profileId) throw new Error("No profile selected");
      await apiClient.post("/purchases", {
        player_profile_id: profileId,
        character_id: itemId,
      });
    },
    onSuccess: () => {
      // Refetch owned characters so owned state updates immediately
      queryClient.invalidateQueries({
        queryKey: queryKeys.characters.ownedByProfileId(profileId ?? 0),
      });
      // Refetch profile so coin balance updates after purchase
      if (userId !== null) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.profiles.byUserId(Number(userId)),
        });
      }
      toast.success(t("toast.unlocked"));
    },
    onError: (err) => {
      const msg = (err as any)?.response?.data?.error ?? err?.message ?? "Purchase failed.";
      toast.error(msg);
    },
  });

  // ── Admin: create item mutation ──────────────────────────────────────────
  const createMutation = useMutation<
    { id: number },
    Error,
    {
      name: string;
      combatType?: string;
      rarity: string;
      description: string;
      price: number;
      imageFile?: File;
    }
  >({
    mutationFn: async (data) => {
      const { data: rarities } = await apiClient.get<{ id: number; name: string }[]>("/rarities");
      const rarity = rarities.find((r) => r.name === data.rarity);
      if (!rarity) throw new Error(`Rarity "${data.rarity}" not found`);

      const { data: allCategories } =
        await apiClient.get<{ id: number; name: string }[]>("/categories");

      const characterCat = allCategories.find((c) => c.name === "Character");
      if (!characterCat) throw new Error('Category "Character" not found');

      const combatCat = data.combatType
        ? allCategories.find((c) => c.name === data.combatType)
        : null;
      if (data.combatType && !combatCat) throw new Error(`Category "${data.combatType}" not found`);

      const categoryIds = [characterCat.id, ...(combatCat ? [combatCat.id] : [])];

      const { data: created } = await apiClient.post<{ id: number }>("/characters", {
        name: data.name,
        description: data.description,
        price: data.price,
        rarity_id: rarity.id,
        category_ids: categoryIds,
      });

      await apiClient.put(`/characters/${created.id}`, {
        id: created.id,
        name: data.name,
        description: data.description,
        price: data.price,
        rarity_id: rarity.id,
        category_ids: categoryIds,
      });

      if (data.imageFile) {
        const form = new FormData();
        form.append("CharacterImage", data.imageFile);
        await apiClient.post(`/characters/${created.id}/img`, form);
      }

      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
      toast.success(t("toast.created"));
    },
    onError: (err) => {
      const msg = (err as any)?.response?.data?.error ?? err?.message ?? "Failed to create item.";
      toast.error(msg);
    },
  });

  // ── Admin: update item mutation ──────────────────────────────────────────
  const updateMutation = useMutation<
    void,
    Error,
    {
      id: number;
      name: string;
      combatType?: string;
      rarity: string;
      description: string;
      price: number;
      imageFile?: File;
    }
  >({
    mutationFn: async (data) => {
      const { data: rarities } = await apiClient.get<{ id: number; name: string }[]>("/rarities");
      const rarity = rarities.find((r) => r.name === data.rarity);
      if (!rarity) throw new Error(`Rarity "${data.rarity}" not found`);

      const { data: allCategories } =
        await apiClient.get<{ id: number; name: string }[]>("/categories");

      const characterCat = allCategories.find((c) => c.name === "Character");
      if (!characterCat) throw new Error('Category "Character" not found');

      const combatCat = data.combatType
        ? allCategories.find((c) => c.name === data.combatType)
        : null;
      if (data.combatType && !combatCat) throw new Error(`Category "${data.combatType}" not found`);

      const categoryIds = [characterCat.id, ...(combatCat ? [combatCat.id] : [])];

      await apiClient.put(`/characters/${data.id}`, {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        rarity_id: rarity.id,
        category_ids: categoryIds,
      });

      if (data.imageFile) {
        const form = new FormData();
        form.append("CharacterImage", data.imageFile);
        await apiClient.post(`/characters/${data.id}/img`, form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
      toast.success(t("toast.updated"));
    },
    onError: (err) => {
      const msg = (err as any)?.response?.data?.error ?? err?.message ?? "Failed to update item.";
      toast.error(msg);
    },
  });

  // ── Admin: delete item mutation ──────────────────────────────────────────
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (itemId) => {
      await apiClient.delete(`/characters/${itemId}`);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.characters.all });
      const previousItems = queryClient.getQueryData<WebstoreItem[]>(queryKeys.characters.all);
      queryClient.setQueryData<WebstoreItem[]>(queryKeys.characters.all, (old) =>
        (old ?? []).filter((item) => item.id !== itemId),
      );
      return { previousItems };
    },
    onError: (_err, _itemId, context) => {
      const ctx = context as { previousItems?: WebstoreItem[] } | undefined;
      if (ctx?.previousItems !== undefined) {
        queryClient.setQueryData(queryKeys.characters.all, ctx.previousItems);
      }
      toast.error(t("toast.deleteFailed"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.characters.all });
      toast.success(t("toast.deleted"));
    },
  });

  // ── Pagination / infinite scroll ─────────────────────────────────────────
  const containerRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRarity, setSelectedRarity] = useState("All");
  const [selectedCombatType, setSelectedCombatType] = useState("All");
  const [selectedOwnership, setSelectedOwnership] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rarities: string[] = ["All", "Common", "Uncommon", "Rare", "Epic", "Legendary"];
  const combatTypes: string[] = ["All", "Melee", "Ranged"];
  const ownershipOptions: string[] = ["All", "Owned", "Unowned"];

  console.log("all items: ", allItems);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesRarity = selectedRarity === "All" || item.rarity === selectedRarity;
      const matchesCombatType =
        selectedCombatType === "All" || item.combatType === selectedCombatType;
      const matchesOwnership =
        selectedOwnership === "All" ||
        (selectedOwnership === "Owned" && item.owned) ||
        (selectedOwnership === "Unowned" && !item.owned);
      return matchesRarity && matchesCombatType && matchesOwnership;
    });
  }, [allItems, selectedRarity, selectedCombatType, selectedOwnership]);

  console.log("filetered items: ", filteredItems);

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

  console.log("visible items: ", visibleItems);

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

  function handleRarityChange(rarity: string) {
    setSelectedRarity(rarity);
    setPage(1);
  }
  function handleCombatTypeChange(combatType: string) {
    setSelectedCombatType(combatType);
    setPage(1);
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
    combatType?: string;
    rarity: string;
    description: string;
    price: number;
    imageFile?: File;
  }) {
    createMutation.mutate(data);
  }

  function handleUpdateItem(
    id: string,
    data: {
      name: string;
      combatType?: string;
      rarity: string;
      description: string;
      price: number;
      imageFile?: File;
    },
  ) {
    updateMutation.mutate({ id: Number(id), ...data });
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
    rarities,
    combatTypes,
    ownershipOptions,
    selectedRarity,
    selectedCombatType,
    selectedOwnership,
    handleSearch,
    handleRarityChange,
    handleCombatTypeChange,
    handleOwnershipChange,
    unlockItem,
    handleCreateItem,
    handleUpdateItem,
    handleDeleteItem,
    // Mutation states for UI feedback
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isPurchasing: purchaseMutation.isPending,
    createError:
      (createMutation.error as any)?.response?.data?.error ?? createMutation.error?.message ?? null,
    updateError:
      (updateMutation.error as any)?.response?.data?.error ?? updateMutation.error?.message ?? null,
    deleteError:
      (deleteMutation.error as any)?.response?.data?.error ?? deleteMutation.error?.message ?? null,
    purchaseError:
      (purchaseMutation.error as any)?.response?.data?.error ??
      purchaseMutation.error?.message ??
      null,
  };
}
