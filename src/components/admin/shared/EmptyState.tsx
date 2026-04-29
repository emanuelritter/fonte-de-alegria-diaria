import { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="text-center py-16 px-6 border border-dashed border-border rounded-2xl bg-card/50">
      {Icon ? <Icon className="h-8 w-8 mx-auto text-muted-foreground mb-3" /> : null}
      <p className="font-serif text-xl">{title}</p>
      {description ? (
        <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">{description}</p>
      ) : null}
    </div>
  );
}