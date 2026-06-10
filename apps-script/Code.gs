/**
 * EDENCOM SDE — Google Sheets companion script.
 *
 * The site serves never-changing-until-the-nightly-rebuild CSVs at
 * /static-inputs.csv and /static-outputs.csv, meant to be pulled into a
 * spreadsheet with IMPORTDATA. The catch: IMPORTDATA caches by the exact URL
 * and refreshes on Google's own ~hourly schedule, ignoring the server's
 * cache headers. There is no server-side knob to say "this changed, re-fetch
 * now". The only reliable lever lives here, in the sheet: change the URL.
 *
 * This script adds a cache-busting "v" query parameter to every edencom
 * IMPORTDATA formula and bumps it on demand (menu) or on a schedule (daily
 * trigger), so the nightly rebuild is picked up instead of a stale copy.
 *
 * Setup: Extensions -> Apps Script, paste this file, save, reload the sheet.
 * See README.md for the full walkthrough.
 */

/**
 * Host that serves the static CSV exports. Change this if you fork the site
 * or run it under a custom domain. Host only — no protocol, no path.
 */
var EDENCOM_HOST = "edencom-sde.vercel.app";

/** Name of the time-driven trigger's handler, used to find/remove it. */
var REFRESH_HANDLER = "refreshEdencomData";

/**
 * Adds the EDENCOM menu when the spreadsheet opens. Runs automatically via
 * the simple onOpen trigger — no installation needed beyond saving the file.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("EDENCOM")
    .addItem("Refresh data now", "refreshEdencomData")
    .addSeparator()
    .addItem("Enable daily auto-refresh", "installDailyTrigger")
    .addItem("Disable daily auto-refresh", "removeDailyTrigger")
    .addToUi();
}

/**
 * Walks every sheet, finds IMPORTDATA formulas pointing at EDENCOM_HOST, and
 * rewrites each one with a fresh cache-busting "v" parameter. The new URL is
 * one IMPORTDATA hasn't seen, so Google fetches it instead of serving a
 * cached copy. Safe to run from a menu click or a time-driven trigger.
 *
 * @return {number} How many formulas were refreshed.
 */
function refreshEdencomData() {
  var stamp = String(Date.now());
  var ss = SpreadsheetApp.getActive();
  var sheets = ss.getSheets();
  var count = 0;

  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var range = sheet.getDataRange();
    var formulas = range.getFormulas();

    for (var r = 0; r < formulas.length; r++) {
      for (var c = 0; c < formulas[r].length; c++) {
        var formula = formulas[r][c];
        if (!formula || formula.indexOf("IMPORTDATA") === -1) continue;

        var updated = bumpCacheBust(formula, stamp);
        if (updated !== null && updated !== formula) {
          // Set only the cells we actually changed. Never setFormulas() over
          // the whole data range — empty strings in the array would wipe any
          // literal (non-formula) cells.
          sheet.getRange(r + 1, c + 1).setFormula(updated);
          count++;
        }
      }
    }
  }

  notify(
    count === 0
      ? "No edencom IMPORTDATA formulas found to refresh."
      : "Refreshed " + count + (count === 1 ? " formula." : " formulas.")
  );
  return count;
}

/**
 * Rewrites the cache-busting "v" parameter of any edencom URL inside a
 * formula string. Returns the new formula, or null if the formula doesn't
 * reference EDENCOM_HOST (so callers can cheaply skip it).
 *
 * - If a literal "v=<digits>" parameter already exists, its value is swapped.
 * - Otherwise "v=<stamp>" is injected into each edencom URL literal, using
 *   "?" or "&" depending on whether the URL already has a query string.
 * - URL literals whose version is supplied by a concatenated cell
 *   (…?v=" & Cell) already contain "v=" and are left untouched — the user
 *   manages those by changing the cell.
 *
 * @param {string} formula The cell formula, e.g. =IMPORTDATA("https://host/x.csv").
 * @param {string} stamp   The new cache-busting value.
 * @return {?string} The rewritten formula, or null if not an edencom formula.
 */
function bumpCacheBust(formula, stamp) {
  if (formula.indexOf(EDENCOM_HOST) === -1) return null;

  // Literal numeric v= parameter: swap the value in place. Covers formulas
  // this script has already parameterized.
  if (/[?&]v=\d+/.test(formula)) {
    return formula.replace(/([?&]v=)\d+/g, "$1" + stamp);
  }

  // Otherwise inject v= into each quoted edencom URL literal that doesn't
  // already carry one. A literal already containing "v=" (e.g. the
  // cell-concatenation form …?v=" & Cell) is returned unchanged.
  var urlPattern = new RegExp(
    '("https?://' + escapeRegExp(EDENCOM_HOST) + '[^"]*?)"',
    "g"
  );
  return formula.replace(urlPattern, function (match, url) {
    if (/[?&]v=/.test(url)) return match;
    var separator = url.indexOf("?") === -1 ? "?" : "&";
    return url + separator + "v=" + stamp + '"';
  });
}

/**
 * Installs a daily time-driven trigger that runs refreshEdencomData. Removes
 * any existing copy first so repeated clicks don't stack duplicate triggers.
 * Scheduled for ~13:00 in the script's time zone, comfortably after the
 * site's nightly rebuild.
 */
function installDailyTrigger() {
  removeDailyTrigger();
  ScriptApp.newTrigger(REFRESH_HANDLER)
    .timeBased()
    .everyDays(1)
    .atHour(13)
    .create();
  notify("Daily auto-refresh enabled (runs ~13:00 each day).");
}

/** Removes the daily refresh trigger, if one is installed. */
function removeDailyTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === REFRESH_HANDLER) {
      ScriptApp.deleteTrigger(triggers[i]);
      removed++;
    }
  }
  // Only the menu-invoked path needs feedback; installDailyTrigger calls this
  // for cleanup and shows its own message afterward.
  if (removed > 0) notify("Daily auto-refresh disabled.");
}

/** Escapes a string for safe use inside a RegExp. */
function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Shows a transient toast. Wrapped so a missing UI context (e.g. some trigger
 * executions) degrades to a log line instead of throwing.
 */
function notify(message) {
  try {
    SpreadsheetApp.getActive().toast(message, "EDENCOM");
  } catch (err) {
    console.log("EDENCOM: " + message);
  }
}
