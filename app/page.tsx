import { readFileSync } from "node:fs";
import { join } from "node:path";

export const dynamic = "force-static";

const REPO_URL = "https://github.com/philihp/edencom-sde";

function readLastUpdated(): string {
  try {
    return readFileSync(
      join(process.cwd(), "public", "sde", "last-updated.txt"),
      "utf8",
    ).trim();
  } catch {
    return new Date().toISOString();
  }
}

const trimToMinute = (iso: string) =>
  iso.replace(/:\d\d(?:\.\d+)?Z$/, "Z");

const html = (lastUpdated: string, commit: string) => `
<h1><font color="navy">EVE Online Static Data ETL</font></h1>
<hr>
<p><i>A static export of EVE Online's Static Data Export (SDE),
rebuilt nightly and served as plain files.</i></p>

<table border="1" cellpadding="6" cellspacing="0">
  <tr bgcolor="#cccccc">
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

<h3><font color="navy">How it's built</font></h3>
<p>
  This site is rebuilt nightly. Each build pulls the latest SDE from
  CCP's servers, normalizes the tables, and pre-renders every path
  above as a static file. No database, no runtime queries &mdash;
  just files on a CDN.
</p>

<hr>
<p><font size="2"><i>Made with &hearts; by Sir Cuddles from <a href="${REPO_URL}/commit/${commit}">${commit}</a> @ ${lastUpdated}</i></font></p>
`;

export default function Home() {
  const lastUpdated = trimToMinute(readLastUpdated());
  const sha = process.env.VERCEL_GIT_COMMIT_SHA ?? "0000000";
  const commit = sha.slice(0, 7);
  return <div dangerouslySetInnerHTML={{ __html: html(lastUpdated, commit) }} />;
}
