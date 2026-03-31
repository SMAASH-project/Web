import { useState, useMemo } from "react";
import {
  RefreshCw,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export function CacheTab({
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
