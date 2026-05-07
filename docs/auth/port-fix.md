Fixing local OAuth redirect port mismatch

Problem
- During local development the Vite dev server ran on port `5174` while environment variables pointed at `http://localhost:8081`. OAuth providers reject the callback when the redirect URI doesn't match.

Solution
- Ensure `VITE_APP_URL` and any `*_REDIRECT_URI` values in `.env` match the actual dev server host:port.
- For this project, set `VITE_APP_URL=http://localhost:5174` and `GOOGLE_REDIRECT_URI=http://localhost:5174/auth/google/callback` and restart the dev server.

Steps
1. Update `.env` with the correct port (5174).
2. Restart the dev server: `npm run dev -- --port 5174`.
3. Confirm the OAuth provider's allowed redirect URI includes `http://localhost:5174/auth/google/callback`.

Notes
- If you prefer a different local port, keep `.env` and the provider's redirect URI in sync.
- For CI or deployed environments, set production URLs in a separate env file or secrets store.
