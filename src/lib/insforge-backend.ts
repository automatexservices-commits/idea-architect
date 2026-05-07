const BACKEND_SLUG = "backend";

function getConfiguredBaseUrl() {
  const raw = import.meta.env.VITE_INSFORGE_FUNCTIONS_URL ?? import.meta.env.VITE_INSFORGE_BASE_URL ?? import.meta.env.VITE_INSFORGE_URL;
  if (!raw) {
    throw new Error("Missing VITE_INSFORGE_BASE_URL or VITE_INSFORGE_FUNCTIONS_URL");
  }

  return new URL(raw);
}

function joinUrl(base: string, path: string) {
  const cleanBase = base.replace(/\/+$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
}

function deriveInsforgeBases() {
  const url = getConfiguredBaseUrl();
  const origin = `${url.protocol}//${url.host}`;
  const hostname = url.hostname;

  if (hostname.endsWith(".functions.insforge.app")) {
    return [joinUrl(origin, BACKEND_SLUG)];
  }

  if (hostname.endsWith(".insforge.app")) {
    const [appKey, ...rest] = hostname.split(".");
    const region = rest.slice(0, -2).join(".");

    const directHost = `${url.protocol}//${appKey}.functions.insforge.app`;
    const fallbackHost = region ? `${url.protocol}//${appKey}.${region}.insforge.app` : origin;

    return [joinUrl(directHost, BACKEND_SLUG), joinUrl(fallbackHost, `functions/${BACKEND_SLUG}`)];
  }

  return [joinUrl(origin, `functions/${BACKEND_SLUG}`)];
}

export function getInsforgeBackendUrls(path = "") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  // In dev, prefer the local dev proxy so we avoid CORS and hit the
  // configured InsForge host via Vite proxy `/functions`.
  // This keeps production behavior unchanged.
  if (import.meta.env.DEV) {
    const local = `/functions${suffix === "/" ? "" : suffix}`;
    const remote = deriveInsforgeBases().map((base) => `${base}${suffix === "/" ? "" : suffix}`);
    return [local, ...remote];
  }

  return deriveInsforgeBases().map((base) => `${base}${suffix === "/" ? "" : suffix}`);
}

export async function readJsonBody(response: Response) {
  const text = await response.text();
  const trimmed = text.trim();

  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch {
    // If the response isn't valid JSON, sanitize it: strip HTML tags
    // (common when servers return an error HTML page) and return a
    // shortened plain-text error message so the UI doesn't render raw HTML.
    const isHtml = /^\s*<(!doctype|html|head|body|pre|!doctype html)/i.test(trimmed);
    let errorText = trimmed;

    if (isHtml) {
      // crude tag stripper to convert HTML to plain text
      errorText = trimmed.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ");
      errorText = errorText.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ");
      errorText = errorText.replace(/<[^>]+>/g, " ");
      errorText = errorText.replace(/\s+/g, " ").trim();
    }

    return {
      error: errorText.slice(0, 400),
      __nonJson: true,
      __wasHtml: isHtml,
    };
  }
}

export async function requestInsforgeJson<T>(path: string, init: RequestInit = {}, headers: HeadersInit = {}) {
  const urls = getInsforgeBackendUrls(path);

  for (let index = 0; index < urls.length; index += 1) {
    let response: Response;
    try {
      response = await fetch(urls[index], {
        ...init,
        headers: {
          ...(init.headers ?? {}),
          ...headers,
        },
      });
    } catch (error) {
      if (index < urls.length - 1) {
        continue;
      }
      throw error;
    }

    const body = await readJsonBody(response);

    if (response.ok || response.status === 401) {
      return { response, body: body as T | null };
    }

    if (response.status === 404 && index < urls.length - 1) {
      continue;
    }

    return { response, body: body as T | null };
  }

  throw new Error(`Failed to fetch ${path}`);
}

export async function fetchInsforgeJson<T>(path: string, init: RequestInit = {}, headers: HeadersInit = {}) {
  const { response, body } = await requestInsforgeJson<T>(path, init, headers);

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "error" in body && typeof (body as { error?: unknown }).error === "string"
        ? String((body as { error?: string }).error)
        : `Request failed (${response.status})`;

    throw new Error(message);
  }

  return body as T;
}
