import type { PropsWithChildren, ReactNode } from 'react';

interface PageCardProps extends PropsWithChildren {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
}

export function PageCard({
  eyebrow,
  title,
  description,
  children,
}: PageCardProps) {
  return (
    <section className="page-card">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p className="description">{description}</p> : null}
      {children}
    </section>
  );
}
