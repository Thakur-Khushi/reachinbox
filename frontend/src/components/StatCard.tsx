interface Props {
  label: string;
  value: number;
  icon: (p: { className?: string }) => JSX.Element;
  accent: "brand" | "amber" | "emerald" | "rose";
}

const ACCENTS: Record<Props["accent"], string> = {
  brand: "bg-brand-50 text-brand-600",
  amber: "bg-amber-50 text-amber-600",
  emerald: "bg-emerald-50 text-emerald-600",
  rose: "bg-rose-50 text-rose-600",
};

export default function StatCard({ label, value, icon: Icon, accent }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${ACCENTS[accent]}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}
