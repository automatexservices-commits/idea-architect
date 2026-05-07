Skill: Port fix for local OAuth callbacks

Use this quick skill when local OAuth callbacks fail due to a port mismatch.

What it does
- Checks that `VITE_APP_URL` and provider redirect URIs match the running dev server port.
- If mismatched, update `.env` and restart the dev server.

How to run
1. Open `.env` and set `VITE_APP_URL` and provider redirect URIs to the dev server origin (e.g. `http://localhost:5174`).
2. Restart the dev server:

```
npm run dev -- --port 5174
```

Permanent code fix
- To avoid signup/signup button breakage when SDK behavior changes, update the Google OAuth handler to let the SDK perform the browser redirect and only fallback to a manual `window.location.assign` if the SDK returns a `data.url`.
- In this repo the fix is applied to `src/features/auth/auth.ts` in `signInWithGoogle()`.

When to use
- Local development when OAuth providers return redirect_uri_mismatch errors.
