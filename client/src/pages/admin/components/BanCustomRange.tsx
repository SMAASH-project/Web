import { useTranslation } from "react-i18next";
import React, { useCallback, useState } from "react";
import { Calendar, type DateRange } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useSettings } from "@/pages/settings/SettingsContext";
import { getTextColor, getSubtextColor, getBackgroundClasses, getInputClasses } from "@/lib/utils";
import { CalendarIcon, Clock, ChevronUp, ChevronDown } from "lucide-react";

interface Props {
  from: Date;
  to?: Date;
  onStartChange: (d: Date) => void;
  onEndChange: (d?: Date) => void;
  onCalendarSelect: (r: DateRange) => void;
  hideCalendar?: boolean;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function formatDateDisplay(d: Date) {
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function parseDdMmYyyy(value: string): Date | null {
  const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match.map(Number);
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  const date = new Date(y, m - 1, d);
  if (date.getMonth() !== m - 1 || date.getDate() !== d) return null;
  return date;
}

function toDdMmYyyy(d: Date) {
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// ─── TimeSpinner ──────────────────────────────────────────────────────────────
// Round +/− spinner for a single time unit with wrap-around clamping

function TimeSpinner({
  value,
  min,
  max,
  onChange,
  inputClass,
  textColor,
  subtextColor,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  inputClass: string;
  textColor: string;
  subtextColor: string;
}) {
  const [raw, setRaw] = useState(pad(value));

  React.useEffect(() => {
    setRaw(pad(value));
  }, [value]);

  const clamp = (n: number) => {
    if (n < min) return max;
    if (n > max) return min;
    return n;
  };

  const commit = (str: string) => {
    const n = parseInt(str, 10);
    if (!isNaN(n)) onChange(clamp(n));
    else setRaw(pad(value));
  };

  const stepUp = () => onChange(clamp(value + 1));
  const stepDown = () => onChange(clamp(value - 1));

  const btnBase = cn(
    "flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all duration-150 select-none cursor-pointer",
    inputClass,
  );

  return (
    <div className="flex flex-col items-center gap-0.5">
      <button type="button" onClick={stepUp} className={btnBase} aria-label="Increase">
        <ChevronUp size={12} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={raw}
        maxLength={2}
        onChange={(e) => setRaw(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(raw);
          if (e.key === "ArrowUp") {
            e.preventDefault();
            stepUp();
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            stepDown();
          }
        }}
        className={cn(
          inputClass,
          "w-10 rounded-xl px-0 py-1 text-center font-mono text-sm font-semibold",
          textColor,
        )}
      />
      <button type="button" onClick={stepDown} className={btnBase} aria-label="Decrease">
        <ChevronDown size={12} />
      </button>
    </div>
  );
}

// ─── TimePicker ───────────────────────────────────────────────────────────────

function TimePicker({
  date,
  onChange,
  inputClass,
  textColor,
  subtextColor,
  label,
}: {
  date: Date | undefined;
  onChange: (h: number, m: number) => void;
  inputClass: string;
  textColor: string;
  subtextColor: string;
  label: string;
}) {
  const h = date?.getHours() ?? 0;
  const m = date?.getMinutes() ?? 0;

  return (
    <div className="flex flex-col gap-1.5">
      <span className={cn("flex items-center gap-1 text-xs font-medium", subtextColor)}>
        <Clock size={11} />
        {label}
      </span>
      <div className="flex items-center gap-3">
        <TimeSpinner
          value={h}
          min={0}
          max={23}
          onChange={(v) => onChange(v, m)}
          inputClass={inputClass}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <span className={cn("text-xl leading-none font-bold", textColor)}>:</span>
        <TimeSpinner
          value={m}
          min={0}
          max={59}
          onChange={(v) => onChange(h, v)}
          inputClass={inputClass}
          textColor={textColor}
          subtextColor={subtextColor}
        />
        <span className={cn("ml-1 text-xs", subtextColor)}>
          {pad(h)}:{pad(m)}
        </span>
      </div>
    </div>
  );
}

function DateTextInput({
  date,
  onCommit,
  inputClass,
  subtextColor,
}: {
  date: Date | undefined;
  onCommit: (d: Date) => void;
  inputClass: string;
  subtextColor: string;
}) {
  const [raw, setRaw] = useState(() => (date ? toDdMmYyyy(date) : ""));
  const [error, setError] = useState(false);

  React.useEffect(() => {
    setRaw(date ? toDdMmYyyy(date) : "");
    setError(false);
  }, [date]);

  const tryCommit = () => {
    const parsed = parseDdMmYyyy(raw);
    if (!parsed) {
      setError(true);
      return;
    }
    setError(false);
    if (date) parsed.setHours(date.getHours(), date.getMinutes(), 0, 0);
    onCommit(parsed);
  };

  return (
    <div className="flex flex-col gap-0.5">
      <input
        type="text"
        value={raw}
        placeholder="dd/mm/yyyy"
        maxLength={10}
        onChange={(e) => {
          setRaw(e.target.value);
          setError(false);
        }}
        onBlur={tryCommit}
        onKeyDown={(e) => e.key === "Enter" && tryCommit()}
        className={cn(
          inputClass,
          "w-full px-2 py-1.5 font-mono text-xs",
          error && "border-red-500 ring-1 ring-red-500",
        )}
      />
      {error && <span className="px-1 text-[10px] text-red-400">Use dd/mm/yyyy</span>}
    </div>
  );
}

export default function BanCustomRange({
  from,
  to,
  onStartChange,
  onEndChange,
  onCalendarSelect,
  hideCalendar = false,
}: Props) {
  const { settings } = useSettings();
  const { t } = useTranslation("admin");
  const { useLiquidGlass, useDarkMode } = settings;

  const textColor = getTextColor(useLiquidGlass, useDarkMode);
  const subtextColor = getSubtextColor(useLiquidGlass, useDarkMode);
  const datePillBg = getBackgroundClasses(useLiquidGlass, useDarkMode, "light");
  const inputClass = getInputClasses(useLiquidGlass, useDarkMode);

  const handleStartTimeChange = useCallback(
    (h: number, m: number) => {
      const d = new Date(from);
      d.setHours(h, m, 0, 0);
      onStartChange(d);
    },
    [from, onStartChange],
  );

  const handleEndTimeChange = useCallback(
    (h: number, m: number) => {
      if (!to) return;
      const d = new Date(to);
      d.setHours(h, m, 0, 0);
      onEndChange(d);
    },
    [to, onEndChange],
  );

  const dividerClass = cn(
    useLiquidGlass
      ? useDarkMode
        ? "bg-white/10"
        : "bg-black/10"
      : useDarkMode
        ? "bg-gray-700"
        : "bg-gray-200",
  );

  return (
    <div className="flex flex-col gap-4">
      {!hideCalendar && (
        <Calendar
          mode="range"
          selected={{ from, to }}
          onSelect={(v) => onCalendarSelect(v as DateRange)}
          fromDate={new Date()}
        />
      )}

      <div className={cn("flex flex-row gap-0 rounded-xl p-3", datePillBg)}>
        {/* Start */}
        <div className="flex flex-1 flex-col gap-2 pr-3">
          <div className={cn("flex items-center gap-1.5 text-xs", subtextColor)}>
            <CalendarIcon size={11} />
            <span>{t("ban.starts")}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("min-w-0 flex-1 truncate text-xs font-medium", textColor)}>
              {formatDateDisplay(from)}
            </span>
          </div>
          <DateTextInput
            date={from}
            onCommit={onStartChange}
            inputClass={inputClass}
            subtextColor={subtextColor}
          />
          <TimePicker
            date={from}
            onChange={handleStartTimeChange}
            inputClass={inputClass}
            textColor={textColor}
            subtextColor={subtextColor}
            label={t("ban.startTime")}
          />
        </div>

        {/* Vertical divider */}
        <div className={cn("w-px self-stretch", dividerClass)} />

        {/* End */}
        <div className="flex flex-1 flex-col gap-2 pl-3">
          <div className={cn("flex items-center gap-1.5 text-xs", subtextColor)}>
            <CalendarIcon size={11} />
            <span>{t("ban.ends")}</span>
          </div>
          {to ? (
            <>
              <div className="flex items-center gap-2">
                <span className={cn("min-w-0 flex-1 truncate text-xs font-medium", textColor)}>
                  {formatDateDisplay(to)}
                </span>
              </div>
              <DateTextInput
                date={to}
                onCommit={onEndChange}
                inputClass={inputClass}
                subtextColor={subtextColor}
              />
              <TimePicker
                date={to}
                onChange={handleEndTimeChange}
                inputClass={inputClass}
                textColor={textColor}
                subtextColor={subtextColor}
                label={t("ban.endTime")}
              />
            </>
          ) : (
            <p className={cn("mt-1 text-xs italic", subtextColor)}>{t("ban.endPlaceholder")}</p>
          )}
        </div>
      </div>

      {to && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-3 py-2",
            getBackgroundClasses(useLiquidGlass, useDarkMode, "base"),
          )}
        >
          <Clock size={12} className={subtextColor} />
          <span className={cn("text-xs", subtextColor)}>{t("ban.banActiveUntil")}</span>
          <span className={cn("ml-auto text-xs font-semibold", textColor)}>
            {to.toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      )}
    </div>
  );
}
