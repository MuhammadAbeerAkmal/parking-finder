import { useEffect, useState } from "react";

interface FeatureCollection extends GeoJSON.FeatureCollection {
  attribution: string;
}

interface ParkingData {
  zones: FeatureCollection;
  segments: FeatureCollection;
}

// Returns null until both endpoints have resolved.
export function useParkingData(): ParkingData | null {
  const [data, setData] = useState<ParkingData | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      fetch(`${__API_BASE__}/api/zones`).then((r) => r.json()),
      fetch(`${__API_BASE__}/api/segments`).then((r) => r.json()),
    ]).then(([zones, segments]) => {
      if (!cancelled) {
        setData({ zones, segments });
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}