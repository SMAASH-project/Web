import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/apiClient";

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
  { label: "All Users", method: "GET" as Method, path: "/users" },
  {
    label: "All Items",
    method: "GET" as Method,
    path: "/items?page=1&page_size=10",
  },
  {
    label: "All Posts",
    method: "GET" as Method,
    path: "/posts?page=1&page_size=10",
  },
  { label: "Characters", method: "GET" as Method, path: "/characters" },
  { label: "Levels", method: "GET" as Method, path: "/levels" },
  { label: "Rarities", method: "GET" as Method, path: "/rarities" },
  { label: "Categories", method: "GET" as Method, path: "/categories" },
  { label: "Purchases", method: "GET" as Method, path: "/purchases" },
  { label: "Top Players", method: "GET" as Method, path: "/stats/top/players" },
  { label: "Leaderboard", method: "GET" as Method, path: "/stats/leaderboard" },
  { label: "Top Levels", method: "GET" as Method, path: "/stats/top/levels" },
  { label: "Top Items", method: "GET" as Method, path: "/stats/top/items" },
];

export function EndpointsTab({
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
