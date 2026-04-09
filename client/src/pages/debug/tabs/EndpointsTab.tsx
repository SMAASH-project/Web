import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { StyledSelect } from "@/components/ui/styled-select";
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
  bgClass,
}: {
  textColor: string;
  subtextColor: string;
  panelBg: string;
  inputClass: string;
  bgClass: string;
}) {
  const { t } = useTranslation("debug");
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
    <div className="flex h-full flex-col gap-3">
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
            className={`rounded-full border border-current/20 px-2 py-0.5 text-[10px] hover:border-current/40 ${subtextColor}`}
          >
            <span className={`${METHOD_COLORS[r.method]} mr-1`}>{r.method}</span>
            {r.label}
          </button>
        ))}
      </div>

      {/* Request */}
      <div className={`flex flex-col gap-2 rounded-xl p-3 ${panelBg}`}>
        <div className="flex gap-2">
          <StyledSelect
            value={method}
            options={METHODS}
            onChange={setMethod}
            inputClass={inputClass}
            textColor={textColor}
            bgClass={bgClass}
            className="w-auto min-w-20 shrink-0"
            renderOption={(m) => <span className={METHOD_COLORS[m]}>{m}</span>}
          />
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="/endpoint"
            className={`flex-1 rounded-lg px-3 py-1.5 font-mono text-xs ${inputClass}`}
          />
          <Button
            size="sm"
            onClick={send}
            disabled={loading || !path}
            className="flex h-8 shrink-0 items-center gap-1.5 bg-green-600 px-3 text-xs text-white hover:bg-green-500"
          >
            {loading ? <Loader2 size={11} className="animate-spin" /> : <Send size={11} />}{" "}
            {t("endpoints.send")}
          </Button>
        </div>
        {method !== "GET" && (
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={'{\n  "key": "value"\n}'}
            className={`resize-none rounded-lg px-3 py-2 font-mono text-xs ${inputClass}`}
          />
        )}
      </div>

      {/* Response */}
      {(response || error) && (
        <div className={`flex flex-1 flex-col gap-2 overflow-hidden rounded-xl p-3 ${panelBg}`}>
          <div className="flex items-center gap-2">
            <p className={`text-[10px] font-semibold tracking-wider uppercase ${subtextColor}`}>
              {t("endpoints.response")}
            </p>
            {response && (
              <>
                <span
                  className={`font-mono text-xs font-bold ${response.status < 300 ? "text-green-400" : response.status < 500 ? "text-amber-400" : "text-red-400"}`}
                >
                  {response.status}
                </span>
                <span className={`text-[10px] ${subtextColor}`}>{response.ms}ms</span>
              </>
            )}
          </div>
          {error ? (
            <p className="font-mono text-xs text-red-400">{error}</p>
          ) : (
            <pre
              className={`flex-1 overflow-auto rounded-lg p-2 font-mono text-[10px] ${subtextColor} bg-black/10`}
            >
              {JSON.stringify(response?.data, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
