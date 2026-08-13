import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <header className="border-b border-rule bg-paper">
      <div className="wrap py-16 md:py-24">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {intro && (
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {intro}
          </p>
        )}
        {children}
      </div>
    </header>
  );
}
