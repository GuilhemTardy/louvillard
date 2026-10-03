export function Marquee({ items }: { items: readonly string[] }) {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden bg-accent py-4 text-accent-ink md:py-5" aria-label="Disciplines">
      <div className="marquee flex w-max">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0 items-center" aria-hidden={k === 1}>
            {row.map((name, i) => (
              <span key={`${k}-${i}`} className="display flex items-center text-[clamp(1.6rem,3.4vw,3rem)]">
                <span className="px-6 md:px-8">{name}</span>
                <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0" aria-hidden="true">
                  <circle cx="7" cy="7" r="4" fill="currentColor" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
