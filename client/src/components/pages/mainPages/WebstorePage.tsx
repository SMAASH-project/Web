import Navbar from "../../nav/Navbar";
import { Item } from "./webstorePageComponents/Item";
import { SearchItem } from "./webstorePageComponents/SearchItem";
import { ItemFilters } from "./webstorePageComponents/ItemFilters";
import { useItems } from "./webstorePageComponents/webstorePageLogic/useItems";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { LoadPost } from "@/lib/pageAnimations/newsPageAnimations/LoadPost";
import { ShoppingBag, Loader2 } from "lucide-react";

export function WebstorePage() {
  const { settings } = useSettings();
  const glass = settings.useLiquidGlass;

  const {
    visibleItems,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
    categories,
    rarities,
    selectedCategory,
    selectedRarity,
    handleSearch,
    handleCategoryChange,
    handleRarityChange,
  } = useItems();

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
                Browse and purchase in-game items
              </p>
            </div>
          </div>

          {/* Search bar */}
          <SearchItem onSearch={handleSearch} />

          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <ItemFilters
              label="Category"
              options={categories}
              selected={selectedCategory}
              onSelect={handleCategoryChange}
            />
            <ItemFilters
              label="Rarity"
              options={rarities}
              selected={selectedRarity}
              onSelect={handleRarityChange}
            />
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
                    <Item item={item} />
                  </LoadPost>
                ) : (
                  <div key={item.id}>
                    <Item item={item} />
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
