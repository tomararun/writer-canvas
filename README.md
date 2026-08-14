# The Writer's Canvas

A complete, self-hosted personal writing platform — portfolio, blog, case
study hub, and learning journal — with a private publishing studio behind it.

**Live site:** https://writer-canvas.tomararun202.workers.dev

> The visible content is still a placeholder persona ("Maya Ellsworth") used
> to design and test the platform. Replace it with your own writing in
> [`src/content/site.ts`](src/content/site.ts) and through the Studio.

## What the platform does

### Public site

- **Home, About, Contact** plus indexes and detail pages for **Writing**
  (essays), **Case studies**, **Learning journal**, and **Projects**
- **Archive** with filters, client-side **Search**, and a designed 404
- **Contact form** that stores messages for the admin (with honeypot
  spam protection) — no submission is ever silently dropped
- **Newsletter signup** collecting subscribers into the database
- **SEO throughout**: absolute canonical URLs, Open Graph + Twitter cards with
  a generated 1200×630 social image, JSON-LD structured data on detail pages,
  **RSS feed**, **sitemap.xml**, and **robots.txt** — all with absolute URLs
  derived from the deployment origin
- **Privacy-friendly first-party analytics**: one row per page view (path +
  referrer only, no cookies, no user identifiers), private routes excluded

### The Studio (`/admin`)

A full CMS behind email/password auth — reachable from the discreet
**Studio** link in the footer:

- **Editorial workflow**: Draft → In review → Scheduled → Published, with
  one-click publish/unpublish
- **Scheduled publishing** that actually fires: a `pg_cron` job inside the
  database publishes due entries every minute — no external services
- **Markdown editor** with live preview; headings, lists, quotes, code and
  images all styled on the public pages
- **Private previews**: secret tokenized links show unpublished work to
  anyone you send them to — the token is the credential
- **Media library**: upload images, copy stable URLs or ready-to-paste
  markdown; files are served through the app (`/media/…`) so links never
  expire regardless of storage-bucket visibility
- **Revision history** with snapshots before every save/delete and
  one-click restore
- **Audit log** of every content action with actor and timestamp
- **Messages inbox** for contact-form submissions (read/unread, delete)
- **Subscriber list** management
- **Traffic report**: 30-day totals, daily bars, top pages — computed
  in-database, raw rows never leave Postgres

### Security model

- **Single admin seat**: the first authenticated account claims it; the
  sign-in page stops offering registration once the seat is taken
- **Role-based access enforced in the database**: every table carries
  row-level-security policies; server functions re-verify the admin role on
  every call — authorization is never UI-only
- **No service-role key anywhere**: previews, scheduled publishing, and the
  contact form run on the publishable key with `SECURITY DEFINER` functions
  that guard themselves. Verified: no email-bearing table is readable
  anonymously
- **Password reset** flow (`/auth` → "Forgot password?" → email link →
  `/auth/reset`)

## Stack

| Layer                     | Choice                                                                                        |
| ------------------------- | --------------------------------------------------------------------------------------------- |
| Framework                 | [TanStack Start](https://tanstack.com/start) (React 19, file-based routing, server functions) |
| Database / Auth / Storage | [Supabase](https://supabase.com) (Postgres with RLS, pg_cron)                                 |
| Styling                   | Tailwind CSS v4, Newsreader + Work Sans                                                       |
| Build / Deploy            | Vite → Nitro → **Cloudflare Workers**                                                         |
| Tests                     | Vitest (unit tests over markdown, URL, and data-mapping logic)                                |

## How it got here

The project began as a Lovable-generated scaffold with polished pages but
several features that looked finished and weren't. It has since been
completed, hardened, and made **fully independent**:

1. **Unwired features fixed** — scheduling had no trigger (added pg_cron),
   the contact form discarded submissions (now stored + inboxed), previews
   and feeds emitted broken or relative URLs (fixed at the root)
2. **Production features added** — password reset, media uploads, first-party
   analytics, honest newsletter copy, OG image, robots.txt, signup
   hardening, unit tests, deployment docs
3. **Independence** — migrated to a self-owned Supabase project (all 9
   migrations + content), replaced the proprietary build wrapper with
   standard Vite plugins, removed all Lovable artifacts and telemetry, and
   deployed to Cloudflare Workers under the owner's own account

## Development

```sh
npm install
npm run dev        # dev server at http://localhost:8080
npm test           # unit tests (Vitest)
npm run lint       # ESLint + Prettier rules
npm run build      # production build (.output/, Cloudflare-ready)
```

Environment variables live in `.env` (safe, publishable values only) — see
the table in [DEPLOYMENT.md](./DEPLOYMENT.md). Secrets (database password,
service-role key for admin scripts) belong in the git-ignored `.env.local`.

Database schema lives in [`supabase/migrations/`](supabase/migrations/) —
every table, policy, function, and the cron job are reproducible from these
files alone.

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for the full runbook: environment
variables, applying migrations, Supabase auth settings, the exact
`wrangler deploy` command, first-run seat claiming, and a post-deploy
smoke-test checklist.

## Repository layout

```
src/
  routes/            file-based routes (public pages, /admin studio,
                     RSS/sitemap/robots/media endpoints, API hooks)
  lib/               server functions, content mappers, markdown, SEO,
                     analytics, tests
  components/        header/footer, cards, prose renderer, UI primitives
  integrations/      Supabase clients (browser, server, auth middleware)
  content/           site metadata + placeholder seed content
supabase/migrations/ complete database schema as SQL
scripts/             OG-image generator
```
