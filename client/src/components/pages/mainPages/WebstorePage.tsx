import Navbar from "../../nav/Navbar";
import { Item } from "./webstorePageComponents/Item";
import { SearchItem } from "./webstorePageComponents/SearchItem";
import { ItemFilters } from "./webstorePageComponents/ItemFilters";
import { useItems } from "./webstorePageComponents/webstorePageLogic/useItems";
import { CreateItemDialog } from "./webstorePageComponents/CreateItemDialog";
import { useSettings } from "../profileDependents/settings/settingsLogic/SettingsContext";
import { LoadPost } from "@/lib/pageAnimations/newsPageAnimations/LoadPost";
import { ShoppingBag, Loader2, Coins } from "lucide-react";
import {
  getTextColor,
  getTextShadow,
  getSubtextColor,
  getBackgroundClasses,
} from "@/lib/utils";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { AuthContext } from "@/context/AuthContext";
import { useProfiles } from "@/components/forms/addNewProfile/useProfiles";

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
    isCreating,
    isDeleting,
    isPurchasing,
    createError,
    deleteError,
    purchaseError,
  } = useItems();

  const textColor = getTextColor(settings.useLiquidGlass, settings.useDarkMode);
  const textShadow = getTextShadow(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const subtextColor = getSubtextColor(
    settings.useLiquidGlass,
    settings.useDarkMode,
  );
  const bgClass = getBackgroundClasses(
    settings.useLiquidGlass,
    settings.useDarkMode,
    "light",
  );

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
                className={`text-2xl font-bold ${textColor} tracking-tight ${textShadow}`}
              >
                Webstore
              </h1>
              <p className={`text-sm ${subtextColor}`}>
                Unlock characters and skins
              </p>
            </div>

            {/* Right side: coins display, admin create */}
            <div className="flex items-center gap-3">
              {/* Coins display */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${bgClass}`}
              >
                <Coins className="w-4 h-4 text-amber-400" />
                <span
                  className={`text-sm font-bold text-amber-400 ${textShadow}`}
                >
                  {userCoins.toLocaleString()}
                </span>
              </div>

              {/* Admin: Create Item */}
              {isAdmin && (
                <CreateItemDialog
                  onCreate={handleCreateItem}
                  isLoading={isCreating}
                />
              )}
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
          <div className="flex flex-wrap gap-4 justify-center">
            <ItemFilters
              label={t("filters.type")}
              options={kinds}
              selected={selectedKind}
              onSelect={handleKindChange}
            />
            <ItemFilters
              label={t("filters.rarity")}
              options={rarities}
              selected={selectedRarity}
              onSelect={handleRarityChange}
            />
            {showCombatTypeFilter && (
              <ItemFilters
                label={t("filters.combat")}
                options={combatTypes}
                selected={selectedCombatType}
                onSelect={handleCombatTypeChange}
              />
            )}
            {showOwnershipFilter && (
              <ItemFilters
                label={t("filters.ownership")}
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
              <ShoppingBag className={`w-12 h-12 ${subtextColor}`} />
              <p className={`text-base ${subtextColor}`}>{t("noResults")}</p>
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
              className="flex items-center justify-center py-4 w-full shrink-0"
            >
              {isLoading && (
                <Loader2 className={`w-5 h-5 ${subtextColor} animate-spin`} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
