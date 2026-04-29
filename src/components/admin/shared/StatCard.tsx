import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: "default" | "success" | "warning" | "danger";
}

const tones: Record<NonNullable<Props["tone"]>, string> = {
  default: "border-border/60",
  success: "border-primary/40 bg-primary/5",
  warning: "border-coral/40 bg-coral/5",
  danger: "border-destructive/40 bg-destructive/5",
};

export function StatCard({ label, value, hint, icon: Icon, tone = "default" }: Props) {
  return (
    <div className={cn("rounded-2xl border p-5 bg-card shadow-soft", tones[tone])}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.18em] font-semibold text-muted-foreground">
          {label}
        </p>
        {Icon ? <Icon className="h-4 w-4 text-muted-foreground" /> : null}
      </div>
      <p className="font-serif text-3xl mt-2 leading-none">{value}</p>
      {hint ? <p className="text-xs text-muted-foreground mt-2">{hint}</p> : null}
    </div>
  );
}