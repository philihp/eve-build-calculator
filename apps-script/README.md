# EDENCOM SDE — Google Sheets companion script

A small [Google Apps Script](https://developers.google.com/apps-script) that
keeps `IMPORTDATA` pulls of the static CSV exports
(`/static-inputs.csv`, `/static-outputs.csv`) fresh.

## Why this exists

`IMPORTDATA` is convenient but stubborn about caching:

- It fetches **server-side** from Google's infrastructure, not your browser.
- It caches keyed by the **exact URL** and refreshes on Google's own
  **~hourly** schedule.
- It largely **ignores** the response's `Cache-Control` / `ETag` / `Expires`
  headers for deciding when to re-fetch.

So there is no header the site can send to say "this changed, fetch it now."
The only reliable lever is on the sheet side: **change the URL**. This script
appends a cache-busting `v=<timestamp>` parameter to every edencom
`IMPORTDATA` formula and bumps it — manually from a menu, or automatically on
a daily trigger lined up with the site's nightly rebuild.

For data that almost never changes, the daily trigger is plenty; the manual
"Refresh data now" button is there for when you know a rebuild just shipped.

## Install

1. Open your spreadsheet.
2. **Extensions → Apps Script**.
3. Replace the contents of `Code.gs` with [`Code.gs`](./Code.gs) from this
   folder. (Optionally also set the manifest from
   [`appsscript.json`](./appsscript.json) via Project Settings → "Show
   appsscript.json".)
4. If your CSVs are served from a custom domain or a fork, change the
   `EDENCOM_HOST` constant near the top of `Code.gs`.
5. **Save**, then reload the spreadsheet. An **EDENCOM** menu appears.

## Use

The **EDENCOM** menu has three items:

| Item | What it does |
| :--- | :--- |
| **Refresh data now** | Bumps the `v=` parameter on every edencom `IMPORTDATA` formula, forcing an immediate re-fetch. |
| **Enable daily auto-refresh** | Installs a time-driven trigger that runs the refresh once a day (~13:00 in the script's time zone). |
| **Disable daily auto-refresh** | Removes that trigger. |

The first run of any item will prompt you to authorize the script (it needs
permission to edit the spreadsheet and manage triggers).

Your formulas can be the plain form — no manual setup required:

```
=IMPORTDATA("https://edencom-sde.vercel.app/static-inputs.csv")
```

On the first refresh the script rewrites it to:

```
=IMPORTDATA("https://edencom-sde.vercel.app/static-inputs.csv?v=1749538800000")
```

and bumps that number on each subsequent refresh.

### Alternative: keep the version in a cell

If you'd rather not let the script edit your formula text at all, carry the
version in a cell and concatenate it. Put a value in, say, `Config!B1` and
write:

```
=IMPORTDATA("https://edencom-sde.vercel.app/static-inputs.csv?v=" & Config!B1)
```

The script recognizes this form and **leaves it untouched** — you refresh by
changing `Config!B1` yourself (any new value busts the cache). Use this only
if you want full manual control; the menu and daily trigger don't bump these,
so the plain form above is the better default for hands-off refreshing.

## Notes

- The script only touches formulas containing both `IMPORTDATA` and
  `EDENCOM_HOST`; everything else in your sheet is left alone.
- It sets only the cells it changes, so literal (non-formula) values are never
  disturbed.
- Time zone for the daily trigger comes from the script project
  (`appsscript.json` → `timeZone`, default `Etc/UTC`).
