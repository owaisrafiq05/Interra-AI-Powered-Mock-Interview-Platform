# Full-stack starter

## What's included

- **API** — Node.js, Express, MongoDB (`server/`)
- **Admin** — Next.js, Tailwind, shadcn-style UI (`client/`)

## Preserved for reuse

- Authentication (register, login, logout, current user, JWT cookie)
- Auth middleware (`verifyAuth`) and optional auth middleware
- Error handling middleware, CORS, Helmet, Morgan
- Paginated admin users list (admin role)
- Next.js route middleware, React Query, theme toggle, notifications shell

## Run locally

Configure `.env` in `server/` and `client/` (API URL, MongoDB, JWT secrets), then:

```bash
cd server && npm install && npm run dev
cd client && npm install && npm run dev
```

Docker: `docker compose up` (admin + API).
