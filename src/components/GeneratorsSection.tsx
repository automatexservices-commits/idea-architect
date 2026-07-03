import { Link } from "@tanstack/react-router";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Blocks,
  ClipboardList,
  FileCode2,
  FileText,
  Layers3,
  Sparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";

type GeneratorCard = {
  title: string;
  description: string;
  href: string;
  icon: typeof FileText;
  side: "left" | "right";
  number: string;
  offsetClass: string;
};

const GENERATORS: GeneratorCard[] = [
  {
    title: "AI PRD Generator",
    description: "Generate complete Product Requirement Documents from any idea.",
    href: "/prd-generator",
    icon: FileText,
    side: "left",
    number: "01",
    offsetClass: "md:mt-0",
  },
  {
    title: "AI SRS Generator",
    description: "Generate structured Software Requirement Specifications using AI.",
    href: "/srs-generator",
    icon: ClipboardList,
    side: "right",
    number: "02",
    offsetClass: "md:mt-10",
  },
  {
    title: "Design Document Generator",
    description: "Generate complete software specifications for modern AI development.",
    href: "/design-document-generator",
    icon: Blocks,
    side: "left",
    number: "03",
    offsetClass: "md:mt-6",
  },
  {
    title: "API Documentation Generator",
    description: "Generate API documentation and endpoint planning in minutes.",
    href: "/api-documentation-generator",
    icon: FileCode2,
    side: "right",
    number: "04",
    offsetClass: "md:mt-10",
  },
  {
    title: "Software Architecture Generator",
    description: "Generate scalable software architecture before writing code.",
    href: "/software-architecture-generator",
    icon: Layers3,
    side: "left",
    number: "05",
    offsetClass: "md:mt-6",
  },
];

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener?.("change", update);
    media.addListener?.(update);

    return () => {
      media.removeEventListener?.("change", update);
      media.removeListener?.(update);
    };
  }, []);

  return reducedMotion;
}

export function GeneratorsSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(() => GENERATORS.map(() => false));
  const reducedMotion = usePrefersReducedMotion();

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -8;
    const rotateY = ((x - centerX) / centerX) * 8;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.style.transition = "transform 0.1s ease";
  };

  const handleMouseLeave = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    card.style.transition = "transform 0.4s ease";
  };

  useEffect(() => {
    if (reducedMotion) {
      setVisibleCards(GENERATORS.map(() => true));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibleCards((current) => {
          const next = [...current];
          let changed = false;

          entries.forEach((entry) => {
            const index = Number((entry.target as HTMLElement).dataset.cardIndex);
            if (Number.isNaN(index)) return;
            if (entry.isIntersecting && !next[index]) {
              next[index] = true;
              changed = true;
            }
          });

          return changed ? next : current;
        });
      },
      { threshold: 0.2 },
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, [reducedMotion]);

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden border-t border-border/50 py-24 md:py-28"
    >
      <section className="relative mx-auto max-w-6xl px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.78_0.27_145/0.08),transparent_60%)]" />
        <div className="absolute inset-y-0 left-1/2 w-[min(88rem,92vw)] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,oklch(0.78_0.27_145/0.03),transparent)] opacity-70" />

        <div className="relative z-10 max-w-2xl mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1 text-xs font-medium tracking-[0.18em] text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            GENERATORS
          </div>
          <h2
            id="generators-heading"
            className="mt-5 font-display text-4xl md:text-5xl font-bold tracking-tight"
          >
            Explore PLANNR Generators
          </h2>
          <p className="mt-4 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Purpose-built AI generators for every stage of software planning and documentation.
          </p>
        </div>

        <div className="relative z-10 space-y-8 md:space-y-20">
          {GENERATORS.map((generator, index) => {
            const isLeft = generator.side === "left";
            const isVisible = visibleCards[index] ?? false;
            const slideX = isLeft ? "-30px" : "30px";

            return (
              <div
                key={generator.title}
                ref={(node) => {
                  cardRefs.current[index] = node;
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                data-card-index={index}
                className={cn(
                  "relative flex",
                  isLeft ? "justify-start" : "justify-end",
                  generator.offsetClass,
                )}
                style={{
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? "translateX(0)" : `translateX(${slideX})`,
                  transition:
                    "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
                  willChange: "transform, opacity",
                  transformStyle: "preserve-3d",
                  cursor: "pointer",
                }}
              >
                <div
                  className={cn(
                    "relative w-full md:w-[55%] max-w-[38rem]",
                    isLeft ? "md:pr-12" : "md:pl-12",
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute top-1/2 z-20 h-20 w-20 -translate-y-1/2 rounded-full bg-[#22c55e] opacity-25 blur-[32px]",
                      isLeft ? "right-[-18px]" : "left-[-18px]",
                    )}
                  />

                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute top-1/2 z-20 -translate-y-1/2 text-[clamp(3rem,6vw,5rem)] font-bold leading-none text-[#16a34a] opacity-15",
                      isLeft ? "right-[-10px]" : "left-[-10px]",
                    )}
                  >
                    {generator.number}
                  </div>

                  <div
                    aria-hidden="true"
                    className={cn(
                      "pointer-events-none absolute top-1/2 z-20 h-5 w-5 -translate-y-1/2 rounded-full border border-[#22c55e]/35 bg-[#22c55e]",
                      isLeft ? "right-[-10px]" : "left-[-10px]",
                    )}
                  />

                  <article
                    className={cn(
                      "group relative overflow-hidden rounded-[2rem] border border-border/80 bg-[linear-gradient(180deg,oklch(1_0_0/0.98),oklch(0.985_0.005_150/0.92))] px-8 py-7 md:px-10 md:py-8 shadow-[0_20px_70px_-34px_oklch(0.3_0.05_150/0.24)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_80px_-28px_oklch(0.78_0.27_145/0.22)]",
                    )}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,oklch(0.78_0.27_145/0.08),transparent_52%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                    <div className="relative flex items-start gap-5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/10 bg-accent/70 text-primary transition-all duration-300 group-hover:border-primary/20 group-hover:bg-primary/12 group-hover:shadow-[0_0_24px_oklch(0.78_0.27_145/0.18)]">
                        <generator.icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex items-center gap-3 text-[10px] font-mono uppercase tracking-[0.32em] text-muted-foreground">
                          <span>{generator.number}</span>
                          <span className="h-px flex-1 bg-border/80" />
                        </div>

                        <h3 className="font-display text-2xl font-semibold tracking-tight transition-colors group-hover:text-primary">
                          {generator.title}
                        </h3>

                        <p className="mt-3 max-w-md text-sm md:text-[0.95rem] leading-relaxed text-muted-foreground">
                          {generator.description}
                        </p>

                        <Link
                          to={generator.href}
                          className="btn-3d btn-3d-outline btn-3d-sm mt-6 inline-flex"
                          aria-label={`Learn more about ${generator.title}`}
                        >
                          Learn More
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
