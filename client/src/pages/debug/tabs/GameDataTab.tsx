import { Loader2, Sword, Layers, ShoppingBag } from "lucide-react";
import { useDebugCharactersQuery, useDebugLevelsQuery, useDebugItemsQuery } from "@/hooks/useDebug";

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

export function GameDataTab({
  textColor,
  subtextColor,
  panelBg,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
}) {
  const { data: characters = [], isLoading: charsLoading } = useDebugCharactersQuery();
  const { data: levels = [], isLoading: levelsLoading } = useDebugLevelsQuery();
  const { data: items = [], isLoading: itemsLoading } = useDebugItemsQuery();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Characters */}
      <div className={`flex flex-col gap-2 rounded-xl p-3 ${panelBg}`}>
        <div className={`flex items-center gap-1.5 ${subtextColor}`}>
          <Sword size={11} />
          <p className="text-[10px] font-semibold tracking-widest uppercase">
            Characters {!charsLoading && <span className="opacity-50">({characters.length})</span>}
          </p>
        </div>
        {charsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
          </div>
        ) : characters.length === 0 ? (
          <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>None</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {characters.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg bg-current/5 p-1.5">
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
                <div className="min-w-0">
                  <p className={`truncate text-xs font-medium ${textColor}`}>{c.name}</p>
                  <p className={`font-mono text-[10px] ${subtextColor}`}>#{c.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Levels */}
      <div className={`flex flex-col gap-2 rounded-xl p-3 ${panelBg}`}>
        <div className={`flex items-center gap-1.5 ${subtextColor}`}>
          <Layers size={11} />
          <p className="text-[10px] font-semibold tracking-widest uppercase">
            Levels {!levelsLoading && <span className="opacity-50">({levels.length})</span>}
          </p>
        </div>
        {levelsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
          </div>
        ) : levels.length === 0 ? (
          <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>None</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {levels.map((l) => (
              <div key={l.id} className="flex items-center gap-2 rounded-lg bg-current/5 p-1.5">
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
                <div className="min-w-0">
                  <p className={`truncate text-xs font-medium ${textColor}`}>{l.name}</p>
                  <p className={`font-mono text-[10px] ${subtextColor}`}>#{l.id}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items — full width */}
      <div className={`flex flex-col gap-2 rounded-xl p-3 sm:col-span-2 ${panelBg}`}>
        <div className={`flex items-center gap-1.5 ${subtextColor}`}>
          <ShoppingBag size={11} />
          <p className="text-[10px] font-semibold tracking-widest uppercase">
            Store Items {!itemsLoading && <span className="opacity-50">({items.length})</span>}
          </p>
        </div>
        {itemsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
          </div>
        ) : items.length === 0 ? (
          <p className={`py-3 text-center text-xs opacity-40 ${subtextColor}`}>None</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg bg-current/5 px-2.5 py-1.5"
              >
                <span className={`font-mono text-[10px] ${subtextColor} shrink-0`}>#{item.id}</span>
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
