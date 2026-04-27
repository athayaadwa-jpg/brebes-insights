import { LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatCardTrend {
  /** Selisih nilai absolut vs periode sebelumnya (dalam satuan asli indikator). */
  delta: number;
  /** Persentase perubahan vs periode sebelumnya (opsional). */
  percent?: number;
  /** Apakah perubahan ini "baik" (hijau) atau "buruk" (merah). */
  positive: boolean;
  /** Label periode pembanding, mis. "vs 2023" atau "vs TW2-2024". */
  comparedTo?: string;
  /** Format penampil delta (mis. fungsi formatInt / formatDecimal). */
  formatDelta?: (n: number) => string;
  /** Satuan delta, mis. "%", "jiwa", "ton". */
  unit?: string;
}

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  hint?: string;
  trend?: StatCardTrend;
  variant?: "default" | "primary" | "accent";
  className?: string;
}

const formatDeltaDefault = (n: number) =>
  n.toLocaleString("id-ID", { maximumFractionDigits: 2 });

export const StatCard = ({
  label,
  value,
  unit,
  icon: Icon,
  hint,
  trend,
  variant = "default",
  className,
}: StatCardProps) => {
  const renderTrend = () => {
    if (!trend) return null;
    const { delta, percent, positive, comparedTo, formatDelta, unit: dUnit } = trend;
    const isFlat = delta === 0;
    const ToneIcon = isFlat ? Minus : delta > 0 ? TrendingUp : TrendingDown;
    const toneClass = isFlat
      ? "bg-muted text-muted-foreground"
      : positive
      ? "bg-success/15 text-success"
      : "bg-destructive/15 text-destructive";

    const fmt = formatDelta ?? formatDeltaDefault;
    const sign = delta > 0 ? "+" : delta < 0 ? "−" : "";
    const absDelta = Math.abs(delta);
    const deltaStr = `${sign}${fmt(absDelta)}${dUnit ? (dUnit === "%" ? "%" : ` ${dUnit}`) : ""}`;
    const pctStr =
      percent !== undefined && Number.isFinite(percent) && !isFlat
        ? ` (${percent > 0 ? "+" : "−"}${Math.abs(percent).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%)`
        : "";

    return (
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs">
        <span
          className={cn(
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
            toneClass,
          )}
        >
          <ToneIcon className="h-3 w-3" />
          {deltaStr}
          {pctStr}
        </span>
        {comparedTo && <span className="text-muted-foreground">{comparedTo}</span>}
      </div>
    );
  };

  return (
    <div
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-gradient-card p-5 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5",
        variant === "primary" && "border-primary/20",
        variant === "accent" && "border-accent/30",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground leading-snug">
          {label}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              variant === "primary" && "bg-primary/10 text-primary",
              variant === "accent" && "bg-accent/15 text-accent",
              variant === "default" && "bg-muted text-foreground/70",
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-1 items-end">
        <div className="flex items-baseline gap-1.5 leading-none">
          <span className="font-display text-[2.25rem] sm:text-[2.5rem] font-extrabold tracking-tight text-foreground leading-none">
            {value}
          </span>
          {unit && (
            <span
              className={cn(
                "text-sm font-medium text-muted-foreground",
                unit === "%" && "-ml-1.5",
              )}
            >
              {unit}
            </span>
          )}
        </div>
      </div>

      {hint && (
        <p className="mt-2 text-xs text-muted-foreground">{hint}</p>
      )}

      {renderTrend()}
    </div>
  );
};
