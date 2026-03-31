import { Loader2, Sword, Layers, ShoppingBag } from "lucide-react";
import {
  useDebugCharactersQuery,
  useDebugLevelsQuery,
  useDebugItemsQuery,
} from "@/hooks/useDebug";

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
  const { data: characters = [], isLoading: charsLoading } =
    useDebugCharactersQuery();
  const { data: levels = [], isLoading: levelsLoading } = useDebugLevelsQuery();
  const { data: items = [], isLoading: itemsLoading } = useDebugItemsQuery();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* Characters */}
      <div className={`rounded-xl p-3 flex flex-col gap-2 ${panelBg}`}>
        <div className={`flex items-center gap-1.5 ${subtextColor}`}>
          <Sword size={11} />
          <p className="text-[10px] font-semibold uppercase tracking-widest">
            Characters{" "}
            {!charsLoading && (
              <span className="opacity-50">({characters.length})</span>
            )}
          </p>
        </div>
        {charsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
          </div>
        ) : characters.length === 0 ? (
          <p className={`text-xs text-center py-3 opacity-40 ${subtextColor}`}>
            None
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {characters.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-2 rounded-lg p-1.5 bg-current/5"
              >
                <div className="w-7 h-7 rounded-full bg-current/10 overflow-hidden shrink-0">
                  <img
                    src={`/api/characters/${c.id}/img`}
                    alt={c.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${textColor}`}>
                    {c.name}
                  </p>
                  <p className={`text-[10px] font-mono ${subtextColor}`}>
                    #{c.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Levels */}
      <div className={`rounded-xl p-3 flex flex-col gap-2 ${panelBg}`}>
        <div className={`flex items-center gap-1.5 ${subtextColor}`}>
          <Layers size={11} />
          <p className="text-[10px] font-semibold uppercase tracking-widest">
            Levels{" "}
            {!levelsLoading && (
              <span className="opacity-50">({levels.length})</span>
            )}
          </p>
        </div>
        {levelsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
          </div>
        ) : levels.length === 0 ? (
          <p className={`text-xs text-center py-3 opacity-40 ${subtextColor}`}>
            None
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5">
            {levels.map((l) => (
              <div
                key={l.id}
                className="flex items-center gap-2 rounded-lg p-1.5 bg-current/5"
              >
                <div className="w-7 h-7 rounded-lg bg-current/10 overflow-hidden shrink-0">
                  <img
                    src={`/api/levels/${l.id}/img`}
                    alt={l.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-medium truncate ${textColor}`}>
                    {l.name}
                  </p>
                  <p className={`text-[10px] font-mono ${subtextColor}`}>
                    #{l.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Items — full width */}
      <div
        className={`rounded-xl p-3 flex flex-col gap-2 sm:col-span-2 ${panelBg}`}
      >
        <div className={`flex items-center gap-1.5 ${subtextColor}`}>
          <ShoppingBag size={11} />
          <p className="text-[10px] font-semibold uppercase tracking-widest">
            Store Items{" "}
            {!itemsLoading && (
              <span className="opacity-50">({items.length})</span>
            )}
          </p>
        </div>
        {itemsLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 size={14} className={`animate-spin ${subtextColor}`} />
          </div>
        ) : items.length === 0 ? (
          <p className={`text-xs text-center py-3 opacity-40 ${subtextColor}`}>
            None
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 bg-current/5"
              >
                <span
                  className={`text-[10px] font-mono ${subtextColor} shrink-0`}
                >
                  #{item.id}
                </span>
                <span
                  className={`flex-1 text-xs font-medium truncate ${textColor}`}
                >
                  {item.name}
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0"
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
