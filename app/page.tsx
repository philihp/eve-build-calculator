export const dynamic = "force-static";

const html = (lastUpdated: string) => `
<center>
  <h1><font color="navy">CapitalBOM SDE Browser</font></h1>
  <hr width="80%">
  <p><i>A static export of EVE Online's Static Data Export (SDE),
  rebuilt nightly and served as plain files.</i></p>

  <table border="1" cellpadding="6" cellspacing="0" width="80%">
    <tr bgcolor="#cccccc">
      <th align="left">Path</th>
      <th align="left">Description</th>
    </tr>
    <tr>
      <td><a href="/api/type/34">/api/type/[typeID]</a></td>
      <td align="left">
        Returns the raw JSON record for a single SDE type, keyed by
        typeID (e.g. <a href="/api/type/34">/api/type/34</a> for
        Tritanium). Served as <tt>application/json</tt>.
      </td>
    </tr>
    <tr>
      <td><a href="/sde/types.jsonl">/sde/types.jsonl</a></td>
      <td align="left">
        The full SDE types table as newline-delimited JSON, one type
        per line. Useful for bulk imports.
      </td>
    </tr>
    <tr>
      <td><a href="/static-inputs">/static-inputs</a></td>
      <td align="left">
        CSV of the input materials for every blueprint in the SDE.
        Compatible with Google Sheets <tt>IMPORTDATA</tt>.
      </td>
    </tr>
    <tr>
      <td><a href="/static-outputs">/static-outputs</a></td>
      <td align="left">
        CSV of the output products of every blueprint in the SDE.
        Compatible with Google Sheets <tt>IMPORTDATA</tt>.
      </td>
    </tr>
    <tr>
      <td><a href="/backup">/backup</a></td>
      <td align="left">
        The interactive Capital BOM calculator (previously the
        homepage).
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

  <hr width="80%">
  <p><font size="2"><i>Last updated: ${lastUpdated}</i></font></p>
</center>
`;

export default function Home() {
  const lastUpdated = new Date().toUTCString();
  return <div dangerouslySetInnerHTML={{ __html: html(lastUpdated) }} />;
}
