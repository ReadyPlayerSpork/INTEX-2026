# Security verification (TLS, headers, edge vs application)

This project is typically deployed with **TLS terminated at the edge** (for example Cloudflare Tunnel to Dokploy). The ASP.NET backend **intentionally omits** `UseHttpsRedirection()` and `UseHsts()` in `Program.cs` when traffic behind the tunnel is plain HTTP, to avoid redirect loops. See root `CLAUDE.md` for deployment context.

## What each layer proves

| Layer | Responsibility |
|--------|----------------|
| **Edge / CDN** | Public HTTPS, HTTP→HTTPS redirects, optional HSTS, WAF |
| **Frontend static host** | Serves HTML; may set its own `Content-Security-Policy` for document responses |
| **Backend API** | `SecurityHeaders.cs` CSP and related headers on **API responses** (not the Vite `index.html` unless the API serves it) |

## Manual checks (replace with your production host)

```bash
# HTTP should redirect to HTTPS (if edge is configured to redirect)
curl -sI http://YOUR_DOMAIN/

# HTTPS response headers
curl -sI https://YOUR_DOMAIN/

# API health (if exposed)
curl -sI https://YOUR_DOMAIN/api/...
```

Inspect for:

- `strict-transport-security` on HTTPS responses (often set at edge)
- `content-security-policy` on HTML vs API (may differ)
- `x-content-type-options`, `x-frame-options` (backend sets several; edge may add more)

## Local development

- Backend: `https://localhost:7229` (use `--launch-profile https`).
- Vite proxies `/api` to that URL; browser sees a single origin for dev.

Document edge-specific settings in your team’s deployment runbook (Cloudflare/Dokploy), not only in application code.
