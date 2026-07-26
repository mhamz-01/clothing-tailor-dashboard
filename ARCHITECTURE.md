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

These are the **admin**-side feature folders; the `app/tailor/**` module has
its own `shalwar-kameez/` and `tailor-auth/` folders here too (see
"Order-taking data layer" below) — same directory, same convention, separate
feature.

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

Same split as `components/` above: this list is the admin side; the tailor
module's `shalwar-kameez/` and `tailor-auth/` hook folders are covered below.

- `assign-work/`, `deliver-work/`, `history/`, `tailors/`, `superadmin/` — each
  folder's hooks wrap `lib/queries/<domain>.ts` calls in TanStack Query
  (`useQuery`/`useMutation`), plus any page-local client state (staged orders,
  form state, filters)
- `shared/` — cross-feature hooks with no domain knowledge: `use-toast`,
  `use-debounced-value`, `use-combobox-search`, `use-mobile`

Convention: a hook here should not call Supabase directly — it calls a
function from `lib/queries/`. Query keys used in `useQuery`/`invalidateQueries`
come from `lib/queries/keys.ts` (`queryKeys.*`), not inline string literals —
one shared factory for both the admin and tailor modules.

### `lib/` — framework-agnostic logic, no React

- **`queries/`** — the data-access layer; the *only* place that talks to
  Supabase. One module per domain: `tailors.ts`, `orders.ts`, `dashboard.ts`,
  `history.ts`, `admins.ts` (service-role only, used solely by
  `api/superadmin/*` routes — deliberately excluded from `index.ts`'s barrel so
  it can never be pulled into client-bundled code), `shared.ts`
  (`normalizeTailorJoin` — un-nests Supabase's joined-row arrays), `keys.ts`
  (query-key factory), plus the tailor module's `garment-orders.ts` and
  `tailor-auth.ts` (service-role only, also excluded from the barrel — see
  "Order-taking data layer" below)
- **`supabase/`** — client factories: `client.ts` (browser), `server.ts`
  (server components, cookie-aware), `service.ts` (service-role, server-only),
  `env.ts` (shared env-var validation), `middleware.ts` (Supabase session
  refresh helper — currently unused by `proxy.ts`'s own JWT check, kept
  for future use if Supabase Auth is ever adopted)
- **`auth/superadmin.ts`** — superadmin JWT sign/verify + cookie name constant.
  **`auth/tailor.ts`** — the same for the tailor module's `tailor_token`.
- **`constants/`** — shared magic numbers: `orders.ts`
  (`MAX_ACTIVE_ORDERS_PER_TAILOR`, `TAILOR_LOAD_WARNING_THRESHOLD`), `ui.ts`
  (debounce/toast timing), `admin.ts` (membership duration), `shalwar-
  kameez.ts` (the order form's option lists — see below)
- **`validation/`** — plain-function form validators (`order-form.ts`,
  `tailor-form.ts`), consumed by hooks, no UI
- **`utils/date.ts`**, **`utils.ts`** — date formatting/parsing, `cn()` class
  merge helper. **`utils/order-sheet.ts`**, **`utils/receipt.ts`**,
  **`utils/format-size.ts`**, **`utils/keyboard-nav.ts`** — tailor-module-only
  helpers, see below.
- **`keepalive.ts`** — the ping-and-delete logic behind `api/keepalive`

### `types/` — shared TypeScript types, one file per domain

`tailor.ts`, `order.ts`, `customer.ts`, `assign-work.ts`, `deliver-work.ts`,
`admin.ts` (admin side), plus `garment-order.ts` and `shalwar-kameez.ts`
(tailor module, see below) — all re-exported through `index.ts`. Prefer
importing from `@/types` over a deep path unless you have a specific reason
not to.

### `proxy.ts`

Guards `/dashboard`, `/tailors/*`, `/orders/*`, `/history`, `/login` by
verifying the `auth_token` JWT (admin session only — superadmin auth is
enforced separately, see above).

### `supabase/migrations/`

Raw SQL migrations applied to the Supabase project directly (not run through
this app at build/deploy time).

## `app/tailor/` — staff-facing "tailor" module (standalone)

A separate, Urdu/English bilingual module used by **shop tailors** (not
customers, despite the folder name and the JWT's legacy `role:
"tailor-customer"` claim) to log in and take garment orders — measurements,
style options, part designs, pricing — and print an order sheet / receipt.
Independent of the admin dashboard described above — different route
namespace, different auth system, different session cookie, own
`QueryClientProvider`. Nothing in `app/(admin)/`, `app/superadmin/`, or
`proxy.ts`'s admin branch links to it, and vice versa.

- **`app/tailor/(auth)/login/`** — public login page at `/tailor/login`.
  Posts to `app/api/auth/tailor-login/route.ts`, which checks credentials
  against the `tailor_credentials` table (bcrypt-hashed `password_hash`, via
  `lib/queries/tailor-auth.ts` + the service-role client) and issues a
  `tailor_token` JWT cookie signed with `TAILOR_JWT_SECRET` (see
  `lib/auth/tailor.ts` — completely separate secret/cookie from the admin
  `auth_token`/`JWT_SECRET` and superadmin `superadmin_token`).
- **`app/tailor/(portal)/categories/`** — the post-login screen at
  `/tailor/categories`: centered logo, "Categories / اقسام" heading, and 5
  bilingual category cards. Only **Shalwar Kameez** is wired up (links to
  `orders/shalwar-kameez`); Waistcoat, Pant, Shirt, Coat are disabled
  "Soon" placeholders. A gear icon links to `(portal)/settings`.
- **`app/tailor/(portal)/settings/`** — pricing config for the Shalwar
  Kameez form: Base Tailoring Amt, delivery turnaround (days), and a price
  per button type. Reads/writes `order_pricing_settings` (singleton row) and
  `button_types.price` via `hooks/shalwar-kameez/use-pricing-settings*.ts`.
- **`app/tailor/orders/shalwar-kameez/`** — the order-taking form itself
  (`components/shalwar-kameez/shalwar-kameez-form.tsx`), a full-viewport
  single-page "board": client lookup (by Client No/Name/Phone, with an Add
  Client modal and duplicate detection), a session-only Prev/Next history
  between clients looked up this visit, measurements, style-option radio
  groups (pocket/bain-gala/collar/daman/button, each with catalog images),
  independent style-flag checkboxes, a part-design table (Bazu/Kuf/Button
  Patti/Jaib, each with a design-picker modal), and an order-summary panel
  (auto-computed Tailoring Amt, live total/balance). Returning clients are
  identified by Client No and their most recent order auto-prefills the
  whole form. Save writes through the `create_shalwar_kameez_order` RPC;
  Print builds an A5 order-sheet HTML string (`lib/utils/order-sheet.ts`)
  and opens it in a print popup; Print Receipt shows a confirmation preview
  (`receipt-preview-dialog.tsx`) before printing an 80mm thermal-receipt HTML
  string (`lib/utils/receipt.ts`). "Delete" and "Search by record no." are
  UI-present but not wired up yet.
- **`components/tailor-auth/change-password-modal.tsx`** +
  **`hooks/tailor-auth/use-change-password.ts`** — self-service password
  change, posting to `app/api/auth/tailor-change-password/route.ts` (verifies
  the old bcrypt hash, writes a new one). Plain `fetch`/`useState`, not
  TanStack Query — this predates/sits outside the shalwar-kameez form's data
  layer.
- **`app/tailor/layout.tsx`** — loads `Noto_Nastaliq_Urdu` via `next/font`
  (exposed as the `--font-urdu` CSS variable), and owns the **one**
  `QueryClientProvider` for the whole `app/tailor/**` subtree (separate
  instance from `app/(admin)/layout.tsx`'s). It has to live here rather than
  in `(portal)/layout.tsx` because `orders/shalwar-kameez` is a sibling of
  the `(portal)` route group, not nested inside it.
- **`proxy.ts`** — routes starting with `/tailor/` are dispatched to a
  separate `handleTailorAuth` branch (distinct from the admin branch) that
  checks the `tailor_token` cookie against `TAILOR_JWT_SECRET`; unauthenticated
  requests redirect to `/tailor/login`. (Note the trailing slash in the
  `startsWith` check — needed so `/tailors/*`, the existing admin "manage
  tailors" feature, doesn't get caught by this branch.)
- **No signup flow.** `tailor_credentials` rows are inserted manually via the
  Supabase table editor. Run `npm run hash-password -- <plaintext>` to get a
  bcrypt hash for the `password_hash` column.

### Order-taking data layer

- **`lib/queries/garment-orders.ts`** — the *only* place that talks to the
  garment-order schema: catalog fetches (pocket/bain-gala/collar/daman/button
  types, style-flag/design catalogs), client search/add/delete, the
  `fetch_latest_order_for_client` / `next_client_number` /
  `create_shalwar_kameez_order` RPC calls, and the pricing-settings
  read/write used by the Settings page. Uses the plain anon-key browser
  client (`lib/supabase/client.ts`), same as `lib/queries/tailors.ts` —
  **RLS is disabled on every garment-order table** (see
  `20260714000000_fix_garment_orders_keys_and_access.sql`), since this app
  has no Supabase Auth session to satisfy an `authenticated` policy. See
  "Known gaps" below.
- **`hooks/shalwar-kameez/`** — `use-shalwar-kameez-form.ts` (the big one:
  owns all form state, the Prev/Next client history, render-time defaulting
  of Record No./Delivery Date/Others Amt, save/print/receipt handlers) plus
  thin TanStack Query wrappers: `use-button-prices.ts`, `use-pricing-
  settings.ts`, `use-pricing-settings-mutations.ts`.
- **`components/shalwar-kameez/`** — presentational pieces owned by the
  form: `client-lookup-section.tsx`, `client-no-input.tsx`,
  `add-client-modal.tsx`, `measurements-panel.tsx`, `style-options-panel.tsx`,
  `checkbox-group.tsx`, `radio-option-group.tsx`, `button-type-panel.tsx`,
  `part-design-table.tsx`, `part-design-picker-modal.tsx`,
  `size-quick-pick.tsx`, `order-summary-panel.tsx`, `action-bar.tsx`,
  `receipt-preview-dialog.tsx`, `status-toast.tsx`.
- **`lib/constants/shalwar-kameez.ts`** — every option list (pocket/bain-
  gala/collar/daman/button radio options, style flags, part-design catalog
  image maps, size-fraction labels) and their DB codes, kept 1:1 with the
  Postgres enum values in `tailor-schema-supabase.md`.
- **`lib/utils/order-sheet.ts`** / **`lib/utils/receipt.ts`** — build the
  standalone print HTML strings (own `<style>`/`@page` rules, independent of
  the app's Tailwind stylesheet so the two print flows never collide).
  **`lib/utils/format-size.ts`** — fraction-to-Unicode display (`"1/4"` →
  `"¼"`). **`lib/utils/keyboard-nav.ts`** — shared arrow-key grid navigation
  for the form's panels.
- **`types/garment-order.ts`** — DB-facing shapes (catalog rows, client
  rows, RPC input/output). **`types/shalwar-kameez.ts`** — the form's own UI
  state shape, keyed to mirror the schema's column/enum names.
- **`tailor-schema-supabase.md`** (repo root) — the schema spec this whole
  module was built from; read it before touching any garment-order table or
  migration.

## Known gaps (intentionally out of scope so far)

- `admin_credentials.password` is stored and compared in **plaintext** — not
  hashed. `bcryptjs` is already a dependency for whenever this is revisited
  (and is already used for `tailor_credentials`, see above).
- All app code now reads/writes `admin_credentials` exclusively through the
  Supabase **service-role** key (server-side only — see `lib/queries/admins.ts`
  and `app/api/auth/login/route.ts`), which bypasses Row Level Security by
  design. That's necessary but not sufficient: it's still worth confirming RLS
  on that table denies the **anon** key directly, as defense in depth against
  anything outside this app that might have the public anon key.
- **Every garment-order table has RLS disabled outright** (clients, orders,
  `shalwar_kameez_details`, `order_style_flags`, `order_part_designs`, every
  catalog table, `order_pricing_settings`, `record_counter`) — the anon key
  used by `lib/queries/garment-orders.ts` can read/write all of it directly
  from the browser, gated only by the `tailor_token` cookie check in
  `proxy.ts` at the page level, not by the database. Worth revisiting once
  Supabase Auth (or RLS keyed off the JWT) is in scope.
- On the Shalwar Kameez order form, **Delete** and **Search by record no.**
  are present in the UI but not implemented (`handleDelete`/
  `handleSearchRecord` in `use-shalwar-kameez-form.ts` just flash a "not
  connected yet" message).
- Only the **Shalwar Kameez** category is live; Waistcoat/Pant/Shirt/Coat are
  disabled placeholders on `/tailor/categories` pending the same schema
  pattern (`orders` + a garment-specific details table) being extended to
  them.
