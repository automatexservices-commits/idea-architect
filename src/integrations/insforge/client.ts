import { createClient } from "@insforge/sdk";

function createInsforgeClient() {
  const baseUrl = import.meta.env.VITE_INSFORGE_BASE_URL ?? import.meta.env.VITE_INSFORGE_URL;
  const anonKey = import.meta.env.VITE_INSFORGE_ANON_KEY ?? import.meta.env.VITE_INSFORGE_API_KEY;

  if (!baseUrl || !anonKey) {
    throw new Error("Missing InsForge env vars. Set VITE_INSFORGE_BASE_URL/VITE_INSFORGE_URL and VITE_INSFORGE_ANON_KEY/VITE_INSFORGE_API_KEY.");
  }

  return createClient({
    baseUrl,
    anonKey,
  });
}

let _insforge: ReturnType<typeof createInsforgeClient> | undefined;

export const insforge = new Proxy({} as ReturnType<typeof createInsforgeClient>, {
  get(_, prop, receiver) {
    if (!_insforge) _insforge = createInsforgeClient();
    return Reflect.get(_insforge, prop, receiver);
  },
});
