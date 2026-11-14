# Checkpoint: tailor module theme and design pass

Date: 2026-11-10. Status: all changes are uncommitted in the working tree. `tsc --noEmit` passes. Nothing was run in a browser or built with `next build`, so the visual result and the Google font downloads are untested.

## Summary

The tailor module (`app/tailor/**`, the five order sheets and shared components) was restyled with a Navy & Brass palette and a new Urdu/English type system. The categories page was redesigned, and the Button Patti width list was changed.

## 1. Button Patti width (Shalwar Kameez)

- `lib/constants/shalwar-kameez.ts`: `buttonPatti.size2Options` is now `1/2, 3/4, 1-1, 1+1, 1 1/4, 1 1/2, 1 3/4, 2`.
- Values are saved as literal strings (free text column, no migration). Fractions display as glyphs via `formatSizeLabel`.
- Orders saved with the old widths (`1 1/4` to `3`) still display; a saved width not in the list just isn't highlighted in the modal.

## 2. Palette (Navy & Brass)

| Role | Hex |
|---|---|
| Navy (primary) | `#1F2A44` |
| Brass (accent) | `#B08D57` (lighter `#C9A66B` on dark) |
| Brass text on light | `#7C5E28` |
| Ivory page | `#F6F4EF` |
| Border | `#DDD8CC` |
| Success / alert | `#2F6F4F` / `#A63D2F` |

- Old greys, blacks and blue accents in the tailor files were mapped to these by a bulk replace (`components/garment-order`, `shalwar-kameez`, `tailor-shared`, `tailor-auth`, `app/tailor`, `lib/constants/tailor-form.ts`).
- `app/globals.css`: `--primary` is `#1F2A44` and `--ring` is `#B08D57` (light theme only). **This also changes admin dashboard primary buttons from near-black to navy.**

## 3. Fonts

- `app/layout.tsx` loads Inter (`--font-inter`), Noto Naskh Arabic (`--font-naskh`) and Noto Nastaliq Urdu (`--font-urdu`) once at the root, so portalled dialogs get the variables too.
- `app/tailor/layout.tsx` applies Inter to the tailor wrapper. The per-form Naskh loading in `shalwar-kameez-form.tsx` and `garment-order-form.tsx` was removed.
- Roles: Inter for English and numbers, Naskh for Urdu labels in forms, Nastaliq for large Urdu headings and the categories page.
- Print sheet/receipt (`lib/utils/order-sheet.ts`, `garment-order-sheet.ts`): `Inter` was added at the front of the font list only. Printed colors were deliberately left black and white (separate print window, no web fonts, ink cost).

## 4. Categories page (`app/tailor/(portal)/categories/page.tsx`)

- Navy header band with the dark-background logo, gold Urdu title and a brass rule. Cards overlap the header on an ivory page.
- All five categories have equal weight: a 6-column grid on wide screens (3 cards, then 2 wider cards), 2 per row on phones.
- Hover: lift, brass top edge and border, "Open" pill fills navy. Keyboard focus shows a brass ring.
- `app/tailor/(portal)/layout.tsx`: ivory background, restyled Logout button.
- **Not built:** a per-category order count. The admin `orders` table (status `assigned`/`delivered`) has no garment type and no link to the tailor sheets, so "in progress per category" cannot be counted yet. The user chose to leave it.

## 5. Order sheet look (all five sheets)

Final state, reached after several rounds:

- **Base:** deep navy board `#18223A` on a near-black backdrop `#0F1626`. Header bar `#111A2E` with a 2px brass underline.
- **Panels:** warm linen `#E3DCCB` with a `#C9C0A8` border and a 3px brass top edge, plus a light shadow.
- **Fields:** cream `#F3EFE5`, border `#BDB59F`, brass focus ring. `FIELD_CLASS` in `lib/constants/tailor-form.ts` is shared, so the Add Client modal inputs are cream too.
- **Labels on panels:** darker grey `#4F566B`.
- **Save button:** brass with navy text.
- Rejected along the way: near-black full-dark sheets, bright ivory panels, and the inverted (light base, navy panels) version, which was applied and then reverted.

## 6. Known issues and loose ends

- ESLint reports one error from before these changes: `setState` inside an effect at `components/tailor-shared/receipt-preview-dialog.tsx:67`.
- `scratchpad/shot.mjs` (tracked in git) contains a hard-coded JWT secret. Flagged earlier, not changed.
- Three garment migrations (`20261027000000/010000/020000`) were written earlier and have not been applied to any database.
- The Shalwar Kameez hook still duplicates client-lookup logic that `hooks/garment-order/use-client-lookup.ts` holds.
- Modals (picker, confirm dialogs, receipt preview) were recolored by the bulk replace but not redesigned; check them against the dark board.
- Nothing is committed.

## 7. Design boards

All mock-ups live on one private canvas: https://claude.ai/artifact/XtU1tbUJ2WM4akbPr1VEYy (color options A/B/C, font pairings, final bilingual sheet, categories variants, dark/inverted sheets, panel tones). Source files are in the session scratchpad only, not in the repo.
