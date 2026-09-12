export type ProductGlyphName =
  | 'brand'
  | 'home'
  | 'host'
  | 'player'
  | 'privacy'
  | 'error';

export function ProductGlyph({ name }: { name: ProductGlyphName }) {
  return (
    <svg className="product-glyph" viewBox="0 0 64 64" aria-hidden="true">
      {name === 'brand' ? (
        <>
          <path className="glyph-fill" d="M39 10a22 22 0 1 0 13 39A24 24 0 0 1 39 10Z" />
          <path className="glyph-spark" d="m18 11 2.3 5.7L26 19l-5.7 2.3L18 27l-2.3-5.7L10 19l5.7-2.3L18 11Z" />
        </>
      ) : null}
      {name === 'home' ? (
        <>
          <path className="glyph-fill" d="M38 9a21 21 0 1 0 15 36A23 23 0 0 1 38 9Z" />
          <path className="glyph-line" d="M13 49h38M18 49V36l8-7 8 7v13M41 49V33l6-5 5 5v16M23 40h6" />
          <path className="glyph-spark" d="m17 13 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
        </>
      ) : null}
      {name === 'host' ? (
        <>
          <path className="glyph-fill" d="M32 9 43 20 32 31 21 20 32 9Z" />
          <path className="glyph-line" d="M32 31v22M22 53h20M13 34h8m22 0h8M17 17l5 5m25-5-5 5" />
          <circle className="glyph-spark" cx="32" cy="20" r="4" />
        </>
      ) : null}
      {name === 'player' ? (
        <>
          <rect className="glyph-fill" x="14" y="11" width="36" height="44" rx="10" />
          <path className="glyph-line glyph-line--dark" d="M24 37c2.3-4 5-6 8-6s5.7 2 8 6M32 19a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z" />
          <path className="glyph-spark" d="m46 8 1.5 3.5L51 13l-3.5 1.5L46 18l-1.5-3.5L41 13l3.5-1.5L46 8Z" />
        </>
      ) : null}
      {name === 'privacy' ? (
        <>
          <path className="glyph-fill" d="M32 7 51 15v14c0 13-7 22-19 28-12-6-19-15-19-28V15l19-8Z" />
          <path className="glyph-line glyph-line--dark" d="M21 31s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" />
          <path className="glyph-line glyph-line--dark" d="m18 43 28-24" />
        </>
      ) : null}
      {name === 'error' ? (
        <>
          <path className="glyph-fill" d="M18 11h28v42H18z" />
          <path className="glyph-line glyph-line--dark" d="M25 19h14M25 27h14M25 35h8" />
          <path className="glyph-spark" d="m48 39 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
        </>
      ) : null}
    </svg>
  );
}

export function RoleGlyph({ roleName }: { roleName: string }) {
  const key = roleName.toLowerCase();

  return (
    <svg className="role-glyph" viewBox="0 0 64 64" aria-hidden="true">
      {key.includes('守卫') || key.includes('guard') ? (
        <>
          <path d="M32 7 52 15v15c0 14-8 23-20 29-12-6-20-15-20-29V15l20-8Z" />
          <path d="M32 20v25M22 31h20" />
        </>
      ) : key.includes('预言家') || key.includes('seer') ? (
        <>
          <path d="M7 32s9-16 25-16 25 16 25 16-9 16-25 16S7 32 7 32Z" />
          <circle cx="32" cy="32" r="8" />
          <path d="m48 10 1.8 4.2L54 16l-4.2 1.8L48 22l-1.8-4.2L42 16l4.2-1.8L48 10Z" />
        </>
      ) : key.includes('女巫') || key.includes('witch') ? (
        <>
          <path d="M23 8h18M26 8v13L14 47c-2 5 1 9 7 9h22c6 0 9-4 7-9L38 21V8" />
          <path d="M21 41h22M18 49h28M27 17h10" />
        </>
      ) : key.includes('猎人') || key.includes('hunter') ? (
        <>
          <circle cx="30" cy="34" r="19" />
          <circle cx="30" cy="34" r="10" />
          <circle cx="30" cy="34" r="2" />
          <path d="m35 29 18-18m-9 1h9v9" />
        </>
      ) : key.includes('狼王') || key.includes('king') ? (
        <>
          <path d="m10 21 12 9 10-17 10 17 12-9-5 25H15l-5-25Z" />
          <path d="M16 46h32v8H16zM24 38h16" />
        </>
      ) : key.includes('狼人') || key.includes('wolf') ? (
        <>
          <path d="m10 17 14 7 8-13 8 13 14-7-5 21c-2 11-8 18-17 18s-15-7-17-18l-5-21Z" />
          <path d="m22 36 6 3m14-3-6 3M27 47h10" />
        </>
      ) : key.includes('规则') || key.includes('rule') ? (
        <>
          <path d="M13 17h38M13 32h38M13 47h38" />
          <circle cx="25" cy="17" r="5" />
          <circle cx="41" cy="32" r="5" />
          <circle cx="29" cy="47" r="5" />
        </>
      ) : (
        <>
          <circle cx="32" cy="23" r="11" />
          <path d="M12 55c3-13 10-20 20-20s17 7 20 20M13 18 8 11m43 7 5-7" />
          <path d="m48 41 2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5Z" />
        </>
      )}
    </svg>
  );
}

