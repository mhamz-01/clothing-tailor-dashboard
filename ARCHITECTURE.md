# Architecture

Paradise Tailor Dashboard — a Next.js 16 (App Router) admin panel for a tailoring
business: assigning work to tailors, tracking deliveries, and viewing order
history, backed by Supabase (Postgres + Auth-less custom JWT sessions).

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Data | Supabase (Postgres), `@supabase/supabase-js` / `@supabase/ssr` |
| Server state | TanStack Query v5 |
| Styling | Tailwind CSS v4 + shadcn-style primitives (`components/ui`) |
| Auth | Custom JWT (`jose`), httpOnly cookies — **not** Supabase Auth |

## Request flow (mental model)

```
Browser
  │
  ▼
proxy.ts ──(no/invalid auth_token cookie)──▶ redirect to /login
  │ (valid cookie)
  ▼
app/(admin)/**/page.tsx  ("use client")
  │  calls
  ▼
hooks/<feature>/use-*.ts   (TanStack Query wrappers)
  │  calls
  ▼
lib/queries/<domain>.ts    (pure Supabase I/O, no React/UI)
  │
  ▼
Supabase (Postgres)
```

Two independent things are protected by two independent JWTs:

- **Admin session** (`auth_token` cookie) — logs into the day-to-day dashboard
  (`/dashboard`, `/orders/*`, `/tailors/*`, `/history`). Credentials live in the
  `admin_credentials` table, checked in `app/api/auth/login/route.ts`.
  Enforced by `proxy.ts` for the routes listed in its `matcher`.
- **Superadmin session** (`superadmin_token` cookie) — manages the
  `admin_credentials` table itself (`/superadmin`). Credentials are a single
  username/password pair in server-only env vars (`SUPER_USERNAME` /
  `SUPER_PASSWORD`), checked in `app/api/auth/superadmin-login/route.ts`.
  Enforced per-request inside the `/api/superadmin/*` route handlers via
  `lib/auth/superadmin.ts`, not by `proxy.ts`.

These two systems are intentionally separate — a compromised admin account
should never grant superadmin capability, and vice versa.

## Directory guide

### `app/` — routes (Next.js App Router)

- **`(admin)/`** — route group for the authenticated dashboard shell. Shares
  `layout.tsx` (sidebar + a single `QueryClientProvider` for the whole group).
  - `dashboard/` — stats overview + quick actions
  - `orders/assign/` — assign new orders to tailors, and manage/reassign
    already-assigned orders (two tabs on one page)
  - `orders/deliver/` — search assigned orders, stage them, confirm delivery
  - `tailors/add/` — register a new tailor
  - `history/` — searchable/filterable order history table
- **`(auth)/login/`** — the admin login page (public, redirected to by
  `proxy.ts` when `auth_token` is missing/invalid)
- **`superadmin/`** — standalone route (its own `layout.tsx` +
  `QueryClientProvider`, outside the `(admin)` group since it uses a different
  session/cookie entirely)
- **`api/`** — route handlers, no UI:
  - `auth/login`, `auth/logout` — admin session issuance/teardown
  - `auth/superadmin-login`, `auth/superadmin-logout`, `auth/superadmin-session`
    — superadmin session issuance/teardown/check
  - `superadmin/admins/`, `superadmin/admins/[id]/` — admin-user CRUD, gated by
    the superadmin session, using the Supabase **service-role** key (bypasses
    RLS deliberately, since only a verified superadmin can reach these)
  - `keepalive/` — cron-hit endpoint (see `vercel.json`) that pings Supabase so
    a free-tier project doesn't pause from inactivity

### `components/` — UI, grouped by feature (mirrors `hooks/`)

- `assign-work/`, `deliver-work/`, `history/` — presentational components for
  each page above; each folder owns its tables, rows, panels, and small
  page-local pieces (headers, footers, dialogs)
- `stats-card/`, `quick-action-button/` — small reusable pieces used on the
  dashboard
- `sidebar.tsx`, `footer.tsx` — app chrome
- `ui/` — generic, feature-agnostic primitives (button, input, table, dialog,
  skeletons, etc.) in the shadcn convention. Feature components should build on
  these rather than hand-rolling markup (e.g. all data tables render through
  `ui/table.tsx`'s `Table`/`TableRow`/`TableCell`, not raw `<table>` tags).

### `hooks/` — stateful logic, grouped by feature (mirrors `components/`)

- `assign-work/`, `deliver-work/`, `history/`, `tailors/`, `superadmin/` — each
  folder's hooks wrap `lib/queries/<domain>.ts` calls in TanStack Query
  (`useQuery`/`useMutation`), plus any page-local client state (staged orders,
  form state, filters)
- `shared/` — cross-feature hooks with no domain knowledge: `use-toast`,
  `use-debounced-value`, `use-combobox-search`, `use-mobile`

Convention: a hook here should not call Supabase directly — it calls a
function from `lib/queries/`. Query keys used in `useQuery`/`invalidateQueries`
come from `lib/queries/keys.ts` (`queryKeys.*`), not inline string literals.

### `lib/` — framework-agnostic logic, no React

- **`queries/`** — the data-access layer; the *only* place that talks to
  Supabase. One module per domain: `tailors.ts`, `orders.ts`, `dashboard.ts`,
  `history.ts`, `admins.ts` (service-role only, used solely by
  `api/superadmin/*` routes — deliberately excluded from `index.ts`'s barrel so
  it can never be pulled into client-bundled code), `shared.ts`
  (`normalizeTailorJoin` — un-nests Supabase's joined-row arrays), `keys.ts`
  (query-key factory)
- **`supabase/`** — client factories: `client.ts` (browser), `server.ts`
  (server components, cookie-aware), `service.ts` (service-role, server-only),
  `env.ts` (shared env-var validation), `middleware.ts` (Supabase session
  refresh helper — currently unused by `proxy.ts`'s own JWT check, kept
  for future use if Supabase Auth is ever adopted)
- **`auth/superadmin.ts`** — superadmin JWT sign/verify + cookie name constant
- **`constants/`** — shared magic numbers: `orders.ts`
  (`MAX_ACTIVE_ORDERS_PER_TAILOR`, `TAILOR_LOAD_WARNING_THRESHOLD`), `ui.ts`
  (debounce/toast timing), `admin.ts` (membership duration)
- **`validation/`** — plain-function form validators (`order-form.ts`,
  `tailor-form.ts`), consumed by hooks, no UI
- **`utils/date.ts`**, **`utils.ts`** — date formatting/parsing, `cn()` class
  merge helper
- **`keepalive.ts`** — the ping-and-delete logic behind `api/keepalive`

### `types/` — shared TypeScript types, one file per domain

`tailor.ts`, `order.ts`, `customer.ts`, `assign-work.ts`, `deliver-work.ts`,
`admin.ts`, all re-exported through `index.ts`. Prefer importing from `@/types`
over a deep path unless you have a specific reason not to.

### `proxy.ts`

Guards `/dashboard`, `/tailors/*`, `/orders/*`, `/history`, `/login` by
verifying the `auth_token` JWT (admin session only — superadmin auth is
enforced separately, see above).

### `supabase/migrations/`

Raw SQL migrations applied to the Supabase project directly (not run through
this app at build/deploy time).

## `app/tailor/` — customer-facing "tailor" module (standalone)

A separate, simple, Urdu/English bilingual module for shop customers,
independent of the admin dashboard described above — different route
namespace, different auth system, different session cookie. Nothing in
`app/(admin)/`, `app/superadmin/`, or `proxy.ts`'s admin branch links to
it, and vice versa.

- **`app/tailor/(auth)/login/`** — public login page at `/tailor/login`.
  Posts to `app/api/auth/tailor-login/route.ts`, which checks credentials
  against the `tailor_credentials` table (bcrypt-hashed `password_hash`, via
  `lib/queries/tailor-auth.ts` + the service-role client) and issues a
  `tailor_token` JWT cookie signed with `TAILOR_JWT_SECRET` (see
  `lib/auth/tailor.ts` — completely separate secret/cookie from the admin
  `auth_token`/`JWT_SECRET` and superadmin `superadmin_token`).
- **`app/tailor/(portal)/categories/`** — the post-login screen at
  `/tailor/categories`: centered logo, "Categories / اقسام" heading, and 5
  static bilingual category cards (Shalwar Kameez, Waistcoat, Pant, Shirt,
  Coat). Not yet wired to any data — static display only.
- **`app/tailor/layout.tsx`** — loads `Noto_Nastaliq_Urdu` via `next/font`,
  scoped to this subtree only (not the root layout), exposed as the
  `--font-urdu` CSS variable.
- **`proxy.ts`** — routes starting with `/tailor/` are dispatched to a
  separate `handleTailorAuth` branch (distinct from the admin branch) that
  checks the `tailor_token` cookie against `TAILOR_JWT_SECRET`; unauthenticated
  requests redirect to `/tailor/login`. (Note the trailing slash in the
  `startsWith` check — needed so `/tailors/*`, the existing admin "manage
  tailors" feature, doesn't get caught by this branch.)
- **No signup flow.** `tailor_credentials` rows are inserted manually via the
  Supabase table editor. Run `npm run hash-password -- <plaintext>` to get a
  bcrypt hash for the `password_hash` column.

## Known gaps (intentionally out of scope so far)

- `admin_credentials.password` is stored and compared in **plaintext** — not
  hashed. `bcryptjs` is already a dependency for whenever this is revisited.
- All app code now reads/writes `admin_credentials` exclusively through the
  Supabase **service-role** key (server-side only — see `lib/queries/admins.ts`
  and `app/api/auth/login/route.ts`), which bypasses Row Level Security by
  design. That's necessary but not sufficient: it's still worth confirming RLS
  on that table denies the **anon** key directly, as defense in depth against
  anything outside this app that might have the public anon key.
