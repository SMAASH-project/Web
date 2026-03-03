import Navbar from "../../nav/Navbar";
import { Item } from "./webstorePageComponents/Item";
import { SearchItem } from "./webstorePageComponents/SearchItem";
import { ItemFilters } from "./webstorePageComponents/ItemFilters";
import { useItems } from "./webstorePageComponents/webstorePageLogic/useItems";
import { CreateItemDialog } from "./webstorePageComponents/CreateItemDialog";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { LoadPost } from "@/lib/pageAnimations/newsPageAnimations/LoadPost";
import { ShoppingBag, Loader2, Coins } from "lucide-react";

export function WebstorePage() {
  const { settings } = useSettings();
  const isAdmin = true;
  const glass = settings.useLiquidGlass;
  const userCoins = 5000; // Replace with actual coin balance from API

  const {
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
  } = useItems();

  const handleCreateItem = (data: {
    name: string;
    kind: "Character" | "Skin";
    combatType?: "Melee" | "Ranged";
    rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
    description: string;
    price: number;
  }) => {
    // TODO: wire to API
    console.log("Create item:", data);
  };

  const handleDeleteItem = (id: string) => {
    // TODO: wire to API
    console.log("Delete item:", id);
  };

  return (
    <div className="p-4 min-h-screen w-full self-start flex flex-col">
      <Navbar />
      <div className="mt-20 z-0 flex flex-col items-center justify-start gap-6 w-full max-w-6xl mx-auto pb-8">
        {/* Header section */}
        <div className="flex flex-col gap-5 w-full">
          {/* Title row */}
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col gap-1">
              <h1
                className={`text-2xl font-bold text-white tracking-tight ${
                  glass ? "[text-shadow:0_2px_8px_rgba(163,163,163,0.5)]" : ""
                }`}
              >
                Webstore
              </h1>
              <p
                className={`text-sm text-white/60 ${
                  glass ? "[text-shadow:0_1px_3px_rgba(163,163,163,0.3)]" : ""
                }`}
              >
                Unlock characters and skins
              </p>
            </div>

            {/* Right side: coins display, admin create */}
            <div className="flex items-center gap-3">
              {/* Coins display */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                  glass
                    ? "bg-white/10 border-white/15 backdrop-blur-lg"
                    : "bg-gray-800/80 border-gray-700"
                }`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span
                  className={`text-sm font-bold ${
                    glass
                      ? "text-white [text-shadow:0_1px_3px_rgba(163,163,163,0.3)]"
                      : "text-amber-400"
                  }`}
                >
                  {userCoins.toLocaleString()}
                </span>
              </div>

              {/* Admin: Create Item */}
              {isAdmin && <CreateItemDialog onCreate={handleCreateItem} />}
            </div>
          </div>

          {/* Search bar */}
          <SearchItem onSearch={handleSearch} />

          {/* Filters */}
          <div className="flex flex-wrap gap-4 justify-center">
            <ItemFilters
              label="Type"
              options={kinds}
              selected={selectedKind}
              onSelect={handleKindChange}
            />
            <ItemFilters
              label="Rarity"
              options={rarities}
              selected={selectedRarity}
              onSelect={handleRarityChange}
            />
            {showCombatTypeFilter && (
              <ItemFilters
                label="Combat"
                options={combatTypes}
                selected={selectedCombatType}
                onSelect={handleCombatTypeChange}
              />
            )}
            {showOwnershipFilter && (
              <ItemFilters
                label="Ownership"
                options={ownershipOptions}
                selected={selectedOwnership}
                onSelect={handleOwnershipChange}
              />
            )}
          </div>
        </div>

        {/* Item grid */}
        <div ref={containerRef} className="w-full">
          {visibleItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 mt-16 opacity-60">
              <ShoppingBag className="w-12 h-12 text-white/40" />
              <p
                className={`text-white/60 text-base ${
                  glass ? "[text-shadow:0_1px_3px_rgba(163,163,163,0.3)]" : ""
                }`}
              >
                No items found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleItems.map((item, index) =>
                settings.useAnimations ? (
                  <LoadPost key={item.id} index={index}>
                    <Item
                      item={item}
                      onDelete={isAdmin ? handleDeleteItem : undefined}
                      onUnlock={unlockItem}
                    />
                  </LoadPost>
                ) : (
                  <div key={item.id}>
                    <Item
                      item={item}
                      onDelete={isAdmin ? handleDeleteItem : undefined}
                      onUnlock={unlockItem}
                    />
                  </div>
                ),
              )}
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          {hasMore && (
            <div
              ref={sentinelRef}
              className="flex items-center justify-center py-4 w-full shrink-0"
            >
              {isLoading && (
                <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
