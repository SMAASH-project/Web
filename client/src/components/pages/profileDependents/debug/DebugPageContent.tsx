import { useContext, useState, useMemo } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Monitor,
  Database,
  Terminal,
  Gamepad2,
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Send,
  Trash2,
  ChevronDown,
  ChevronRight,
  Sword,
  Layers,
  ShoppingBag,
  Bug,
} from "lucide-react";
import { useSettings } from "@/components/pages/profileDependents/settings/settingsLogic/SettingsContext";
import {
  getBackgroundClasses,
  getTextColor,
  getSubtextColor,
  getTextShadow,
  getInputClasses,
  sectionStyle,
} from "@/lib/utils";
import {
  useDebugCharactersQuery,
  useDebugLevelsQuery,
  useDebugItemsQuery,
} from "@/hooks/useDebugHooks";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/AuthContext";
import apiClient from "@/lib/apiClient";

// ─── Tab definition ───────────────────────────────────────────────────────────

type Tab = "system" | "cache" | "endpoints" | "game";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "system", label: "System", icon: <Monitor size={14} /> },
  { id: "cache", label: "Cache", icon: <Database size={14} /> },
  { id: "endpoints", label: "Endpoints", icon: <Terminal size={14} /> },
  { id: "game", label: "Game Data", icon: <Gamepad2 size={14} /> },
];

// ─── Shared row ───────────────────────────────────────────────────────────────

function InfoRow({
  label,
  value,
  mono = false,
  textColor,
  subtextColor,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
  textColor: string;
  subtextColor: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5 border-b border-current/5 last:border-0">
      <span className={`text-xs shrink-0 ${subtextColor}`}>{label}</span>
      <span
        className={`text-xs text-right ${mono ? "font-mono" : ""} ${textColor}`}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function Section({
  title,
  icon,
  children,
  panelBg,
  subtextColor,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  panelBg: string;
  subtextColor: string;
}) {
  return (
    <div className={`rounded-xl p-3 flex flex-col gap-0.5 ${panelBg}`}>
      <div className={`flex items-center gap-1.5 mb-2 ${subtextColor}`}>
        {icon}
        <p className="text-[10px] font-semibold uppercase tracking-widest">
          {title}
        </p>
      </div>
      {children}
    </div>
  );
}

// ─── System tab ───────────────────────────────────────────────────────────────

function SystemTab({
  textColor,
  subtextColor,
  panelBg,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
}) {
  const { isAdmin, isSupport, userId } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const cacheSize = queryClient.getQueryCache().getAll().length;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string };
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };
  const role = isAdmin ? "admin" : isSupport ? "support" : "user";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 auto-rows-min">
      <Section
        title="Browser"
        icon={<Monitor size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="User Agent"
          value={
            <span className="max-w-48 truncate block">
              {navigator.userAgent.split(")")[0] + ")"}
            </span>
          }
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Language"
          value={navigator.language}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Online"
          value={
            navigator.onLine ? (
              <span className="flex items-center gap-1 text-green-400">
                <Wifi size={10} /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-red-400">
                <WifiOff size={10} /> Offline
              </span>
            )
          }
          textColor={textColor}
          subtextColor={subtextColor}
        />
        {nav.connection?.effectiveType && (
          <InfoRow
            label="Connection"
            value={nav.connection.effectiveType}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
        {nav.deviceMemory !== undefined && (
          <InfoRow
            label="Device Memory"
            value={`${nav.deviceMemory} GB`}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
        {nav.hardwareConcurrency !== undefined && (
          <InfoRow
            label="CPU Threads"
            value={String(nav.hardwareConcurrency)}
            mono
            textColor={textColor}
            subtextColor={subtextColor}
          />
        )}
      </Section>

      <Section
        title="Display"
        icon={<Monitor size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="Viewport"
          value={`${window.innerWidth} × ${window.innerHeight}`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Screen"
          value={`${window.screen.width} × ${window.screen.height}`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Pixel Ratio"
          value={`${window.devicePixelRatio}x`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Color Depth"
          value={`${window.screen.colorDepth}-bit`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>

      <Section
        title="Session"
        icon={<Database size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="Role"
          value={role}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="User ID"
          value={userId !== null ? `#${userId}` : "—"}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Query Cache"
          value={`${cacheSize} entries`}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Timezone"
          value={Intl.DateTimeFormat().resolvedOptions().timeZone}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Local Time"
          value={new Date().toLocaleTimeString()}
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>

      <Section
        title="Environment"
        icon={<Bug size={11} />}
        panelBg={panelBg}
        subtextColor={subtextColor}
      >
        <InfoRow
          label="Base URL"
          value={window.location.origin}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Path"
          value={window.location.pathname}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Build Mode"
          value={import.meta.env.MODE}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <InfoRow
          label="Dev Server"
          value={import.meta.env.DEV ? "Yes" : "No"}
          mono
          textColor={textColor}
          subtextColor={subtextColor}
        />
      </Section>
    </div>
  );
}

// ─── Cache tab ────────────────────────────────────────────────────────────────

function CacheTab({
  textColor,
  subtextColor,
  panelBg,
  inputClass,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
  inputClass: string;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState("");
  const [, forceUpdate] = useState(0);

  const queries = queryClient.getQueryCache().getAll();
  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q
      ? queries.filter((qr) =>
          JSON.stringify(qr.queryKey).toLowerCase().includes(q),
        )
      : queries;
  }, [queries, filter]);

  const toggle = (key: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const statusIcon = (s: string) =>
    s === "success" ? (
      <CheckCircle2 size={10} className="text-green-400 shrink-0" />
    ) : s === "error" ? (
      <XCircle size={10} className="text-red-400 shrink-0" />
    ) : s === "pending" ? (
      <Loader2 size={10} className="animate-spin text-amber-400 shrink-0" />
    ) : null;

  const fmtAge = (ts: number) => {
    if (!ts) return "never";
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`flex-1 text-xs px-3 py-1.5 rounded-lg ${inputClass}`}
        />
        <button
          onClick={() => {
            queryClient.invalidateQueries();
            forceUpdate((n) => n + 1);
          }}
          className={`text-[10px] px-2.5 py-1.5 rounded-lg border border-current/20 ${subtextColor} hover:border-current/40 flex items-center gap-1`}
        >
          <Trash2 size={10} /> Clear
        </button>
        <button
          onClick={() => forceUpdate((n) => n + 1)}
          className={`text-[10px] px-2.5 py-1.5 rounded-lg border border-current/20 ${subtextColor} hover:border-current/40`}
        >
          <RefreshCw size={10} />
        </button>
      </div>
      <div className={`rounded-xl overflow-auto flex-1 ${panelBg}`}>
        {filtered.length === 0 ? (
          <p className={`text-xs text-center py-8 ${subtextColor}`}>
            No cache entries
          </p>
        ) : (
          <div className="divide-y divide-current/5">
            {filtered.map((query) => {
              const keyStr = JSON.stringify(query.queryKey);
              const isOpen = expanded.has(keyStr);
              const state = query.state;
              const dataStr =
                state.data !== undefined
                  ? JSON.stringify(state.data, null, 2)
                  : null;
              return (
                <div key={keyStr}>
                  <button
                    type="button"
                    onClick={() => toggle(keyStr)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-current/5"
                  >
                    {isOpen ? (
                      <ChevronDown size={10} className={subtextColor} />
                    ) : (
                      <ChevronRight size={10} className={subtextColor} />
                    )}
                    {statusIcon(state.status)}
                    <span
                      className={`flex-1 text-[11px] font-mono truncate ${textColor}`}
                    >
                      {keyStr}
                    </span>
                    <span className={`text-[10px] ${subtextColor} shrink-0`}>
                      {fmtAge(state.dataUpdatedAt)}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3">
                      {state.error && (
                        <p className="text-[10px] text-red-400 mb-1">
                          Error: {String(state.error)}
                        </p>
                      )}
                      {dataStr && (
                        <pre
                          className={`text-[10px] font-mono rounded-lg p-2 overflow-auto max-h-32 ${subtextColor} bg-black/10`}
                        >
                          {dataStr.length > 1500
                            ? dataStr.slice(0, 1500) + "\n…"
                            : dataStr}
                        </pre>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            queryClient.invalidateQueries({
                              queryKey: query.queryKey,
                            });
                            forceUpdate((n) => n + 1);
                          }}
                          className={`text-[10px] px-2 py-0.5 rounded border border-current/20 ${subtextColor} hover:border-current/40`}
                        >
                          Invalidate
                        </button>
                        <button
                          onClick={() => {
                            queryClient.removeQueries({
                              queryKey: query.queryKey,
                            });
                            forceUpdate((n) => n + 1);
                          }}
                          className="text-[10px] px-2 py-0.5 rounded border border-red-500/30 text-red-400 hover:border-red-500/60"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <p className={`text-[10px] text-center ${subtextColor} opacity-50`}>
        {filtered.length} / {queries.length} entries
      </p>
    </div>
  );
}

// ─── Endpoints tab ────────────────────────────────────────────────────────────

type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
const METHODS: Method[] = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const METHOD_COLORS: Record<Method, string> = {
  GET: "text-green-400",
  POST: "text-amber-400",
  PUT: "text-blue-400",
  DELETE: "text-red-400",
  PATCH: "text-purple-400",
};

const QUICK_ROUTES = [
  { label: "Who Am I", method: "GET" as Method, path: "/users/whoami" },
  {
    label: "All Items",
    method: "GET" as Method,
    path: "/items?page=1&page_size=10",
  },
  { label: "Top Players", method: "GET" as Method, path: "/stats/top/players" },
  { label: "Leaderboard", method: "GET" as Method, path: "/stats/leaderboard" },
  { label: "Top Levels", method: "GET" as Method, path: "/stats/top/levels" },
  { label: "Top Items", method: "GET" as Method, path: "/stats/top/items" },
];

function EndpointsTab({
  textColor,
  subtextColor,
  panelBg,
  inputClass,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
  inputClass: string;
}) {
  const [method, setMethod] = useState<Method>("GET");
  const [path, setPath] = useState("/users/whoami");
  const [body, setBody] = useState("");
  const [response, setResponse] = useState<{
    status: number;
    data: unknown;
    ms: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    setLoading(true);
    setResponse(null);
    setError(null);
    const t0 = Date.now();
    try {
      let parsed: unknown;
      if (body.trim() && method !== "GET") parsed = JSON.parse(body);
      const res = await apiClient.request({ method, url: path, data: parsed });
      setResponse({ status: res.status, data: res.data, ms: Date.now() - t0 });
    } catch (e: unknown) {
      const ax = e as {
        response?: { status: number; data: unknown };
        message?: string;
      };
      if (ax?.response)
        setResponse({
          status: ax.response.status,
          data: ax.response.data,
          ms: Date.now() - t0,
        });
      else setError(ax?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Quick routes */}
      <div className="flex flex-wrap gap-1.5">
        {QUICK_ROUTES.map((r) => (
          <button
            key={r.path}
            type="button"
            onClick={() => {
              setMethod(r.method);
              setPath(r.path);
              setBody("");
              setResponse(null);
            }}
            className={`text-[10px] px-2 py-0.5 rounded-full border border-current/20 hover:border-current/40 ${subtextColor}`}
          >
            <span className={`${METHOD_COLORS[r.method]} mr-1`}>
              {r.method}
            </span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Request */}
      <div className={`rounded-xl p-3 flex flex-col gap-2 ${panelBg}`}>
        <div className="flex gap-2">
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value as Method)}
            className={`text-xs px-2 py-1.5 rounded-lg shrink-0 ${inputClass} ${METHOD_COLORS[method]}`}
          >
            {METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/endpoint"
            className={`flex-1 text-xs px-3 py-1.5 rounded-lg font-mono ${inputClass}`}
          />
          <Button
            size="sm"
            onClick={send}
            disabled={loading || !path}
            className="h-8 px-3 bg-green-600 hover:bg-green-500 text-white text-xs flex items-center gap-1.5 shrink-0"
          >
            {loading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Send size={11} />
            )}{" "}
            Send
          </Button>
        </div>
        {method !== "GET" && (
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={'{\n  "key": "value"\n}'}
            className={`text-xs font-mono px-3 py-2 rounded-lg resize-none ${inputClass}`}
          />
        )}
      </div>

      {/* Response */}
      {(response || error) && (
        <div
          className={`rounded-xl p-3 flex flex-col gap-2 flex-1 overflow-hidden ${panelBg}`}
        >
          <div className="flex items-center gap-2">
            <p
              className={`text-[10px] font-semibold uppercase tracking-wider ${subtextColor}`}
            >
              Response
            </p>
            {response && (
              <>
                <span
                  className={`text-xs font-mono font-bold ${response.status < 300 ? "text-green-400" : response.status < 500 ? "text-amber-400" : "text-red-400"}`}
                >
                  {response.status}
                </span>
                <span className={`text-[10px] ${subtextColor}`}>
                  {response.ms}ms
                </span>
              </>
            )}
          </div>
          {error ? (
            <p className="text-xs text-red-400 font-mono">{error}</p>
          ) : (
            <pre
              className={`text-[10px] font-mono rounded-lg p-2 overflow-auto flex-1 ${subtextColor} bg-black/10`}
            >
              {JSON.stringify(response?.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Game Data tab ────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<string, string> = {
  Common: "#9ca3af",
  Uncommon: "#10b981",
  Rare: "#3b82f6",
  Epic: "#8b5cf6",
  Legendary: "#f59e0b",
};

function GameDataTab({
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

// ─── Root ─────────────────────────────────────────────────────────────────────

export function DebugPageContent({
  animReady = true,
}: {
  animReady?: boolean;
}) {
  const { settings } = useSettings();
  const { useLiquidGlass, useDarkMode } = settings;
  const { isAdmin, isSupport } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("system");

  const cardBg = getBackgroundClasses(useLiquidGlass, useDarkMode);
  const panelBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const textShadow = getTextShadow(useLiquidGlass, useDarkMode);
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const visibleTabs = TABS.filter((t) => t.id !== "game" || isAdmin);

  const tabBtn = (t: (typeof TABS)[0]) => {
    const active = t.id === activeTab;
    return (
      <button
        key={t.id}
        type="button"
        onClick={() => setActiveTab(t.id)}
        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 text-left ${
          active
            ? useLiquidGlass
              ? useDarkMode
                ? "bg-white/20 text-white"
                : "bg-black/15 text-black"
              : useDarkMode
                ? "bg-gray-700 text-white"
                : "bg-white text-gray-900 shadow-sm"
            : `${subtextColor} hover:bg-current/8`
        }`}
      >
        <span className={active ? textColor : subtextColor}>{t.icon}</span>
        {t.label}
      </button>
    );
  };

  return (
    <div
      className={`z-0 flex w-full max-w-6xl rounded-xl overflow-hidden flex-1 ${
        animReady ? cardBg : cardBg.replace(/backdrop-blur-\S+/g, "")
      }`}
      style={sectionStyle(animReady, 0)}
    >
      {/* ── Left sidebar ───────────────────────────────────────────────── */}
      <div
        className={`flex flex-col gap-1 p-3 w-44 shrink-0 border-r border-current/10`}
        style={sectionStyle(animReady, 60)}
      >
        {/* Logo + title */}
        <div className="flex items-center gap-2 px-2 py-2 mb-2">
          <Bug size={15} className={subtextColor} />
          <div>
            <p className={`text-xs font-bold ${textColor} ${textShadow}`}>
              Debug
            </p>
            <p className={`text-[10px] ${subtextColor} leading-none`}>
              {isAdmin ? "Admin" : "Support"}
            </p>
          </div>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-col gap-0.5">{visibleTabs.map(tabBtn)}</div>

        {/* Refresh at bottom */}
        <div className="mt-auto pt-3 border-t border-current/10">
          <button
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["debug"] })
            }
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${subtextColor} hover:bg-current/8`}
          >
            <RefreshCw size={13} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Right content area ─────────────────────────────────────────── */}
      <div
        className="flex-1 overflow-hidden relative"
        style={sectionStyle(animReady, 120)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="absolute inset-0 overflow-y-auto p-4"
          >
            {activeTab === "system" && (
              <SystemTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
              />
            )}
            {activeTab === "cache" && (
              <CacheTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
                inputClass={inputClass}
              />
            )}
            {activeTab === "endpoints" && (
              <EndpointsTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
                inputClass={inputClass}
              />
            )}
            {activeTab === "game" && isAdmin && (
              <GameDataTab
                textColor={textColor}
                subtextColor={subtextColor}
                panelBg={panelBg}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
