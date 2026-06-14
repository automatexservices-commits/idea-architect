const FALLBACK_SITE_URL = "https://plannr.in";
const SITE_URL = (
  import.meta.env.VITE_APP_URL ||
  import.meta.env.VITE_SITE_URL ||
  FALLBACK_SITE_URL
).replace(/\/+$/, "");
const DEFAULT_OG_IMAGE =
  "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3376e456-7d36-452e-97ca-7205f77bafa5/id-preview-5a036a14--ad20b996-2401-4e85-8968-55b0d919e141.lovable.app-1777460823725.png";
const PRIVATE_ROUTE_PREFIXES = [
  "/welcome",
  "/build",
  "/billing",
  "/profile",
  "/account",
  "/dashboard",
  "/auth/",
];

export function getSiteUrl() {
  return SITE_URL;
}

export function getCanonicalUrl(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${SITE_URL}${normalizedPath === "/" ? "/" : normalizedPath}`;
}

export function isPrivateRoutePath(pathname = "/") {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    prefix.endsWith("/") ? normalizedPath.startsWith(prefix) : normalizedPath === prefix,
  );
}

export function getRobotsContent(pathname = "/") {
  return isPrivateRoutePath(pathname) ? "noindex, nofollow, noarchive" : "index, follow";
}

export function buildSeoHead({
  title,
  description,
  pathname,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  schema,
}: {
  title: string;
  description: string;
  pathname: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  schema?: Record<string, unknown> | Array<Record<string, unknown>>;
}) {
  const canonical = getCanonicalUrl(pathname);

  return {
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: noindex ? "noindex, nofollow, noarchive" : getRobotsContent(pathname),
      },
      { property: "og:type", content: type },
      { property: "og:site_name", content: "PLANNR" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: canonical },
      { property: "og:image", content: image },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@plannrdev" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },
      ...(schema ? [{ "script:ld+json": schema }] : []),
    ],
    links: [{ rel: "canonical", href: canonical }],
  };
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PLANNR",
  url: getSiteUrl(),
  logo: `${getSiteUrl()}/assets/plannr-logo.png`,
  description:
    "PLANNR helps founders and teams turn ideas into PRDs, architecture, and software specifications.",
  sameAs: ["https://instagram.com/plannr.dev"],
};

export const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PLANNR",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Web",
  url: getSiteUrl(),
  description:
    "AI PRD generator and software specification tool for vibe coding, startup planning, and product discovery.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "INR",
  },
  featureList: [
    "AI PRD generator",
    "Product requirements document generator",
    "AI software architect",
    "Startup planning tool",
    "Software specification generator",
  ],
};
