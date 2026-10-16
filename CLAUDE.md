# TP2List — project notes

## What it is
A single-file `index.html` personal organizer. No build step, no backend.
Hosted on GitHub Pages (moved from Netlify after its free tier became credit-limited).
Cross-device sync (laptop ↔ phone) uses a **sync code** via Firebase Realtime Database (`FB_DB` in index.html,
project `tp2-list`). The Sync button opens a sheet: "Get a sync code" uploads this device's data, and the other device enters
the 10-character code, after which the synced copy replaces its data. Data is stored at `/sync/<CODE>/sections/<field>` = `{v: JSON text, t: edit time}`,
one entry per top-level field of `data`, so new fields sync automatically. Sections merge independently and the newest edit wins.
Live updates come via EventSource. Remote changes wait while an input is focused. Local state is kept in `tpas2:fb:code` / `tpas2:fb:state`.
JSONBin has been removed entirely. Firebase sync codes are the only sync; a device without a code just keeps its data locally.
Works offline: `sw.js` (service worker) caches the app. Edits save locally and sync when back online.
Firebase rules (must include both):
`{"rules":{"lists":{"$code":{".read":true,".write":true}},"sync":{"$code":{".read":"$code.length >= 10",".write":"$code.length >= 10"}}}}`
Bump `CACHE` in `sw.js` if a cached version ever gets stuck.

## Structure
Four swipeable pages, all sized the same: **List, Calendar, Expenses, Other**.
Phone and desktop use the same layout: one page at a time with swipe/tap navigation (the old desktop two-column layout was removed).

- **List**: task list → Other button → Today widget (items scheduled today in Calendar; ticking one removes it)
  → Overdue (missed calendar items, red date badges, tap to jump to that date).
  Today/Overdue collapse to a bare `(0)` when empty.
- **Calendar**: Monday-first month grid; one-off, recurring and multi-day events; notes via a highlighter-style tag;
  repeat patterns including biweekly; dates, times and repeat rules can be edited after creation.
- **Expenses**: euro-based; defaults to today's entries in time order; "ALL DETAILS" shows the whole month by date+time.
  A positive monthly balance rolls into the next month.
- **Other**: separate full-page view for arbitrary categorized lists.
- **Stock / SL** (`stock/index.html`, the "SL" nav tab before Other): separate home-stock + shopping list app.
  Items have an emoji icon (auto-guessed from the name, or picked by hand), qty, low threshold (no category or unit fields in the editor);
  each item is at Home or Apartment; three tabs At Home / At Apartment / To Buy, set via the "List" dropdown in the editor (To Buy = qty 0; the item keeps its place for when it is restocked). No category filter chips. QR/barcode scan to find or add items (BarcodeDetector, falls back to vendored jsQR),
  printable QR labels per item. Items show as a compact list (one row each: icon, name, LOW tag, − qty +). Stored in IndexedDB on the device; JSON export/import in the menu.
  **Sharing** is separate from TP2List's own sync code: "Share" gives a 6-character code, and other phones join by typing it.
  The code is remembered on each phone (`tp2stock:share:code`). The header button shows "Synced" (not the code) once joined; the code is shown inside the Share sheet. Backend is a Firebase Realtime Database
  (REST + EventSource, no SDK) at `/lists/<CODE>/{created,items/<id>,deleted/<id>}`, set via `SHARE_DB` in stock/index.html (project `tp2-list`, europe-west1).
  The Share button stays hidden while `SHARE_DB` is empty. Merge is per item, newest `updated` wins, and deletions are timestamped.
  Firebase rules: `{"rules":{"lists":{"$code":{".read":true,".write":true}}}}` (root stays unreadable, so codes can't be listed).
- **Polish**: subtle background glow + grid texture, two faint drifting easter-egg labels ("iis" / "Kay Kays"),
  brief fade when completing a Today/Overdue item.

## Past bugs (fixed — check here first if something looks off)
- Sync pull rebuilt data without `ledger`/`spanEvents`, wiping them on every pull.
- Sync push never updated the local timestamp, so the app treated its own saved data as stale and
  overwrote it with an old server copy. (Historical: JSONBin era.)
- Real business data was once hardcoded in the source. It has been removed, but it may still exist in old git history.
- Stray CSS brace, hidden `.stamp-mark` reserving layout space, and a background-color rule blocking the glow.

## Rules
- Always merge when done: once a change is made and tested, open a PR and merge it into `main` without asking (the user authorized this). Main deploys to GitHub Pages.
- Never hardcode real business data (invoice names/amounts) in the source.
- Any sync change must preserve every data field (`ledger`, `spanEvents`, etc.) and keep timestamps consistent.

## Open items
- The Work section, automation status and `data.ledger` UI were removed. Old `ledger` data still syncs harmlessly as a section.
- Firebase sync/sharing not yet verified against the real database (sandbox can't reach it; only tested with mocks).
  Check: `<FB_DB>/sync/ZZZZZZZZZZ/created.json` and `<FB_DB>/lists/ZZZZZZ/created.json` should return `null`, `<FB_DB>/.json` "Permission denied";
  in the app, Sync → Get a sync code should show "✓ Live". "Permission denied" on the first two = rules not published.
- Optional: purge old git history that contains the earlier hardcoded business data.
