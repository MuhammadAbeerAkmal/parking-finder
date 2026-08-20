// Colors validated with the dataviz skill's checker, not eyeballed. Only 3
// map colors (not the raw 5 OSM values) because a map is an "all-pairs"
// case - any two colors can end up adjacent - and only the first 3
// categorical slots clear colorblind-safety there. Full detail stays in the
// click-to-inspect panel.

export type ConditionBucket = "free" | "conditional" | "restricted";

export const CONDITION_BUCKET_COLORS: Record<ConditionBucket, string> = {
  free: "#008300",
  restricted: "#e34948",
  conditional: "#2a78d6",
} as const;

// Which raw OSM condition_type values fall into each bucket - the single
// source of truth for both the map's paint expression and the filter logic.
export const BUCKET_RAW_VALUES: Record<ConditionBucket, string[]> = {
  free: ["free"],
  restricted: ["no_stopping", "no_parking"],
  conditional: ["ticket", "residents"],
};

export const DEFAULT_SEGMENT_COLOR = "#898781";
export const ZONE_COLOR = "#4a3aa7";

// Green/red sits in the colorblind-WARN band, legal only with secondary
// encoding - labeled swatches satisfy that, not decoration.
export const FILTER_ITEMS: { bucket: ConditionBucket; label: string }[] = [
  { bucket: "free", label: "Free" },
  { bucket: "conditional", label: "Ticket / permit required" },
  { bucket: "restricted", label: "No stopping / no parking" },
];

export const COLORS = {
  surface: "#fcfcfb",
  pagePlane: "#f9f9f7",
  textPrimary: "#0b0b0b",
  textSecondary: "#52514e",
  textMuted: "#898781",
  border: "rgba(11, 11, 11, 0.10)",
} as const;

export const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", sans-serif';
export const RADIUS = 8;
export const SPACING = { xs: 4, sm: 8, md: 12, lg: 16 } as const;
