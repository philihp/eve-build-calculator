import type { ResolvedLocation } from "./geo";
import { LiveClock } from "./sun/live";
import { cell, fmt } from "./sun/solar";

// The "Location & Time" table shared by the /sun and /moon pages. Shows the
// Vercel IP estimate until the visitor shares their device location, which is
// more accurate and replaces it.
export default function LocationTable({ loc }: { loc: ResolvedLocation }) {
  const { lat, lon, place, deviceLat, deviceLon, devicePlace } = loc;
  return (
    <table style={{ width: "100%", borderCollapse: "collapse" }}>
      <tbody>
        {!loc.usingDeviceLocation && (
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
              <td style={cell}>{place !== "" ? place : <em>unavailable</em>}</td>
            </tr>
          </>
        )}
        <tr>
          <th style={cell}>Device latitude (browser)</th>
          <td style={cell}>
            {deviceLat !== null ? `${fmt(deviceLat, 4)}°` : <em>not shared</em>}
          </td>
        </tr>
        <tr>
          <th style={cell}>Device longitude (browser)</th>
          <td style={cell}>
            {deviceLon !== null ? `${fmt(deviceLon, 4)}°` : <em>not shared</em>}
          </td>
        </tr>
        {loc.usingDeviceLocation && (
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
  );
}
