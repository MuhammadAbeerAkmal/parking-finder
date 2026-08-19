import { useEffect, useRef, useState } from "react";
import { Map as MapLibreMap, StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useParkingData } from "./useParkingData";
import InfoBar from "./InfoBar";
import SegmentDetailPanel, { SelectedFeature } from "./SegmentDetailPanel";

// Raw OSM tile server - fine for local dev, but has usage-policy limits for
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

// MapLibre serializes nested-object properties on GeoJSON-source features to
// JSON strings (vector-tile encoding only supports flat primitives), so
// condition_tags needs parsing back out rather than being a real object here.
function parseConditionTags(raw: unknown): Record<string, string> {
  if (typeof raw !== "string") return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default function MapView(): JSX.Element {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layersReady, setLayersReady] = useState(false);
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [selectedFeature, setSelectedFeature] =
    useState<SelectedFeature | null>(null);
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

  // Try to center on the user's real location. Falls back to Cologne
  // silently on denial/error/timeout - the InfoBar already makes clear that
  // a sparse/empty view means "not checked yet," not "confirmed free," so
  // showing the user's actual (possibly data-sparse) area is fine now.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        map.setCenter([position.coords.longitude, position.coords.latitude]);
        map.setZoom(15);
      },
      () => {
        /* denied or unavailable - stay on the Cologne default */
      },
      { timeout: 8000 },
    );
  }, [mapLoaded]);

  // Add data layers + interactions once both the map has loaded and the data has arrived.
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

    const interactiveLayers = ["segments-line", "zones-fill"];
    for (const layerId of interactiveLayers) {
      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });
    }

    map.on("click", "segments-line", (e) => {
      const props = e.features?.[0]?.properties;
      if (!props) return;
      setSelectedFeature({
        kind: "segment",
        name: props.name ?? null,
        conditionType: props.condition_type ?? null,
        conditionTags: parseConditionTags(props.condition_tags),
      });
    });

    map.on("click", "zones-fill", (e) => {
      const props = e.features?.[0]?.properties;
      if (!props) return;
      setSelectedFeature({
        kind: "zone",
        zoneName: props.zone_name ?? null,
        zoneAbbreviation: props.zone_abbreviation ?? null,
        infoUrl: props.info_url ?? null,
      });
    });

    setLayersReady(true);
  }, [mapLoaded, parkingData]);

  // "Show only confirmed-free" filter - hides everything else rather than
  // just streets, since a visible permit zone while filtering for "free"
  // would read as contradictory.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !layersReady) return;

    map.setFilter(
      "segments-line",
      showFreeOnly ? ["==", ["get", "condition_type"], "free"] : null,
    );
    const zonesVisibility = showFreeOnly ? "none" : "visible";
    map.setLayoutProperty("zones-fill", "visibility", zonesVisibility);
    map.setLayoutProperty("zones-outline", "visibility", zonesVisibility);
  }, [showFreeOnly, layersReady]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />
      <InfoBar showFreeOnly={showFreeOnly} onToggleFreeOnly={setShowFreeOnly} />
      {selectedFeature && (
        <SegmentDetailPanel
          feature={selectedFeature}
          onClose={() => setSelectedFeature(null)}
        />
      )}
    </div>
  );
}
