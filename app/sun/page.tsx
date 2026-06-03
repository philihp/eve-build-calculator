// Server component so we can read the Vercel-provided latitude/longitude
// environment variables and capture the UTC time at request render.
// `force-dynamic` ensures every request recomputes the time + sun position
// instead of serving a build-time cached snapshot.
export const dynamic = "force-dynamic";

const RAD = Math.PI / 180;

const readEnvFloat = (...names: string[]): number | null => {
  for (const name of names) {
    const raw = process.env[name];
    if (raw === undefined || raw.trim() === "") continue;
    const n = Number(raw);
    if (Number.isFinite(n)) return n;
  }
  return null;
};

type SunPosition = {
  declination: number; // sun's tilt vs the celestial equator (deg)
  elevation: number; // angle above the horizon (deg)
  azimuth: number; // compass bearing, clockwise from north (deg)
};

// NOAA solar position algorithm.
// Ports the equations from the NOAA Solar Calculator spreadsheet.
const solarPosition = (date: Date, lat: number, lon: number): SunPosition => {
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525.0; // Julian centuries since J2000.0

  const L0 = ((280.46646 + T * (36000.76983 + T * 0.0003032)) % 360 + 360) % 360;
  const M = 357.52911 + T * (35999.05029 - 0.0001537 * T);
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T);

  const C =
    Math.sin(M * RAD) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
    Math.sin(2 * M * RAD) * (0.019993 - 0.000101 * T) +
    Math.sin(3 * M * RAD) * 0.000289;

  const trueLong = L0 + C;
  const omega = 125.04 - 1934.136 * T;
  const lambda = trueLong - 0.00569 - 0.00478 * Math.sin(omega * RAD);

  const seconds = 21.448 - T * (46.815 + T * (0.00059 - T * 0.001813));
  const e0 = 23 + (26 + seconds / 60) / 60;
  const obliquity = e0 + 0.00256 * Math.cos(omega * RAD);

  const declination =
    Math.asin(Math.sin(obliquity * RAD) * Math.sin(lambda * RAD)) / RAD;

  // Equation of time (minutes)
  const y = Math.tan((obliquity / 2) * RAD) ** 2;
  const eqTime =
    (4 *
      (y * Math.sin(2 * L0 * RAD) -
        2 * e * Math.sin(M * RAD) +
        4 * e * y * Math.sin(M * RAD) * Math.cos(2 * L0 * RAD) -
        0.5 * y * y * Math.sin(4 * L0 * RAD) -
        1.25 * e * e * Math.sin(2 * M * RAD))) /
    RAD;

  const utcMinutes =
    date.getUTCHours() * 60 +
    date.getUTCMinutes() +
    date.getUTCSeconds() / 60 +
    date.getUTCMilliseconds() / 60000;

  const trueSolarTime = (((utcMinutes + eqTime + 4 * lon) % 1440) + 1440) % 1440;
  let hourAngle = trueSolarTime / 4 - 180;
  if (hourAngle < -180) hourAngle += 360;

  const latRad = lat * RAD;
  const declRad = declination * RAD;
  const haRad = hourAngle * RAD;

  const cosZenith =
    Math.sin(latRad) * Math.sin(declRad) +
    Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad);
  const zenith = Math.acos(Math.min(1, Math.max(-1, cosZenith))) / RAD;
  const elevation = 90 - zenith;

  const cosAz =
    (Math.sin(latRad) * Math.cos(zenith * RAD) - Math.sin(declRad)) /
    (Math.cos(latRad) * Math.sin(zenith * RAD));
  const az = Math.acos(Math.min(1, Math.max(-1, cosAz))) / RAD;
  const azimuth = hourAngle > 0 ? (az + 180) % 360 : (540 - az) % 360;

  return { declination, elevation, azimuth };
};

const fmt = (n: number, digits = 4) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

const compass = (azimuth: number): string => {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(azimuth / 22.5) % 16];
};

const cell: React.CSSProperties = {
  textAlign: "left",
  padding: "0.35rem 0.75rem",
  borderBottom: "1px solid #bbb",
};

export default function SunPage() {
  const now = new Date();
  const lat = readEnvFloat("VERCEL_LATITUDE", "LATITUDE");
  const lon = readEnvFloat("VERCEL_LONGITUDE", "LONGITUDE");

  const hasLocation = lat !== null && lon !== null;
  const sun = hasLocation ? solarPosition(now, lat, lon) : null;

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Sun Position</h1>
      <p>
        Computed from the Vercel-provided location environment variables and
        the current UTC time at request.
      </p>

      <h2>Location &amp; Time</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <th style={cell}>Latitude</th>
            <td style={cell}>
              {lat !== null ? (
                `${fmt(lat, 4)}°`
              ) : (
                <em>VERCEL_LATITUDE / LATITUDE not set</em>
              )}
            </td>
          </tr>
          <tr>
            <th style={cell}>Longitude</th>
            <td style={cell}>
              {lon !== null ? (
                `${fmt(lon, 4)}°`
              ) : (
                <em>VERCEL_LONGITUDE / LONGITUDE not set</em>
              )}
            </td>
          </tr>
          <tr>
            <th style={cell}>Time (UTC)</th>
            <td style={cell}>{now.toISOString()}</td>
          </tr>
        </tbody>
      </table>

      <h2>Sun</h2>
      {sun ? (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            <tr>
              <th style={cell}>Azimuth (angle in the sky)</th>
              <td style={cell}>
                {fmt(sun.azimuth)}° ({compass(sun.azimuth)})
              </td>
            </tr>
            <tr>
              <th style={cell}>Elevation / inclination above horizon</th>
              <td style={cell}>
                {fmt(sun.elevation)}°{" "}
                {sun.elevation < 0 && <em>(below the horizon)</em>}
              </td>
            </tr>
            <tr>
              <th style={cell}>Declination</th>
              <td style={cell}>{fmt(sun.declination)}°</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p>
          Set the <code>VERCEL_LATITUDE</code> and{" "}
          <code>VERCEL_LONGITUDE</code> environment variables to compute the
          sun&apos;s position.
        </p>
      )}
    </main>
  );
}
