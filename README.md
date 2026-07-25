# Ledger — Personal Finance Tracker

A full-stack personal finance tracker: authentication, transactions, budgets,
categories, and reports & analytics, built with Next.js.

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + hand-built shadcn-style component library (Radix UI primitives)
- **Drizzle ORM** + **SQLite** (via `better-sqlite3`) — a real embedded SQL database, zero external setup
- **NextAuth v5** (Credentials provider, JWT sessions, bcrypt password hashing)
- **TanStack Query** for data fetching, caching, and optimistic updates
- **Recharts** for charts
- **Zod** + **React Hook Form** for validation
- **Sonner** for toasts

> **Note on the stack:** the brief asked for Prisma + PostgreSQL. This project
> uses Drizzle + SQLite instead, for one practical reason: it runs immediately
> with `npm install` and no external database server, Docker container, or
> connection string to configure. The schema (`src/db/schema.ts`) is simple to
> port to Postgres later — swap `drizzle-orm/better-sqlite3` for
> `drizzle-orm/node-postgres`, adjust the few SQLite-specific column types, and
> point `DATABASE_PATH` at a `DATABASE_URL` instead. Everything else (API
> routes, queries, business logic) is unaffected because it goes through Drizzle's
> query builder, not raw SQL.

## Getting started

```bash
npm install
cp .env.example .env.local   # then edit AUTH_SECRET (see below)
npm run db:push              # create the SQLite database + tables
npm run db:seed              # seed demo user, 6 months of transactions, budgets, etc.
npm run dev
```

Visit `http://localhost:3000`. Sign in with the seeded demo account:

```
email:    demo@ledger.app
password: demodemo
```

Or create your own account from the sign-up page.

### Generating `AUTH_SECRET`

```bash
openssl rand -base64 32
```

Paste the output into `.env.local` as `AUTH_SECRET`.

### Running in production

```bash
npm run build
npm run start
```

If you deploy behind a reverse proxy / non-standard host, keep
`AUTH_TRUST_HOST=true` in your environment (already set in `.env.example`).

## Project structure

```
src/
  app/
    (auth)/            Login, signup, forgot/reset password
    dashboard/          Sidebar-nav'd app: overview, transactions, budgets,
                         categories, reports, profile, settings
    api/                REST routes for every resource
  components/
    ui/                 Hand-built shadcn-style primitives (Button, Card, Dialog, ...)
    dashboard/          Sidebar, topbar, stat cards, notifications, search
    transactions/       Table, filters, create/edit dialog
    budgets/            Budget cards, create/edit dialog
    categories/         Category cards, create/edit dialog
    charts/             Recharts wrappers (pie, bar, area, calendar heatmap)
  db/
    schema.ts           Drizzle schema (users, transactions, budgets, categories, ...)
    seed.ts              Demo data generator
  hooks/                 TanStack Query hooks per resource, with optimistic updates
  lib/                   Zod schemas, utils, notification logic, report aggregation
  auth.ts / auth.config.ts   NextAuth setup (split for Edge-safe middleware)
  middleware.ts           Route protection
```

