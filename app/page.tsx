import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { cookies, headers } from "next/headers";

export const dynamic = "force-dynamic";

const REPO_URL = "https://github.com/philihp/edencom-sde";

async function readLastUpdated(): Promise<string> {
  const localPath = join(process.cwd(), "public", "sde", "last-updated.txt");
  if (existsSync(localPath)) {
    try {
      return readFileSync(localPath, "utf8").trim();
    } catch {
      /* fall through */
    }
  }
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000";
  try {
    const res = await fetch(`${baseUrl}/sde/last-updated.txt`, {
      cache: "no-store",
    });
    if (res.ok) return (await res.text()).trim();
  } catch {
    /* fall through */
  }
  return new Date().toISOString();
}

const trimToMinute = (iso: string) => iso.replace(/:\d\d(?:\.\d+)?Z$/, "Z");

// Sun altitude in degrees at the given UTC instant and lat/lon (degrees).
// Standard low-precision NOAA-style approximation; good to a fraction of
// a degree, which is plenty for "is it day or night here".
function sunAltitudeDeg(date: Date, latDeg: number, lonDeg: number): number {
  const rad = Math.PI / 180;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const n = jd - 2451545.0;
  const L = ((280.46 + 0.9856474 * n) % 360 + 360) % 360;
  const g = (((357.528 + 0.9856003 * n) % 360 + 360) % 360) * rad;
  const lambda =
    (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad;
  const epsilon = (23.439 - 0.0000004 * n) * rad;
  const ra = Math.atan2(
    Math.cos(epsilon) * Math.sin(lambda),
    Math.cos(lambda),
  );
  const dec = Math.asin(Math.sin(epsilon) * Math.sin(lambda));
  const gmstHours = ((18.697374558 + 24.06570982441908 * n) % 24 + 24) % 24;
  const lst = (gmstHours * 15 + lonDeg) * rad;
  const H = lst - ra;
  const phi = latDeg * rad;
  const alt = Math.asin(
    Math.sin(phi) * Math.sin(dec) +
      Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
  return alt / rad;
}

type Theme = {
  bg: string;
  fg: string;
  link: string;
  accent: string;
  rule: string;
  headerBg: string;
  tableBorder: string;
};

const LIGHT: Theme = {
  bg: "#ffffff",
  fg: "#000000",
  link: "#0000ee",
  accent: "navy",
  rule: "#808080",
  headerBg: "#cccccc",
  tableBorder: "#000000",
};

const DARK: Theme = {
  bg: "#0a0a14",
  fg: "#e0e0e0",
  link: "#7fdfff",
  accent: "#ffd966",
  rule: "#404060",
  headerBg: "#1f1f33",
  tableBorder: "#3a3a55",
};

const toggle = (theme: Theme, stateLabel: string) => {
  const off = `background:${theme.headerBg};color:${theme.fg};border:2px outset ${theme.tableBorder};padding:2px 10px;text-decoration:none;font-family:monospace`;
  const on = `background:${theme.bg};color:${theme.fg};border:2px inset ${theme.tableBorder};padding:2px 10px;text-decoration:none;font-family:monospace;font-weight:bold`;
  return `
<div style="position:absolute;top:0.5em;right:0.5em;font-family:monospace">
  <a href="/theme/light" style="${stateLabel === "light" ? on : off}">Light</a>
  <a href="/theme/dark" style="${stateLabel === "dark" ? on : off}">Dark</a>
</div>
`;
};

const html = (
  lastUpdated: string,
  commit: string,
  theme: Theme,
  modeLabel: string,
  stateLabel: string,
) => `
${toggle(theme, stateLabel)}
<h1><font color="${theme.accent}">EVE Online Static Data ETL</font></h1>
<hr>
<p><i>A static export of EVE Online's Static Data Export (SDE),
rebuilt nightly and served as plain files.</i></p>

<table border="1" cellpadding="6" cellspacing="0" bordercolor="${theme.tableBorder}">
  <tr bgcolor="${theme.headerBg}">
    <th align="left">Path</th>
    <th align="left">Description</th>
  </tr>
  <tr>
    <td><a href="/api/type/34.json">/api/type/[typeID].json</a></td>
    <td>
      Returns the raw JSON record for a single SDE type, keyed by
      typeID (e.g. <a href="/api/type/34.json">/api/type/34.json</a>
      for Tritanium). The <tt>.json</tt> suffix is optional.
    </td>
  </tr>
  <tr>
    <td><a href="/sde/types.jsonl">/sde/types.jsonl</a></td>
    <td>
      The full SDE types table as newline-delimited JSON, one type
      per line. Useful for bulk imports.
    </td>
  </tr>
  <tr>
    <td><a href="/static-inputs.csv">/static-inputs[.csv]</a></td>
    <td>
      CSV of the input materials for every blueprint in the SDE.
      Compatible with Google Sheets <tt>IMPORTDATA</tt>. The
      <tt>.csv</tt> suffix is optional.
    </td>
  </tr>
  <tr>
    <td><a href="/static-outputs.csv">/static-outputs[.csv]</a></td>
    <td>
      CSV of the output products of every blueprint in the SDE.
      Compatible with Google Sheets <tt>IMPORTDATA</tt>. The
      <tt>.csv</tt> suffix is optional.
    </td>
  </tr>
</table>

<br>

<h3><font color="${theme.accent}">How it's built</font></h3>
<p>
  This site is rebuilt nightly. Each build pulls the latest SDE from
  CCP's servers, normalizes the tables, and pre-renders every path
  above as a static file. No database, no runtime queries &mdash;
  just files on a CDN.
</p>

<hr>
<p><font size="2"><i>Made with &hearts; by Sir Cuddles from <a href="${REPO_URL}/commit/${commit}">${commit}</a> @ ${lastUpdated} &mdash; ${modeLabel}</i></font></p>
`;

export default async function Home() {
  const lastUpdated = trimToMinute(await readLastUpdated());
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "0000000";
  const commit = sha.slice(0, 7);

  const h = await headers();
  const lat = Number(h.get("x-vercel-ip-latitude"));
  const lon = Number(h.get("x-vercel-ip-longitude"));
  const haveCoords = Number.isFinite(lat) && Number.isFinite(lon);

  const altitude = haveCoords ? sunAltitudeDeg(new Date(), lat, lon) : NaN;
  const sunIsUp = Number.isFinite(altitude) ? altitude > 0 : true;

  const cookieJar = await cookies();
  const cookieMode = cookieJar.get("theme")?.value;
  const isDay =
    cookieMode === "light" ? true : cookieMode === "dark" ? false : sunIsUp;
  const theme = isDay ? LIGHT : DARK;

  const source =
    cookieMode === "light" || cookieMode === "dark"
      ? `cookie (${cookieMode})`
      : haveCoords
      ? `${sunIsUp ? "day" : "night"} at ${lat.toFixed(2)},${lon.toFixed(2)} (sun ${altitude.toFixed(1)}°)`
      : "default (no edge coords)";

  const stateLabel =
    cookieMode === "light" || cookieMode === "dark" ? cookieMode : "system";
  const body = html(lastUpdated, commit, theme, source, stateLabel);
  const styleTag = `<style>
html,body{margin:0;background:${theme.bg};color:${theme.fg}}
a{color:${theme.link}}
hr{border:0;border-top:1px solid ${theme.rule}}
</style>`;

  return (
    <div
      style={{
        background: theme.bg,
        color: theme.fg,
        minHeight: "100vh",
        padding: "1em",
        position: "relative",
      }}
      dangerouslySetInnerHTML={{ __html: styleTag + body }}
    />
  );
}
