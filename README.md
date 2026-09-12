# My LLM — iPhone remote LLM PWA

This project is designed for an iPhone-only setup.

Architecture:
iPhone PWA -> Cloudflare Worker -> OpenRouter -> remote model

The OpenRouter API key is stored as a Cloudflare Worker secret, not in the browser.

## Cloudflare setup

1. Create a Cloudflare account.
2. Create a Worker.
3. Paste `worker.js` into the Worker editor and deploy.
4. Add a Worker secret named `OPENROUTER_API_KEY`.
5. Put the Worker URL into the app Settings.
6. Open `index.html` from a hosted HTTPS location and add it to the iPhone Home Screen.

## Important

Only select models that are actually free/available on your OpenRouter account. Free-model availability and limits can change.

For production use, restrict CORS to your own app origin and add authentication/rate limiting.
