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
      ? queries.filter((qr) => JSON.stringify(qr.queryKey).toLowerCase().includes(q))
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
      <CheckCircle2 size={10} className="shrink-0 text-green-400" />
    ) : s === "error" ? (
      <XCircle size={10} className="shrink-0 text-red-400" />
    ) : s === "pending" ? (
      <Loader2 size={10} className="shrink-0 animate-spin text-amber-400" />
    ) : null;

  const fmtAge = (ts: number) => {
    if (!ts) return "never";
    const s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    return `${Math.floor(s / 3600)}h ago`;
  };

  return (
    <div className="flex h-full flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="Filter…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className={`flex-1 rounded-lg px-3 py-1.5 text-xs ${inputClass}`}
        />
        <button
          onClick={() => {
            queryClient.invalidateQueries();
            forceUpdate((n) => n + 1);
          }}
          className={`rounded-lg border border-current/20 px-2.5 py-1.5 text-[10px] ${subtextColor} flex items-center gap-1 hover:border-current/40`}
        >
          <Trash2 size={10} /> Clear
        </button>
        <button
          onClick={() => forceUpdate((n) => n + 1)}
          className={`rounded-lg border border-current/20 px-2.5 py-1.5 text-[10px] ${subtextColor} hover:border-current/40`}
        >
          <RefreshCw size={10} />
        </button>
      </div>
      <div className={`flex-1 overflow-auto rounded-xl ${panelBg}`}>
        {filtered.length === 0 ? (
          <p className={`py-8 text-center text-xs ${subtextColor}`}>No cache entries</p>
        ) : (
          <div className="divide-y divide-current/5">
            {filtered.map((query) => {
              const keyStr = JSON.stringify(query.queryKey);
              const isOpen = expanded.has(keyStr);
              const state = query.state;
              const dataStr = state.data !== undefined ? JSON.stringify(state.data, null, 2) : null;
              return (
                <div key={keyStr}>
                  <button
                    type="button"
                    onClick={() => toggle(keyStr)}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-current/5"
                  >
                    {isOpen ? (
                      <ChevronDown size={10} className={subtextColor} />
                    ) : (
                      <ChevronRight size={10} className={subtextColor} />
                    )}
                    {statusIcon(state.status)}
                    <span className={`flex-1 truncate font-mono text-[11px] ${textColor}`}>
                      {keyStr}
                    </span>
                    <span className={`text-[10px] ${subtextColor} shrink-0`}>
                      {fmtAge(state.dataUpdatedAt)}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3">
                      {state.error && (
                        <p className="mb-1 text-[10px] text-red-400">
                          Error: {String(state.error)}
                        </p>
                      )}
                      {dataStr && (
                        <pre
                          className={`max-h-32 overflow-auto rounded-lg p-2 font-mono text-[10px] ${subtextColor} bg-black/10`}
                        >
                          {dataStr.length > 1500 ? dataStr.slice(0, 1500) + "\n…" : dataStr}
                        </pre>
                      )}
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => {
                            queryClient.invalidateQueries({
                              queryKey: query.queryKey,
                            });
                            forceUpdate((n) => n + 1);
                          }}
                          className={`rounded border border-current/20 px-2 py-0.5 text-[10px] ${subtextColor} hover:border-current/40`}
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
                          className="rounded border border-red-500/30 px-2 py-0.5 text-[10px] text-red-400 hover:border-red-500/60"
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
      <p className={`text-center text-[10px] ${subtextColor} opacity-50`}>
        {filtered.length} / {queries.length} entries
      </p>
    </div>
  );
}
