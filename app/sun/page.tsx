import { cookies, headers } from "next/headers";
import DeviceLocationButton from "./device-location-button";
import { LiveClock, LiveSun, LiveTimeProvider } from "./live";
import { cell, fmt } from "./solar";

// Server component so we can read the Vercel-provided location. The time and
// sun position are then re-rendered live in the browser every second.
// `force-dynamic` keeps the location/request data fresh per request.
export const dynamic = "force-dynamic";

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

  // For a user-provided location, reverse-geocode it to a city.
  const devicePlace =
    deviceLat !== null && deviceLon !== null
      ? await reverseGeocode(deviceLat, deviceLon)
      : null;

  // Compute the sun from the browser-shared device location when we have it: it
  // is the visitor's actual position, whereas the Vercel headers are only an IP
  // estimate that can be hundreds of kilometres off (enough to flip the sun
  // above/below the horizon). Fall back to the IP estimate otherwise.
  const sunLat = deviceLat ?? lat;
  const sunLon = deviceLon ?? lon;
  const usingDeviceLocation = deviceLat !== null && deviceLon !== null;

  return (
    <LiveTimeProvider initialISO={now.toISOString()}>
      <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
        <h1>Sun Position</h1>
        <p>
          Computed from your device location when shared, otherwise the
          Vercel-provided IP estimate. The time and sun position update live.
        </p>

        <h2>Location &amp; Time</h2>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {!usingDeviceLocation && (
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
              <th style={cell}>Device latitude (browser)</th>
              <td style={cell}>
                {deviceLat !== null ? (
                  `${fmt(deviceLat, 4)}°`
                ) : (
                  <em>not shared</em>
                )}
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
            {usingDeviceLocation && (
              <tr>
                <th style={cell}>Device city (reverse lookup)</th>
                <td style={cell}>{devicePlace ?? <em>unavailable</em>}</td>
              </tr>
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
        <p style={{ marginTop: 0, color: "#555", fontSize: "0.9rem" }}>
          {usingDeviceLocation
            ? "Using your device location."
            : "Using the Vercel IP-based location estimate."}
        </p>
        <LiveSun lat={sunLat} lon={sunLon} />

        <DeviceLocationButton />
      </main>
    </LiveTimeProvider>
  );
}
