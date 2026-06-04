// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import pkg from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";

const { defineConfig } = pkg as any;

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const rawTarget = env.VITE_INSFORGE_FUNCTIONS_URL || env.VITE_INSFORGE_BASE_URL || env.VITE_INSFORGE_URL;
	const target = rawTarget
		? (() => {
			try {
				const url = new URL(rawTarget);
				const hostname = url.hostname;
				if (hostname.endsWith(".insforge.app") && !hostname.endsWith(".functions.insforge.app")) {
					const [appKey] = hostname.split(".");
					return `${url.protocol}//${appKey}.functions.insforge.app`;
				}
				return `${url.protocol}//${url.host}`;
			} catch {
				return rawTarget;
			}
		})()
		: undefined;

	return {
		cloudflare: false,
		plugins: [nitro()],
		vite: {
			server: {
				port: 5173,
				strictPort: true,
				proxy: target
					? {
						"/functions": {
							target,
							changeOrigin: true,
							secure: false,
							rewrite: (path) => path.replace(/^\/functions/, ""),
						},
					}
					: undefined,
			},
		},
	};
});
