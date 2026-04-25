import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Sparkles, Heart, Bike, BarChart3, Wallet, PlayCircle,
  GraduationCap, ShoppingBag, Stethoscope, Star, Search, MapPin, Plus,
  TrendingUp, Send, BookOpen, Dumbbell,
} from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

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

/* ─────────────────────────── Mini website mocks ───────────────────────────
   Each mock is a self-contained SVG/JSX miniature that *resembles* a real
   product UI. They are decorative previews only — not interactive links.
   ────────────────────────────────────────────────────────────────────────── */

function MockChrome({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl overflow-hidden border border-border/80 bg-white shadow-[0_8px_24px_-12px_oklch(0.5_0.05_150/0.25)]">
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[oklch(0.97_0.005_150)] border-b border-border/60">
        <span className="w-2 h-2 rounded-full bg-[#ff5f57]" />
        <span className="w-2 h-2 rounded-full bg-[#febc2e]" />
        <span className="w-2 h-2 rounded-full bg-[#28c840]" />
        <span className="ml-2 flex-1 text-[10px] font-mono text-muted-foreground truncate">{url}</span>
      </div>
      <div className="h-[200px] relative overflow-hidden">{children}</div>
    </div>
  );
}

/* ───── Dating App ───── */
function DatingMock() {
  return (
    <MockChrome url="lumr.app/discover">
      <div className="absolute inset-0 bg-gradient-to-br from-[#ffe4ec] via-white to-[#ffd1dc] p-3 flex gap-3">
        <div className="w-[42%] rounded-2xl bg-gradient-to-br from-[#ff5d8f] to-[#ff8fb1] relative overflow-hidden shadow-lg">
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-full bg-white/90 text-[8px] font-semibold text-[#d6336c]">98% match</div>
          <div className="absolute bottom-2 left-2 right-2 text-white">
            <div className="text-[11px] font-bold">Aanya, 24</div>
            <div className="text-[8px] opacity-90 flex items-center gap-1"><MapPin className="w-2 h-2" /> 2 km away</div>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <div className="text-[10px] font-bold text-[#d6336c] flex items-center gap-1"><Heart className="w-3 h-3 fill-[#d6336c]" /> Lumr</div>
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center gap-2 p-1.5 rounded-lg bg-white/80 border border-pink-100">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-300 to-rose-400" />
              <div className="flex-1">
                <div className="h-1.5 w-12 bg-pink-200 rounded" />
                <div className="h-1 w-16 bg-pink-100 rounded mt-1" />
              </div>
              <Heart className="w-3 h-3 text-pink-400" />
            </div>
          ))}
          <div className="flex gap-1 mt-1">
            <div className="flex-1 h-6 rounded-lg bg-white/90 border border-pink-200" />
            <div className="w-6 h-6 rounded-lg bg-[#ff5d8f] flex items-center justify-center"><Heart className="w-3 h-3 text-white fill-white" /></div>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── Food Delivery ───── */
function DeliveryMock() {
  return (
    <MockChrome url="zipeats.in/restaurants">
      <div className="absolute inset-0 bg-[#fff8f0] p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#ff6b35] flex items-center justify-center"><Bike className="w-3 h-3 text-white" /></div>
          <div className="text-[11px] font-bold text-[#ff6b35]">ZipEats</div>
          <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-100 text-[8px] text-[#ff6b35]"><MapPin className="w-2 h-2" /> Mumbai</div>
        </div>
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white border border-orange-100">
          <Search className="w-3 h-3 text-orange-400" />
          <div className="text-[9px] text-muted-foreground">Search "biryani"</div>
        </div>
        <div className="grid grid-cols-3 gap-1.5 flex-1">
          {[
            { name: "Pizza Hub", c: "from-red-300 to-orange-400" },
            { name: "Sushi Co", c: "from-rose-300 to-pink-400" },
            { name: "Burger Lab", c: "from-amber-300 to-orange-500" },
          ].map((r, i) => (
            <div key={i} className="rounded-lg overflow-hidden bg-white border border-orange-100">
              <div className={`h-10 bg-gradient-to-br ${r.c}`} />
              <div className="p-1">
                <div className="text-[8px] font-semibold">{r.name}</div>
                <div className="flex items-center gap-0.5 text-[7px] text-muted-foreground">
                  <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" /> 4.{5+i} · 25 min
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-[#ff6b35] text-white">
          <span className="text-[9px] font-semibold">2 items</span>
          <span className="text-[9px] font-bold">₹ 348 →</span>
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── SaaS Dashboard ───── */
function SaasMock() {
  return (
    <MockChrome url="app.metricly.io/dashboard">
      <div className="absolute inset-0 bg-[#fafbff] flex">
        <div className="w-[22%] bg-[#0f172a] p-2 space-y-1.5">
          <div className="text-[9px] font-bold text-white flex items-center gap-1"><BarChart3 className="w-2.5 h-2.5 text-violet-400" /> Metricly</div>
          {["Overview","Reports","Users","Billing","Settings"].map((l,i) => (
            <div key={i} className={`text-[8px] px-1.5 py-1 rounded ${i===0?"bg-violet-500/30 text-violet-200":"text-slate-400"}`}>{l}</div>
          ))}
        </div>
        <div className="flex-1 p-2 space-y-2">
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { l: "MRR", v: "$48.2k", up: "+12%" },
              { l: "Users", v: "12,847", up: "+8%" },
              { l: "Churn", v: "2.1%", up: "-0.4%" },
            ].map((k,i) => (
              <div key={i} className="p-1.5 rounded-md bg-white border border-slate-200">
                <div className="text-[7px] text-slate-500">{k.l}</div>
                <div className="text-[10px] font-bold text-slate-900">{k.v}</div>
                <div className="text-[7px] text-emerald-600 flex items-center gap-0.5"><TrendingUp className="w-2 h-2" />{k.up}</div>
              </div>
            ))}
          </div>
          <div className="rounded-md bg-white border border-slate-200 p-2 h-[88px] relative overflow-hidden">
            <div className="text-[8px] text-slate-500 mb-1">Revenue · 30d</div>
            <svg viewBox="0 0 200 60" className="w-full h-12">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,45 L20,40 L40,42 L60,30 L80,32 L100,22 L120,25 L140,15 L160,18 L180,8 L200,10 L200,60 L0,60 Z" fill="url(#g1)" />
              <path d="M0,45 L20,40 L40,42 L60,30 L80,32 L100,22 L120,25 L140,15 L160,18 L180,8 L200,10" fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── Fintech ───── */
function FintechMock() {
  return (
    <MockChrome url="paywave.app/wallet">
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0e27] to-[#1a1f4a] p-3 flex gap-2">
        <div className="w-[55%] space-y-2">
          <div className="rounded-xl p-2 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 text-white shadow-lg">
            <div className="text-[7px] opacity-80">Total balance</div>
            <div className="text-[14px] font-bold">₹ 1,24,580.50</div>
            <div className="flex items-center gap-1 mt-2">
              <div className="text-[8px] font-mono opacity-90">•••• 4829</div>
              <Wallet className="w-3 h-3 ml-auto opacity-80" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {["Send","Pay","Top-up"].map((a,i) => (
              <div key={i} className="rounded-lg bg-white/10 p-1.5 text-center">
                <Send className="w-3 h-3 text-violet-300 mx-auto" />
                <div className="text-[7px] text-white/80 mt-0.5">{a}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-[8px] text-white/70 font-semibold">Recent</div>
          {[
            { n:"Swiggy", a:"-₹420", c:"text-rose-300" },
            { n:"Salary", a:"+₹85k", c:"text-emerald-300" },
            { n:"Netflix", a:"-₹649", c:"text-rose-300" },
            { n:"Atul P.", a:"+₹2.5k", c:"text-emerald-300" },
          ].map((t,i) => (
            <div key={i} className="flex items-center gap-1.5 p-1 rounded bg-white/5">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-violet-400 to-pink-400" />
              <div className="text-[8px] text-white/90 flex-1">{t.n}</div>
              <div className={`text-[8px] font-bold ${t.c}`}>{t.a}</div>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── Streaming ───── */
function StreamingMock() {
  return (
    <MockChrome url="streamly.tv/browse">
      <div className="absolute inset-0 bg-[#0a0a0a] p-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-black text-red-500">STREAMLY</div>
          <div className="ml-auto flex gap-2 text-[7px] text-white/70">
            <span>Home</span><span>Movies</span><span>Series</span>
          </div>
        </div>
        <div className="rounded-lg h-16 bg-gradient-to-r from-red-700 via-orange-600 to-purple-700 relative overflow-hidden">
          <div className="absolute bottom-1.5 left-2">
            <div className="text-[10px] font-bold text-white">The Last Frontier</div>
            <div className="flex items-center gap-1 mt-0.5">
              <PlayCircle className="w-3 h-3 text-white" />
              <span className="text-[7px] text-white/90 font-semibold">Play · S2 E4</span>
            </div>
          </div>
        </div>
        <div>
          <div className="text-[8px] text-white/80 font-semibold mb-1">Trending</div>
          <div className="flex gap-1.5 overflow-hidden">
            {["from-blue-600 to-cyan-500","from-rose-600 to-pink-500","from-amber-600 to-orange-500","from-emerald-600 to-teal-500","from-fuchsia-600 to-violet-500"].map((c,i) => (
              <div key={i} className={`w-12 h-14 rounded-md shrink-0 bg-gradient-to-br ${c} relative`}>
                <div className="absolute top-0.5 left-0.5 text-[7px] font-black text-white/90">#{i+1}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── Edtech ───── */
function EduMock() {
  return (
    <MockChrome url="learnq.io/courses">
      <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] to-white p-2.5 space-y-2">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center"><GraduationCap className="w-3 h-3 text-white" /></div>
          <div className="text-[10px] font-bold text-indigo-700">LearnQ</div>
          <div className="ml-auto flex items-center gap-1 text-[8px] text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">🔥 7-day streak</div>
        </div>
        <div className="rounded-lg bg-white border border-indigo-100 p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-2.5 h-2.5 text-indigo-500" />
            <div className="text-[9px] font-semibold">Calculus · Chapter 4</div>
            <div className="ml-auto text-[7px] text-indigo-600 font-bold">62%</div>
          </div>
          <div className="h-1 bg-indigo-100 rounded-full overflow-hidden">
            <div className="h-full w-[62%] bg-gradient-to-r from-indigo-500 to-violet-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { t:"Quiz: Limits", c:"from-indigo-400 to-blue-500", n:"12 Q" },
            { t:"Live Class", c:"from-violet-400 to-fuchsia-500", n:"7pm" },
            { t:"Flashcards", c:"from-emerald-400 to-teal-500", n:"24 cards" },
            { t:"Mock Test", c:"from-orange-400 to-rose-500", n:"60 min" },
          ].map((x,i) => (
            <div key={i} className={`rounded-md p-1.5 bg-gradient-to-br ${x.c} text-white`}>
              <div className="text-[8px] font-bold">{x.t}</div>
              <div className="text-[7px] opacity-90">{x.n}</div>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── E-commerce ───── */
function ShopMock() {
  return (
    <MockChrome url="kart9.shop/new-arrivals">
      <div className="absolute inset-0 bg-white p-2 space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="text-[11px] font-black tracking-tight">kart<span className="text-emerald-600">9</span></div>
          <div className="flex-1 h-4 rounded-full bg-slate-100 px-2 flex items-center text-[7px] text-slate-400">Search products...</div>
          <ShoppingBag className="w-3 h-3 text-slate-700" />
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { c:"from-stone-300 to-stone-500", p:"₹1,299", n:"Linen Shirt" },
            { c:"from-amber-200 to-orange-400", p:"₹2,499", n:"Tote Bag" },
            { c:"from-slate-700 to-slate-900", p:"₹4,999", n:"Sneakers" },
            { c:"from-rose-300 to-pink-500", p:"₹899",  n:"Dress" },
            { c:"from-emerald-300 to-teal-500", p:"₹1,799", n:"Backpack" },
            { c:"from-blue-400 to-indigo-600", p:"₹3,299", n:"Watch" },
          ].map((p,i) => (
            <div key={i} className="rounded-md overflow-hidden border border-slate-100">
              <div className={`h-10 bg-gradient-to-br ${p.c}`} />
              <div className="px-1 py-0.5">
                <div className="text-[7px] font-semibold truncate">{p.n}</div>
                <div className="text-[7px] text-emerald-700 font-bold">{p.p}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── Health / Telemedicine ───── */
function HealthMock() {
  return (
    <MockChrome url="medico.health/consult">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e0f7fa] to-white p-2.5 flex gap-2">
        <div className="w-[45%] space-y-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-lg bg-teal-500 flex items-center justify-center"><Stethoscope className="w-3 h-3 text-white" /></div>
            <div className="text-[10px] font-bold text-teal-700">Medico</div>
          </div>
          <div className="rounded-lg bg-white border border-teal-100 p-2">
            <div className="text-[7px] text-slate-500">Next consult</div>
            <div className="text-[9px] font-bold">Dr. Reema · Cardio</div>
            <div className="text-[7px] text-teal-600 font-semibold mt-0.5">Today · 6:30 PM</div>
            <div className="mt-1.5 px-1.5 py-1 rounded-md bg-teal-500 text-white text-[7px] text-center font-bold">Join video</div>
          </div>
          <div className="rounded-lg bg-white border border-teal-100 p-2">
            <div className="text-[7px] text-slate-500">Heart rate</div>
            <div className="text-[10px] font-bold">72 <span className="text-[7px] font-normal text-slate-500">bpm</span></div>
            <svg viewBox="0 0 80 16" className="w-full h-3 mt-0.5">
              <path d="M0,8 L15,8 L20,3 L25,13 L30,8 L45,8 L50,3 L55,13 L60,8 L80,8" fill="none" stroke="#14b8a6" strokeWidth="1" />
            </svg>
          </div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="text-[8px] font-semibold text-slate-700">Specialists</div>
          {["Dermatology","Pediatrics","General","Mental"].map((s,i) => (
            <div key={i} className="flex items-center gap-1.5 p-1 rounded bg-white border border-teal-50">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-300 to-cyan-500" />
              <div className="text-[8px] flex-1">{s}</div>
              <Plus className="w-2.5 h-2.5 text-teal-500" />
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

/* ───── Fitness ───── */
function FitnessMock() {
  return (
    <MockChrome url="repsly.app/workout">
      <div className="absolute inset-0 bg-[#0a0a0a] p-2.5 space-y-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-lg bg-lime-400 flex items-center justify-center"><Dumbbell className="w-3 h-3 text-black" /></div>
          <div className="text-[10px] font-black text-lime-400 tracking-wide">REPSLY</div>
          <div className="ml-auto text-[7px] text-white/60">Day 12 / 30</div>
        </div>
        <div className="rounded-lg p-2 bg-gradient-to-br from-lime-400 to-emerald-500 text-black">
          <div className="text-[7px] font-bold opacity-80">Today's push</div>
          <div className="text-[12px] font-black">Upper Body · 45 min</div>
          <div className="text-[8px] mt-0.5">6 exercises · 18 sets · 320 kcal</div>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { e:"Bench Press", s:"4 × 8" },
            { e:"Pull-ups", s:"4 × 10" },
            { e:"Shoulder Press", s:"3 × 12" },
            { e:"Bicep Curls", s:"3 × 12" },
          ].map((x,i) => (
            <div key={i} className="rounded p-1.5 bg-white/5 border border-white/10">
              <div className="text-[8px] font-semibold text-white">{x.e}</div>
              <div className="text-[7px] text-lime-400 font-mono">{x.s}</div>
            </div>
          ))}
        </div>
      </div>
    </MockChrome>
  );
}

const EXAMPLES = [
  { tag: "Dating",     title: "Lumr",       desc: "Swipe-first dating app with AI ice-breakers and 98% match scoring on shared values.", stack: ["React Native","Supabase","OpenAI"], Mock: DatingMock },
  { tag: "Delivery",   title: "ZipEats",    desc: "Hyperlocal food delivery with 25-min ETA, live driver tracking, and UPI checkout.",   stack: ["Next.js","Mapbox","Razorpay"],     Mock: DeliveryMock },
  { tag: "SaaS",       title: "Metricly",   desc: "Analytics dashboard for indie SaaS founders — MRR, churn, cohorts in one view.",     stack: ["React","Postgres","ClickHouse"],   Mock: SaasMock },
  { tag: "Fintech",    title: "PayWave",    desc: "UPI-native wallet with instant P2P, bills, and a virtual debit card for India.",     stack: ["Flutter","Node","UPI APIs"],       Mock: FintechMock },
  { tag: "Streaming",  title: "Streamly",   desc: "Subscription video platform with adaptive bitrate, watchlists, and offline playback.",stack: ["Next.js","HLS","CloudFront"],     Mock: StreamingMock },
  { tag: "Edtech",     title: "LearnQ",     desc: "Adaptive learning with quizzes, live classes, and streak-based gamification.",       stack: ["React","Supabase","LiveKit"],       Mock: EduMock },
  { tag: "E-commerce", title: "kart9",      desc: "Headless storefront with sub-second search, wishlist, and one-tap checkout.",        stack: ["Remix","Algolia","Stripe"],        Mock: ShopMock },
  { tag: "Health",     title: "Medico",     desc: "Telemedicine app with video consults, prescriptions, and wearables sync.",            stack: ["Expo","Twilio","HealthKit"],       Mock: HealthMock },
  { tag: "Fitness",    title: "Repsly",     desc: "30-day workout programs with AI form-check and progressive overload tracking.",       stack: ["React Native","TensorFlow","Convex"], Mock: FitnessMock },
];

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

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {EXAMPLES.map((ex, i) => {
                const Mock = ex.Mock;
                return (
                  <article
                    key={i}
                    className="group relative overflow-hidden rounded-2xl border border-border bg-surface/60 hover:border-primary/40 transition-all hover:-translate-y-1 duration-300"
                  >
                    <div className="p-4 pb-0">
                      <Mock />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-md bg-accent text-accent-foreground border border-primary/20">
                          {ex.tag}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">7 docs</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold mb-1.5 group-hover:text-primary transition-colors">
                        {ex.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">{ex.desc}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ex.stack.map((s) => (
                          <span key={s} className="text-[10px] font-mono px-2 py-1 rounded bg-background border border-border text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-16 text-center">
              <Link to="/build" className="btn-3d">
                Generate your own
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
