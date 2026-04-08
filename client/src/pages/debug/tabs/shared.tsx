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
    <div className="flex items-center justify-between gap-4 border-b border-current/5 py-1.5 last:border-0">
      <span className={`shrink-0 text-xs ${subtextColor}`}>{label}</span>
      <span className={`text-right text-xs ${mono ? "font-mono" : ""} ${textColor}`}>{value}</span>
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
    <div className={`flex flex-col gap-0.5 rounded-xl p-3 ${panelBg}`}>
      <div className={`mb-2 flex items-center gap-1.5 ${subtextColor}`}>
        {icon}
        <p className="text-[10px] font-semibold tracking-widest uppercase">{title}</p>
      </div>
      {children}
    </div>
  );
}
