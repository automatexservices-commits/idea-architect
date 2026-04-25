import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

import exDating from "@/assets/ex-dating.jpg";
import exDelivery from "@/assets/ex-delivery.jpg";
import exSaas from "@/assets/ex-saas.jpg";
import exFintech from "@/assets/ex-fintech.jpg";
import exStreaming from "@/assets/ex-streaming.jpg";
import exEdu from "@/assets/ex-edu.jpg";
import exShop from "@/assets/ex-shop.jpg";
import exHealth from "@/assets/ex-health.jpg";
import exFitness from "@/assets/ex-fitness.jpg";

export const Route = createFileRoute("/examples")({
  head: () => ({
    meta: [
      { title: "Examples — PLANNR" },
      { name: "description", content: "Realistic example specs PLANNR can generate: dating, food delivery, SaaS, fintech, streaming, edtech, and more." },
      { property: "og:title", content: "Examples — PLANNR" },
      { property: "og:description", content: "See realistic project mock-ups generated from a one-line idea." },
    ],
  }),
  component: ExamplesPage,
});

type Example = {
  tag: string;
  title: string;
  desc: string;
  stack: string[];
  image: string;
};

const ROW_1: Example[] = [
  { tag: "Dating",     title: "Lumr",     desc: "Swipe-first dating with AI ice-breakers.",         stack: ["React Native","Supabase"], image: exDating },
  { tag: "Delivery",   title: "ZipEats",  desc: "Hyperlocal food delivery, 25-min ETA.",            stack: ["Next.js","Mapbox"],         image: exDelivery },
  { tag: "SaaS",       title: "Metricly", desc: "Analytics for indie SaaS founders.",               stack: ["React","Postgres"],         image: exSaas },
];

const ROW_2: Example[] = [
  { tag: "Fintech",    title: "PayWave",  desc: "UPI-native wallet with virtual card.",             stack: ["Flutter","Node"],           image: exFintech },
  { tag: "Streaming",  title: "Streamly", desc: "Subscription video, adaptive bitrate.",            stack: ["Next.js","HLS"],            image: exStreaming },
  { tag: "Edtech",     title: "LearnQ",   desc: "Adaptive learning with live classes.",             stack: ["React","LiveKit"],          image: exEdu },
];

const ROW_3: Example[] = [
  { tag: "E-commerce", title: "kart9",    desc: "Headless storefront, sub-second search.",          stack: ["Remix","Algolia"],          image: exShop },
  { tag: "Health",     title: "Medico",   desc: "Telemedicine with video consults.",                stack: ["Expo","Twilio"],            image: exHealth },
  { tag: "Fitness",    title: "Repsly",   desc: "30-day workouts with AI form-check.",              stack: ["React Native","Convex"],    image: exFitness },
];

function Card({ ex }: { ex: Example }) {
  return (
    <article className="w-[420px] shrink-0 mx-3 group rounded-2xl border border-border bg-surface/60 overflow-hidden hover:border-primary/40 transition-all duration-300">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <img
          src={ex.image}
          alt={`${ex.title} — ${ex.tag} preview`}
          loading="lazy"
          width={1280}
          height={800}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-background/90 backdrop-blur text-[10px] font-mono uppercase tracking-wider border border-border">
          {ex.tag}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
            {ex.title}
          </h3>
          <span className="text-[10px] font-mono text-muted-foreground">7 docs</span>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3 line-clamp-2">{ex.desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {ex.stack.map((s) => (
            <span key={s} className="text-[10px] font-mono px-2 py-0.5 rounded bg-background border border-border text-muted-foreground">
              {s}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

function MarqueeRow({ items, reverse }: { items: Example[]; reverse?: boolean }) {
  // Duplicate items for seamless loop (track is 200% wide).
  const loop = [...items, ...items];
  return (
    <div className="marquee py-3">
      <div className={reverse ? "marquee-track-reverse" : "marquee-track"}>
        {loop.map((ex, i) => (
          <Card key={`${ex.title}-${i}`} ex={ex} />
        ))}
      </div>
    </div>
  );
}

function ExamplesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="absolute inset-0 bg-grid opacity-30 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
          <div className="relative mx-auto max-w-6xl px-6 pt-20 pb-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface/60 text-xs text-muted-foreground mb-6">
              <Sparkles className="w-3 h-3 text-primary" />
              Realistic mock-ups · Generated from one line
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold tracking-tight">
              Specs that look like <span className="gradient-text">real products.</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl mx-auto">
              Browse realistic project mock-ups across dating, delivery, SaaS, fintech and more — each generated from a single sentence.
            </p>
          </div>
        </section>

        <section className="py-16 space-y-2">
          <MarqueeRow items={ROW_1} />
          <MarqueeRow items={ROW_2} reverse />
          <MarqueeRow items={ROW_3} />

          <div className="mt-16 text-center">
            <Link to="/build" className="btn-3d">
              Generate your own
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
