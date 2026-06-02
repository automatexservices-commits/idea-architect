/**
 * Continuous right-to-left marquee strip of vibe-coding platforms.
 * Each item links out to the platform's site. Logos are inline SVG
 * monochrome wordmarks/marks for a clean, professional look.
 *
 * The track duplicates its items once so the CSS animation can loop
 * seamlessly (translateX 0 → -50%).
 */

type Platform = {
  name: string;
  url: string;
  Logo: React.FC<{ className?: string }>;
};

/* ───────── Brand marks (simplified, monochrome SVG) ───────── */

const LovableLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.4 3 5 6.3 5c2 0 3.6 1.1 4.5 2.6h.4C12.1 6.1 13.7 5 15.7 5 19 5 21 8.4 19.6 11.8 17.5 16.4 12 21 12 21z" />
  </svg>
);

const EmergentLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <circle cx="12" cy="12" r="9" />
    <path d="M7 12h10M12 7l5 5-5 5" />
  </svg>
);

const ReplitLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <rect x="3" y="3" width="8" height="8" rx="1.5" />
    <rect x="3" y="13" width="8" height="8" rx="1.5" />
    <rect x="13" y="13" width="8" height="8" rx="1.5" />
  </svg>
);

const RocketLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M14 4c4 0 6 2 6 6 0 5-7 11-7 11s-7-6-7-11c0-4 2-6 6-6 .7 0 1.3.1 2 .4.7-.3 1.3-.4 2-.4z" />
    <circle cx="12" cy="10" r="2" />
    <path d="M8 18l-2 3M16 18l2 3" />
  </svg>
);

const RorkLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 21V4h7a4.5 4.5 0 0 1 2.6 8.2L20 21h-4l-4.8-7H9v7H5z" />
  </svg>
);

const BoltLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" />
  </svg>
);

const CursorLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
    <path d="M5 3l14 7-6 2-2 6-6-15z" />
  </svg>
);

const PLATFORMS: Platform[] = [
  { name: "Lovable",  url: "https://lovable.dev",  Logo: LovableLogo },
  { name: "Emergent", url: "https://emergent.sh",  Logo: EmergentLogo },
  { name: "Replit",   url: "https://replit.com",   Logo: ReplitLogo },
  { name: "Rocket",   url: "https://rocket.new",   Logo: RocketLogo },
  { name: "Rork",     url: "https://rork.com",     Logo: RorkLogo },
  { name: "Bolt",     url: "https://bolt.new",     Logo: BoltLogo },
  { name: "Cursor",   url: "https://cursor.com",   Logo: CursorLogo },
];

const PLATFORM_LOOP = [...PLATFORMS, ...PLATFORMS];

function PlatformItem({ p }: { p: Platform }) {
  return (
    <a
      href={p.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${p.name} in a new tab`}
      className="group mx-6 inline-flex items-center gap-2.5 shrink-0 text-foreground/55 hover:text-foreground transition-colors"
    >
      <p.Logo className="w-6 h-6 transition-transform group-hover:scale-110" />
      <span className="font-display font-semibold text-base tracking-tight whitespace-nowrap">
        {p.name}
      </span>
    </a>
  );
}

export function VibePlatforms() {
  return (
    <section
      aria-label="Compatible vibe-coding platforms"
      className="rounded-2xl border border-border/70 bg-surface/40 py-6"
    >
      <div className="px-6 mb-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-sm font-semibold tracking-tight text-foreground/80">
          Drop your ZIP into any vibe-coding platform
        </h3>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
          Compatible with
        </span>
      </div>

      <div className="marquee">
        <div className="marquee-track">
          {PLATFORM_LOOP.map((p, i) => (
            <PlatformItem key={`${p.name}-${i}`} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
