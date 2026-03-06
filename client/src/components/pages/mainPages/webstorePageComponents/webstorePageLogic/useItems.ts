import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { exampleItems } from "@/types/ExampleItems";
import type { WebstoreItem } from "@/types/PageTypes";

const PAGE_SIZE = 12;
const LOAD_DELAY_MS = 400;

export function useItems() {
  const [allItems, setAllItems] = useState<WebstoreItem[]>(exampleItems);
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

  const rarities: string[] = [
    "All",
    "Common",
    "Uncommon",
    "Rare",
    "Epic",
    "Legendary",
  ];

  const combatTypes: string[] = ["All", "Melee", "Ranged"];

  const ownershipOptions: string[] = ["All", "Owned", "Unowned"];

  // Only show ownership filter when characters are selected (or All with some characters visible)
  const showOwnershipFilter = selectedKind !== "Skin";

  // Only show combat type filter when characters are visible
  const showCombatTypeFilter = selectedKind !== "Skin";

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchesKind = selectedKind === "All" || item.kind === selectedKind;
      const matchesRarity =
        selectedRarity === "All" || item.rarity === selectedRarity;
      const matchesCombatType =
        selectedCombatType === "All" ||
        item.kind !== "Character" ||
        item.combatType === selectedCombatType;
      const matchesOwnership =
        selectedOwnership === "All" ||
        (selectedOwnership === "Owned" && item.owned) ||
        (selectedOwnership === "Unowned" && !item.owned);
      return (
        matchesKind && matchesRarity && matchesCombatType && matchesOwnership
      );
    });
  }, [
    allItems,
    selectedKind,
    selectedRarity,
    selectedCombatType,
    selectedOwnership,
  ]);

  const hasMore = useMemo(() => {
    if (searchQuery) return false;
    return page * PAGE_SIZE < filteredItems.length;
  }, [searchQuery, page, filteredItems.length]);

  const visibleItems = useMemo(() => {
    let items = filteredItems;
    if (searchQuery) {
      items = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      return items;
    }
    return items.slice(0, page * PAGE_SIZE);
  }, [filteredItems, page, searchQuery]);

  const loadMore = useCallback(() => {
    if (searchQuery || isLoading) return;

    if (loadTimerRef.current) {
      clearTimeout(loadTimerRef.current);
    }

    setIsLoading(true);

    loadTimerRef.current = setTimeout(() => {
      setPage((prev) => prev + 1);
      setIsLoading(false);
      loadTimerRef.current = null;
    }, LOAD_DELAY_MS);
  }, [searchQuery, isLoading]);

  useEffect(() => {
    return () => {
      if (loadTimerRef.current) {
        clearTimeout(loadTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoading, visibleItems.length]);

  function handleSearch(query: string) {
    setSearchQuery(query);
    setPage(1);
  }

  function handleKindChange(kind: string) {
    setSelectedKind(kind);
    setPage(1);
    // Reset combat type and ownership when switching to Skin
    if (kind === "Skin") {
      setSelectedCombatType("All");
      setSelectedOwnership("All");
    }
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

  function unlockItem(id: string) {
    setAllItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, owned: true } : item)),
    );
  }

  return {
    allItems,
    visibleItems,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
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
  };
}
