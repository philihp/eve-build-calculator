import Link from "next/link";
import { resolveLocation } from "../geo";
import LocationTable from "../location-table";
import DeviceLocationButton from "../sun/device-location-button";
import { LiveTimeProvider } from "../sun/live";
import { LiveMoon } from "./live";

// Server component so we can read the Vercel-provided location. The time and
// moon position are then re-rendered live in the browser.
// `force-dynamic` keeps the location/request data fresh per request.
export const dynamic = "force-dynamic";

export default async function MoonPage() {
  const now = new Date();
  const loc = await resolveLocation();

  return (
    <LiveTimeProvider initialISO={now.toISOString()}>
      <main style={{ padding: "1rem", maxWidth: 720, margin: "0 auto" }}>
        <h1>Moon Position</h1>
        <p>
          Computed from your device location when shared, otherwise the
          Vercel-provided IP estimate. The time and moon position update live.
        </p>

        <h2>Location &amp; Time</h2>
        <LocationTable loc={loc} />

        <h2>Moon</h2>
        <p style={{ marginTop: 0, color: "#555", fontSize: "0.9rem" }}>
          {loc.usingDeviceLocation
            ? "Using your device location."
            : "Using the Vercel IP-based location estimate."}
        </p>
        <LiveMoon lat={loc.effLat} lon={loc.effLon} />

        <DeviceLocationButton />

        <p style={{ marginTop: "1.5rem" }}>
          <Link href="/sun">Where is the Sun? →</Link>
        </p>
      </main>
    </LiveTimeProvider>
  );
}
