import { useEffect, useState } from "react";

interface FeatureCollection extends GeoJSON.FeatureCollection {
  attribution: string;
}

interface ParkingData {
  zones: FeatureCollection;
  segments: FeatureCollection;
}

const DEFAULT_CITY = "Köln";

// Returns null until both endpoints have resolved. Defaults to Köln (the only
// supported city today) but accepts a different one so this is already ready
// for Phase 3's city selector without needing to change again then.
export function useParkingData(city: string = DEFAULT_CITY): ParkingData | null {
  const [data, setData] = useState<ParkingData | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cityParam = encodeURIComponent(city);

    Promise.all([
      fetch(`${__API_BASE__}/api/zones?city=${cityParam}`).then((r) => r.json()),
      fetch(`${__API_BASE__}/api/segments?city=${cityParam}`).then((r) => r.json()),
    ]).then(([zones, segments]) => {
      if (!cancelled) {
        setData({ zones, segments });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [city]);

  return data;
}