# Deployment guide

Everything the platform needs to go from this repository to a working production site.

## 1. Environment variables

| Variable                        | Required    | Purpose                                                                                  |
| ------------------------------- | ----------- | ---------------------------------------------------------------------------------------- |
| `SUPABASE_URL`                  | yes         | Supabase project URL (server)                                                            |
| `SUPABASE_PUBLISHABLE_KEY`      | yes         | Publishable API key (server)                                                             |
| `VITE_SUPABASE_URL`             | yes         | Same URL, inlined into the client bundle                                                 |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | yes         | Same key, inlined into the client bundle                                                 |
| `VITE_SUPABASE_PROJECT_ID`      | yes         | Project id used by tooling                                                               |
| `SITE_URL`                      | recommended | Absolute origin for RSS, sitemap and robots.txt links (falls back to the request origin) |
| `VITE_SITE_URL`                 | recommended | Absolute origin for canonical links and social-card URLs (falls back to relative paths)  |

The service-role key is **not** needed: previews, scheduled publishing and the
contact form all run on the publishable key with database-side authorization.

## 2. Database migrations

Apply every file in `supabase/migrations/` in filename order. Two ways:

- **Supabase CLI** — `supabase link --project-ref <ref>` then `supabase db push`
  (if direct connections fail on IPv4-only networks, pass the session-pooler
  `--db-url` shown in the dashboard under Connect).
- **SQL editor** — paste each file's contents in order.

The linked project is `fnfxovfmidwiuvlcwqvd` (owned by your Supabase account);
all migrations are already applied there.

What the newer migrations set up: workflow columns and revisions/audit tables,
the pg_cron job that publishes scheduled entries every minute, the
`contact_messages` table, the token-guarded preview RPC, the public `media`
storage bucket, the `page_views` analytics table, and the `admin_seat_taken()`
check used by the sign-in page.

## 3. Supabase dashboard settings

These live outside the repo — set them once per project:

1. **Auth → URL Configuration**: set the Site URL to your domain and add
   `https://<your-domain>/auth/reset` and `https://<your-domain>/admin` to the
   redirect allow-list (password reset and signup confirmation land there).
2. **Auth → Providers → Email**: keep "Confirm email" enabled.
3. **After claiming the admin seat** (step 4): optionally disable public
   sign-ups entirely (Auth → Providers → Email → "Allow new users to sign up").
   The sign-in page already hides account creation once the seat is taken, and
   stray accounts can never reach admin — disabling sign-ups is defence in depth.

## 4. Deploying (Cloudflare Workers)

The production site runs at **https://writer-canvas.tomararun202.workers.dev**.

### Branches

| Branch       | Role                                                          |
| ------------ | ------------------------------------------------------------- |
| `staging`    | Day-to-day work. Each push uploads a preview version.         |
| `production` | The live site. Each push deploys to production automatically. |

To publish: merge `staging` into `production` and push.

```sh
git checkout production
git merge --ff-only staging
git push origin production
git checkout staging
```

### How it deploys

Deploys run on Cloudflare via **Workers Builds** (Git integration). One-time
setup in the Cloudflare dashboard → Workers & Pages → `writer-canvas` →
Settings → Builds:

1. **Connect** the GitHub repo `tomararun/writer-canvas`.
2. **Production branch:** `production`.
3. **Build command:** `npm run build`
4. **Deploy command:** `npx wrangler deploy`
5. **Non-production branch builds:** enabled, with deploy command
   `npx wrangler versions upload` (this gives `staging` preview URLs).

No build variables are needed: the `VITE_*` values come from the committed
`.env`, and the Worker's name, runtime variables and compatibility date come
from the committed [`wrangler.jsonc`](./wrangler.jsonc), which the build merges
into `.output/server/wrangler.json`.

**Previews share the production database.** A staging preview reads and
writes the same Supabase project as the live site — anything published or
deleted from a preview's studio is real.

### Deploying by hand

Still works from any machine (`npx wrangler login` once first):

```sh
npm run build
npx wrangler deploy
```

### Custom domain

When one arrives: add it to the Worker (Settings → Domains), update
`SITE_URL` in `wrangler.jsonc` and `SITE_URL`/`VITE_SITE_URL` in `.env`,
push to `production`, then update the Supabase auth Site URL and redirect
allow-list to match.

## 5. First-run

1. Visit `/auth`, create the studio account, confirm the email.
2. Open `/admin` and **claim the admin seat immediately** — the first
   authenticated account to claim it wins.

## 6. Smoke test

Run through once after every production deploy:

- [ ] Sign in → studio loads with all tabs.
- [ ] Create a draft essay → "Open private preview" shows it while unpublished.
- [ ] Publish it → appears on `/writing`, in `/rss.xml` and `/sitemap.xml` with absolute URLs.
- [ ] Schedule a second entry 2 minutes out → it flips to Published on its own (pg_cron).
- [ ] Submit the contact form → appears under Studio → Messages.
- [ ] Upload an image under Studio → Media → paste markdown into a draft → renders on the page.
- [ ] Browse a few public pages → counts appear under Studio → Traffic.
- [ ] Check `/robots.txt` references your sitemap.

## 7. Media storage

Uploaded images are served through the app's own `/media/<file>` route rather
than direct storage URLs, so it makes no difference whether the `media` bucket
is public or private (some workspaces force private buckets). Links copied
from Studio → Media are stable and never expire.

## 8. Assets

The social-sharing card is `public/og-default.png`. After replacing the
placeholder content with your own name and tagline, regenerate it with
`scripts/make-og-image.ps1` (Windows) or any 1200×630 PNG.
