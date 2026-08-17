import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useParkingData } from "./useParkingData";

// Raw OSM tile server — fine for local dev, but has usage-policy limits for
// real traffic. Before a real launch this should move to a proper tile
// provider (MapTiler free tier, Stadia Maps, or self-hosted).
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap contributors",
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
};

const COLOGNE_CENTER: [number, number] = [6.9603, 50.9375];

const CONDITION_COLORS: Record<string, string> = {
  free: "#2e7d32",
  ticket: "#f9a825",
  no_stopping: "#c62828",
  no_parking: "#e53935",
  residents: "#6a1b9a",
};
const DEFAULT_SEGMENT_COLOR = "#757575";

export default function MapView(): JSX.Element {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const parkingData = useParkingData();

  // Create the map once.
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new MapLibreMap({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: COLOGNE_CENTER,
      zoom: 12,
    });
    mapRef.current = map;

    // Keeps MapLibre's internal canvas resolution in sync if the container
    // resizes after creation (e.g. a browser window resize).
    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(mapContainer.current);

    map.on("error", (e) => {
      console.error("MapLibre error:", e.error);
    });

    map.on("load", () => setMapLoaded(true));

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add data layers once both the map has loaded and the data has arrived.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !parkingData || map.getSource("zones")) return;

    map.addSource("zones", { type: "geojson", data: parkingData.zones });
    map.addLayer({
      id: "zones-fill",
      type: "fill",
      source: "zones",
      paint: { "fill-color": "#6a1b9a", "fill-opacity": 0.25 },
    });
    map.addLayer({
      id: "zones-outline",
      type: "line",
      source: "zones",
      paint: { "line-color": "#6a1b9a", "line-width": 2 },
    });

    map.addSource("segments", { type: "geojson", data: parkingData.segments });
    map.addLayer({
      id: "segments-line",
      type: "line",
      source: "segments",
      paint: {
        "line-width": 4,
        "line-color": [
          "match",
          ["get", "condition_type"],
          "free",
          CONDITION_COLORS.free,
          "ticket",
          CONDITION_COLORS.ticket,
          "no_stopping",
          CONDITION_COLORS.no_stopping,
          "no_parking",
          CONDITION_COLORS.no_parking,
          "residents",
          CONDITION_COLORS.residents,
          DEFAULT_SEGMENT_COLOR,
        ],
      },
    });
  }, [mapLoaded, parkingData]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}