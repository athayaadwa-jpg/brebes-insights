import { ReactNode } from "react";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow && (
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {eyebrow}
        </div>
      )}
      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description && <p className="mt-2 max-w-3xl text-base text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="shrink-0">{actions}</div>}
  </div>
);
