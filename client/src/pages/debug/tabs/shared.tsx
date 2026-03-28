export function InfoRow({
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

export function Section({
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
