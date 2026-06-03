import { cookies, headers } from "next/headers";
import DeviceLocationButton from "./device-location-button";

// Server component so we can read the Vercel-provided location and capture the
// UTC time at request render. `force-dynamic` ensures every request recomputes
// the time + sun position instead of serving a build-time cached snapshot.
export const dynamic = "force-dynamic";

const RAD = Math.PI / 180;

const parseFloatOrNull = (raw: string | null | undefined): number | null => {
  if (raw === undefined || raw === null || raw.trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

const decodeHeader = (raw: string | null | undefined): string | null => {
  if (raw === undefined || raw === null || raw.trim() === "") return null;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

// Great-circle distance between two points, in kilometres.
const haversineKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * RAD;
  const dLon = (lon2 - lon1) * RAD;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * RAD) * Math.cos(lat2 * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

// Reverse-geocode a coordinate to "city, state, COUNTRY" via OpenStreetMap's
// Nominatim service. Returns null on any failure so the page still renders.
const reverseGeocode = async (
  lat: number,
  lon: number,
): Promise<string | null> => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10`,
      {
        cache: "no-store",
        headers: { "User-Agent": "eve-build-calculator/sun-page" },
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    const a = data.address ?? {};
    const city =
      a.city ?? a.town ?? a.village ?? a.hamlet ?? a.county ?? a.suburb;
    const parts = [
      city,
      a.state,
      typeof a.country_code === "string"
        ? a.country_code.toUpperCase()
        : a.country,
    ].filter((p): p is string => typeof p === "string" && p.length > 0);
    return parts.length > 0 ? parts.join(", ") : null;
  } catch {
    return null;
  }
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

export default async function SunPage() {
  const now = new Date();

  // Vercel populates these geolocation headers automatically from the
  // visitor's IP. Fall back to env vars so it also works in local dev.
  const h = await headers();
  const lat =
    parseFloatOrNull(h.get("x-vercel-ip-latitude")) ??
    parseFloatOrNull(process.env.VERCEL_LATITUDE ?? process.env.LATITUDE);
  const lon =
    parseFloatOrNull(h.get("x-vercel-ip-longitude")) ??
    parseFloatOrNull(process.env.VERCEL_LONGITUDE ?? process.env.LONGITUDE);

  // Vercel's estimate of the place behind that IP. The city is URL-encoded.
  const place = [
    decodeHeader(h.get("x-vercel-ip-city")),
    decodeHeader(h.get("x-vercel-ip-country-region")),
    decodeHeader(h.get("x-vercel-ip-country")),
  ]
    .filter((part): part is string => part !== null)
    .join(", ");

  // Location the browser shared via the "Use my device location" button,
  // saved to a cookie so we can compare it against the Vercel IP estimate.
  const cookieStore = await cookies();
  let deviceLat: number | null = null;
  let deviceLon: number | null = null;
  const deviceRaw = cookieStore.get("device-geo")?.value;
  if (deviceRaw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(deviceRaw));
      deviceLat = parseFloatOrNull(String(parsed.lat));
      deviceLon = parseFloatOrNull(String(parsed.lon));
    } catch {
      // Ignore a malformed cookie.
    }
  }

  // For a user-provided location, reverse-geocode it to a city and measure how
  // far it is from the Vercel IP estimate.
  const devicePlace =
    deviceLat !== null && deviceLon !== null
      ? await reverseGeocode(deviceLat, deviceLon)
      : null;
  const deviceDistanceKm =
    deviceLat !== null && deviceLon !== null && lat !== null && lon !== null
      ? haversineKm(lat, lon, deviceLat, deviceLon)
      : null;

  const hasLocation = lat !== null && lon !== null;
  const sun = hasLocation ? solarPosition(now, lat, lon) : null;

  return (
    <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
      <h1>Sun Position</h1>
      <p>
        Computed from the Vercel-provided location and the current UTC time at
        request.
      </p>

      <h2>Location &amp; Time</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <th style={cell}>Latitude</th>
            <td style={cell}>
              {lat !== null ? `${fmt(lat, 4)}°` : <em>unavailable</em>}
            </td>
          </tr>
          <tr>
            <th style={cell}>Longitude</th>
            <td style={cell}>
              {lon !== null ? `${fmt(lon, 4)}°` : <em>unavailable</em>}
            </td>
          </tr>
          <tr>
            <th style={cell}>Nearest city / state / country</th>
            <td style={cell}>
              {place !== "" ? place : <em>unavailable</em>}
            </td>
          </tr>
          <tr>
            <th style={cell}>Device latitude (browser)</th>
            <td style={cell}>
              {deviceLat !== null ? `${fmt(deviceLat, 4)}°` : <em>not shared</em>}
            </td>
          </tr>
          <tr>
            <th style={cell}>Device longitude (browser)</th>
            <td style={cell}>
              {deviceLon !== null ? (
                `${fmt(deviceLon, 4)}°`
              ) : (
                <em>not shared</em>
              )}
            </td>
          </tr>
          {(deviceLat !== null || deviceLon !== null) && (
            <>
              <tr>
                <th style={cell}>Device city (reverse lookup)</th>
                <td style={cell}>
                  {devicePlace ?? <em>unavailable</em>}
                </td>
              </tr>
              <tr>
                <th style={cell}>Distance from Vercel location</th>
                <td style={cell}>
                  {deviceDistanceKm !== null ? (
                    `${fmt(deviceDistanceKm, 1)} km (${fmt(
                      deviceDistanceKm * 0.621371,
                      1,
                    )} mi)`
                  ) : (
                    <em>unavailable</em>
                  )}
                </td>
              </tr>
            </>
          )}
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
              <th style={cell}>Declination</th>
              <td style={cell}>{fmt(sun.declination)}°</td>
            </tr>
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
          </tbody>
        </table>
      ) : (
        <p>
          No location available. On Vercel this comes from the{" "}
          <code>x-vercel-ip-latitude</code> /{" "}
          <code>x-vercel-ip-longitude</code> headers; locally, set the{" "}
          <code>LATITUDE</code> and <code>LONGITUDE</code> environment
          variables.
        </p>
      )}

      <DeviceLocationButton />
    </main>
  );
}
