import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: LucideIcon;
  hint?: string;
  trend?: { value: number; positive: boolean };
  variant?: "default" | "primary" | "accent";
  className?: string;
}

export const StatCard = ({ label, value, unit, icon: Icon, hint, trend, variant = "default", className }: StatCardProps) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-gradient-card p-5 shadow-soft transition-all hover:shadow-elegant hover:-translate-y-0.5",
        variant === "primary" && "border-primary/20",
        variant === "accent" && "border-accent/30",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {Icon && (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              variant === "primary" && "bg-primary/10 text-primary",
              variant === "accent" && "bg-accent/15 text-accent",
              variant === "default" && "bg-muted text-foreground/70"
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-1.5">
        <span className="font-display text-3xl font-bold tracking-tight text-foreground">{value}</span>
        {unit && (
          <span className={cn("text-sm font-medium text-muted-foreground", unit === "%" && "-ml-1.5")}>
            {unit}
          </span>
        )}
      </div>
      {(hint || trend) && (
        <div className="mt-2 flex items-center gap-2 text-xs">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold",
                trend.positive ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"
              )}
            >
              {trend.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trend.value > 0 ? "+" : ""}{trend.value}%
            </span>
          )}
          {hint && <span className="text-muted-foreground">{hint}</span>}
        </div>
      )}
    </div>
  );
};
