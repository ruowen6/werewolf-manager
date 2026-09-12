import type { PropsWithChildren, ReactNode } from 'react';

import { ProductGlyph, type ProductGlyphName } from './ProductGlyph';

interface PageCardProps extends PropsWithChildren {
  className?: string;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  tone?: Exclude<ProductGlyphName, 'brand' | 'privacy'>;
}

export function PageCard({
  className,
  eyebrow,
  title,
  description,
  tone = 'home',
  children,
}: PageCardProps) {
  return (
    <section
      className={`page-card page-card--${tone}${className ? ` ${className}` : ''}`}
    >
      <header className="page-hero">
        <span className="page-hero__visual" aria-hidden="true">
          <ProductGlyph name={tone} />
        </span>
        <div className="page-hero__copy">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h1>{title}</h1>
          {description ? <p className="description">{description}</p> : null}
        </div>
      </header>
      {children}
    </section>
  );
}
