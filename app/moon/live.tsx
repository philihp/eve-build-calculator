"use client";

import { useNow } from "../sun/live";
import { cell, compass, fmt } from "../sun/solar";
import { moonPosition } from "./moon";

export function LiveMoon({
  lat,
  lon,
}: {
  lat: number | null;
  lon: number | null;
}) {
  const now = useNow();

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
