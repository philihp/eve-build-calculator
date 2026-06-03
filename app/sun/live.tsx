"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { solarPosition, fmt, compass, cell } from "./solar";
import { moonPosition } from "./moon";

// A single ticking clock shared by every live piece on the page, so the
// displayed time and the sun position are always computed from the same
// instant. Seeded with the server's render time so the first client render
// matches the SSR output (no hydration mismatch), then updated every second.
const NowContext = createContext<Date>(new Date(0));

export function LiveTimeProvider({
  initialISO,
  children,
}: {
  initialISO: string;
  children: ReactNode;
}) {
  const [now, setNow] = useState(() => new Date(initialISO));
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <NowContext.Provider value={now}>{children}</NowContext.Provider>;
}

export function LiveClock() {
  const now = useContext(NowContext);
  return <>{now.toISOString()}</>;
}

export function LiveSun({
  lat,
  lon,
}: {
  lat: number | null;
  lon: number | null;
}) {
  const now = useContext(NowContext);

  if (lat === null || lon === null) {
    return (
      <p>
        No location available. On Vercel this comes from the{" "}
        <code>x-vercel-ip-latitude</code> / <code>x-vercel-ip-longitude</code>{" "}
        headers; locally, set the <code>LATITUDE</code> and{" "}
        <code>LONGITUDE</code> environment variables.
      </p>
    );
  }

  const sun = solarPosition(now, lat, lon);
  return (
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
  );
}

export function LiveMoon({
  lat,
  lon,
}: {
  lat: number | null;
  lon: number | null;
}) {
  const now = useContext(NowContext);

  if (lat === null || lon === null) return null;

  const moon = moonPosition(now, lat, lon);
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        <tr>
          <th style={cell}>Phase</th>
          <td style={cell}>
            {moon.phase} ({fmt(moon.illumination, 1)}% illuminated)
          </td>
        </tr>
        <tr>
          <th style={cell}>Azimuth (angle in the sky)</th>
          <td style={cell}>
            {fmt(moon.azimuth)}° ({compass(moon.azimuth)})
          </td>
        </tr>
        <tr>
          <th style={cell}>Elevation / inclination above horizon</th>
          <td style={cell}>
            {fmt(moon.elevation)}°{" "}
            {moon.elevation < 0 && <em>(below the horizon)</em>}
          </td>
        </tr>
        <tr>
          <th style={cell}>Distance</th>
          <td style={cell}>{fmt(moon.distanceKm, 0)} km</td>
        </tr>
      </tbody>
    </table>
  );
}
