import { cookies, headers } from "next/headers";
import DeviceLocationButton from "./device-location-button";
import { LiveClock, LiveMoon, LiveSun, LiveTimeProvider } from "./live";
import { cell, fmt } from "./solar";

// Server component so we can read the Vercel-provided location. The time and
// sun position are then re-rendered live in the browser every second.
// `force-dynamic` keeps the location/request data fresh per request.
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

  // When the browser has shared a location, treat it as authoritative: the
  // sun/moon are computed from it and the Vercel IP estimate is hidden.
  const usingDevice = deviceLat !== null && deviceLon !== null;
  const effLat = usingDevice ? deviceLat : lat;
  const effLon = usingDevice ? deviceLon : lon;
  const deviceLatStr = deviceLat !== null ? `${fmt(deviceLat, 4)}°` : null;
  const deviceLonStr = deviceLon !== null ? `${fmt(deviceLon, 4)}°` : null;

  return (
    <LiveTimeProvider initialISO={now.toISOString()}>
      <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
        <h1>Sun &amp; Moon Position</h1>
        <p>
          Computed from your device location when shared, otherwise the Vercel
          IP location. The time and positions update every second.
        </p>

        <h2>Location &amp; Time</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {usingDevice ? (
              <>
                <tr>
                  <th style={cell}>Device latitude (browser)</th>
                  <td style={cell}>{deviceLatStr}</td>
                </tr>
                <tr>
                  <th style={cell}>Device longitude (browser)</th>
                  <td style={cell}>{deviceLonStr}</td>
                </tr>
                <tr>
                  <th style={cell}>City (reverse lookup)</th>
                  <td style={cell}>{devicePlace ?? <em>unavailable</em>}</td>
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
            ) : (
              <>
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
              </>
            )}
            <tr>
              <th style={cell}>Time (UTC)</th>
              <td style={cell}>
                <LiveClock />
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Sun</h2>
        <LiveSun lat={effLat} lon={effLon} />

        <h2>Moon</h2>
        <LiveMoon lat={effLat} lon={effLon} />

        <DeviceLocationButton />
      </main>
    </LiveTimeProvider>
  );
}
