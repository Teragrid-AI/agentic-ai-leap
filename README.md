# Teragrid-AI/agentic-ai-leap

Landing page + lead capture for **The Agentic AI Leap** — AITG × Akamai launch event, 3 Nov 2026, Marriott Hotel Penang.

- Static HTML/CSS/JS served by nginx (Pattern B, no SSR).
- Registration form POSTs to the Teragrid CRM public lead API: `https://crm.aitg.com.my/api/lead` (`companyCode: teragrid-demo`) — leads land as CRM Contacts with `source=EVENT`, tag `agentic-ai-leap-2026`.
- Countdown, ascend particle canvas (respects `prefers-reduced-motion`), `.ics` + Google Calendar links, AIBot widget (`data-key="aitg"`), PDPA privacy + terms pages.
- Palette matches the event poster: cosmic black → navy, orange #ff6a2b, cyan #7fd8ff.

## Deploy
See `teragrid-site-deployment` skill: docker build → swarm service → Traefik dynamic config → DNS (leap.aitg.com.my → 187.127.111.17, Cloudflare proxied, Full strict).

## Local test
`python3 -m http.server 8080` in this dir (form POST will fail locally unless CRM CORS allows the origin — it does, `Access-Control-Allow-Origin: *`).
