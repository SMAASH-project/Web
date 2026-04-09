import Navbar from "@/components/nav/Navbar";
import { Item } from "./components/Item";
import { SearchItem } from "./components/SearchItem";
import { ItemFilters } from "./components/ItemFilters";
import { useItems } from "./useItems";
import { CreateItemDialog } from "./components/CreateItemDialog";
import { useSettings } from "@/pages/settings/SettingsContext";
import { LoadPost } from "@/animations/LoadPost";
import { ShoppingBag, Loader2, Coins } from "lucide-react";
import { getTextColor, getTextShadow, getSubtextColor, getBackgroundClasses } from "@/lib/utils";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "@/context/AuthContext";
import { useProfiles } from "@/pages/profile-selector/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";

export function WebstorePage() {
  const { settings } = useSettings();
  const { isAdmin } = useContext(AuthContext);
  const { t } = useTranslation("webstore");
  const { selectedProfile } = useProfiles();

  // Coins come from the selected profile returned by GET /api/users/:id/profiles.
  // Falls back to 0 while the profile is loading or if none is selected.
  const userCoins = selectedProfile?.coins ?? 0;

  const {
    visibleItems,
    containerRef,
    sentinelRef,
    hasMore,
    isLoading,
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
    handleDeleteItem,
    isCreating,
    isDeleting,
    isPurchasing,
    createError,
    deleteError,
    purchaseError,
  } = useItems();

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(settings.useLiquidGlass, settings.useDarkMode);
  const subtextColor = getSubtextColor(settings.useLiquidGlass, settings.useDarkMode);
  const bgClass = getBackgroundClasses(settings.useLiquidGlass, settings.useDarkMode, "light");

  return (
    <div className="flex min-h-screen w-full flex-col self-start p-4">
      <Navbar />
      <div className="z-0 mx-auto mt-20 flex w-full max-w-6xl flex-col items-center justify-start gap-6 pb-8">
        {/* Header section */}
        <div className="flex w-full flex-col gap-5">
          {/* Title row */}
          <div className="flex w-full items-center justify-between">
            <div className="flex flex-col gap-1">
              <h1 className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}>
                {t("title")}
              </h1>
              <p className={`text-sm ${subtextColor}`}>{t("subtitle")}</p>
            </div>

            {/* Right side: coins display, admin create */}
            <div className="flex items-center gap-3">
              {/* Coins display */}
              <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 ${bgClass}`}>
                <Coins className="h-4 w-4 text-amber-400" />
                <span className={`text-sm font-bold text-amber-400 ${textShadow}`}>
                  {userCoins.toLocaleString()}
                </span>
              </div>

              {/* Admin: Create Item */}
              {isAdmin && <CreateItemDialog onCreate={handleCreateItem} isLoading={isCreating} />}
            </div>
          </div>

          {/* Error banners */}
          {(createError || deleteError || purchaseError) && (
            <div className="w-full rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {createError ?? deleteError ?? purchaseError}
            </div>
          )}

          {/* Search bar */}
          <SearchItem onSearch={handleSearch} />

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            <ItemFilters
              label={t("filters.rarity")}
              options={rarities}
              displayOptions={rarities.map((r) =>
                r === "All" ? t("filters.all") : t(`rarity.${r.toLowerCase()}`)
              )}
              selected={selectedRarity}
              onSelect={handleRarityChange}
            />
            <ItemFilters
              label={t("filters.combat")}
              options={combatTypes}
              displayOptions={combatTypes.map((c) =>
                c === "All" ? t("filters.all") : t(`filters.${c.toLowerCase()}`)
              )}
              selected={selectedCombatType}
              onSelect={handleCombatTypeChange}
            />
            <ItemFilters
              label={t("filters.ownership")}
              options={ownershipOptions}
              displayOptions={ownershipOptions.map((o) =>
                o === "All" ? t("filters.all") : t(`filters.${o.toLowerCase()}`)
              )}
              selected={selectedOwnership}
              onSelect={handleOwnershipChange}
            />
          </div>
        </div>

        {/* Item grid */}
        <div ref={containerRef} className="w-full">
          {isLoading && visibleItems.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className={`relative flex flex-col gap-3 overflow-hidden rounded-xl p-5 pt-4 ${bgClass}`}
                >
                  {/* accent bar */}
                  <Skeleton className="absolute top-0 right-0 left-0 h-1 rounded-none" />
                  {/* name + rarity badge */}
                  <div className="flex items-start justify-between gap-2 pt-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-14 rounded-full" />
                  </div>
                  {/* description lines */}
                  <div className="flex min-h-10 flex-col gap-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                  {/* footer */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-2">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  {/* button */}
                  <Skeleton className="h-7 w-full rounded-md" />
                </div>
              ))}
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="mt-16 flex flex-col items-center justify-center gap-3 opacity-60">
              <ShoppingBag className={`h-12 w-12 ${subtextColor}`} />
              <p className={`text-base ${subtextColor}`}>{t("noResults")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {visibleItems.map((item, index) =>
                settings.useAnimations ? (
                  <LoadPost key={item.id} index={index}>
                    <Item
                      item={item}
                      onDelete={isAdmin ? handleDeleteItem : undefined}
                      onUnlock={unlockItem}
                      isDeleting={isDeleting}
                      isPurchasing={isPurchasing}
                    />
                  </LoadPost>
                ) : (
                  <div key={item.id}>
                    <Item
                      item={item}
                      onDelete={isAdmin ? handleDeleteItem : undefined}
                      onUnlock={unlockItem}
                      isDeleting={isDeleting}
                      isPurchasing={isPurchasing}
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
              className="flex w-full shrink-0 items-center justify-center py-4"
            >
              {isLoading && <Loader2 className={`h-5 w-5 ${subtextColor} animate-spin`} />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
