# TP2List — project notes

## What it is
A single-file `index.html` personal organizer. No build step, no backend.
Hosted on GitHub Pages (moved from Netlify after its free tier became credit-limited).
Cross-device sync uses JSONBin.io via a Master Key + Bin ID. This is independent of the hosting URL,
so reconnecting Sync on any new deployment pulls everything back.
Works offline: `sw.js` (service worker) caches the app. Edits save locally; if a sync push fails,
a pending flag (`tpas2:sync:pending`) makes the app push them before its next pull, including when it comes back online.
Bump `CACHE` in `sw.js` if a cached version ever gets stuck.

## Structure
Four swipeable pages, all sized the same: **List, Calendar, Expenses, Other**.
Phone and desktop use the same layout: one page at a time with swipe/tap navigation (the old desktop two-column layout was removed).

- **List**: task list → Other button → Today widget (items scheduled today in Calendar; ticking one removes it)
  → Overdue (missed calendar items, red date badges, tap to jump to that date) → Work section.
  Today/Overdue collapse to a bare `(0)` when empty.
- **Calendar**: Monday-first month grid; one-off, recurring and multi-day events; notes via a highlighter-style tag;
  repeat patterns including biweekly; dates, times and repeat rules can be edited after creation.
- **Work** (under List, stored as `ledger`): automation schedule (Panismo Invoice, Theomie Statements, TP2 Mazda Invoice).
  Add name/date/€ or £ amount. Status (SENT/PENDING/FAILED) is computed from the date, sorted soonest-first.
  Sent entries are hidden by default (🙈 reveals, 👁 hides). Add form is hidden until "+ add". Shows nothing when empty.
- **Expenses**: euro-based; defaults to today's entries in time order; "ALL DETAILS" shows the whole month by date+time.
  A positive monthly balance rolls into the next month.
- **Other**: separate full-page view for arbitrary categorized lists.
- **Stock / SL** (`stock/index.html`, the "SL" nav tab before Other): separate home-stock + shopping list app.
  Items have an emoji icon (auto-guessed from the name, or picked by hand), qty, category, low threshold;
  tabs All / At home / To buy. QR/barcode scan to find or add items (BarcodeDetector, falls back to vendored jsQR),
  printable QR labels per item. Stored in IndexedDB on the device; JSON export/import in the menu.
  **Sharing** is separate from TP2List's JSONBin sync: "Share" gives a 6-character code, and other phones join by typing it.
  The code is remembered on each phone (`tp2stock:share:code`). Backend is a Firebase Realtime Database
  (REST + EventSource, no SDK) at `/lists/<CODE>/{created,items/<id>,deleted/<id>}`, set via `SHARE_DB` in stock/index.html.
  The Share button stays hidden while `SHARE_DB` is empty. Merge is per item, newest `updated` wins, and deletions are timestamped.
  Firebase rules: `{"rules":{"lists":{"$code":{".read":true,".write":true}}}}` (root stays unreadable, so codes can't be listed).
- **Polish**: subtle background glow + grid texture, two faint drifting easter-egg labels ("iis" / "Kay Kays"),
  brief fade when completing a Today/Overdue item.

## Past bugs (fixed — check here first if something looks off)
- Sync pull rebuilt data without `ledger`/`spanEvents`, wiping them on every pull.
- Sync push never updated the local timestamp, so the app treated its own saved data as stale and
  overwrote it with an old server copy. This was the root cause of Work entries resetting.
- Real business data was once hardcoded in the source. It has been removed, but it may still exist in old git history.
- Stray CSS brace, hidden `.stamp-mark` reserving layout space, and a background-color rule blocking the glow.

## Rules
- Always merge when done: once a change is made and tested, open a PR and merge it into `main` without asking (the user authorized this). Main deploys to GitHub Pages.
- Never hardcode real business data (invoice names/amounts) in the source.
- Any sync change must preserve every data field (`ledger`, `spanEvents`, etc.) and keep timestamps consistent.

## Open items
- Re-enter Work entries (Panismo / Theomie / TP2 Mazda) with correct dates and amounts. The old data was lost to the sync bug.
- Optional: purge old git history that contains the earlier hardcoded business data.
