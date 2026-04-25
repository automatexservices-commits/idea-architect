/**
 * Showcases vibe-coding platforms the user can paste their generated ZIP into.
 * Logos are inline SVGs / unicode marks (no external network logos) and each
 * card opens the platform site in a new tab.
 */
type Platform = {
  name: string;
  url: string;
  /** A short brand mark (1-2 chars or stylized initials) */
  mark: string;
  /** Tailwind classes for the brand chip background */
  chipClass: string;
};

const PLATFORMS: Platform[] = [
  {
    name: "Lovable",
    url: "https://lovable.dev",
    mark: "♥",
    chipClass: "bg-gradient-to-br from-pink-500 to-rose-600 text-white",
  },
  {
    name: "Emergent",
    url: "https://emergent.sh",
    mark: "E",
    chipClass: "bg-gradient-to-br from-indigo-500 to-violet-600 text-white",
  },
  {
    name: "Replit",
    url: "https://replit.com",
    mark: "▶",
    chipClass: "bg-gradient-to-br from-orange-500 to-red-500 text-white",
  },
  {
    name: "Rocket",
    url: "https://rocket.new",
    mark: "🚀",
    chipClass: "bg-gradient-to-br from-sky-500 to-blue-600 text-white",
  },
  {
    name: "Rork",
    url: "https://rork.com",
    mark: "R",
    chipClass: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white",
  },
];

export function VibePlatforms() {
  return (
    <div className="rounded-2xl border border-primary/30 bg-accent/40 p-5 md:p-6">
      <div className="flex items-start gap-3 mb-4">
        <span className="inline-flex w-8 h-8 rounded-lg bg-primary text-primary-foreground items-center justify-center text-sm font-bold shrink-0">
          ⚡
        </span>
        <div>
          <h3 className="font-display font-semibold text-base md:text-lg">
            Drop your ZIP into your favourite vibe-coding platform
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
            Paste the contents and let your AI builder turn this spec into running code.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {PLATFORMS.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border bg-background hover:border-primary/60 hover:bg-surface transition-all hover-lift"
            aria-label={`Open ${p.name} in a new tab`}
          >
            <span
              className={`inline-flex w-8 h-8 rounded-lg items-center justify-center text-base font-bold shrink-0 ${p.chipClass}`}
            >
              {p.mark}
            </span>
            <span className="flex flex-col leading-tight min-w-0">
              <span className="text-sm font-semibold truncate">{p.name}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Open ↗
              </span>
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
