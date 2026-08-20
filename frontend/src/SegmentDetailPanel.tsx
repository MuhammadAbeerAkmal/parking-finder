import type { CSSProperties } from "react";
import { COLORS, FONT_STACK, SPACING } from "./theme";

interface ClickPosition {
  lat: number;
  lng: number;
}

export type SelectedFeature =
  | ({
      kind: "segment";
      name: string | null;
      conditionType: string | null;
      conditionTags: Record<string, string>;
    } & ClickPosition)
  | ({
      kind: "zone";
      zoneName: string | null;
      zoneAbbreviation: string | null;
      infoUrl: string | null;
    } & ClickPosition);

// Coordinates, not an address string - precise (the exact spot clicked) and
// works even for unnamed/ambiguous streets. No API key needed for this URL
// scheme, and it works cross-platform (opens the Google Maps app on mobile
// if installed, the website otherwise).
function directionsUrl({ lat, lng }: ClickPosition): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

interface SegmentDetailPanelProps {
  feature: SelectedFeature;
  onClose: () => void;
}

// Positioning/breakpoint behavior lives in app.css's .detail-sheet class -
// full-width bottom sheet on phones, compact floating card on wider
// screens. Only visual styling (colors, type, spacing) stays inline here.
const PANEL_STYLE: CSSProperties = {
  zIndex: 1,
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  padding: `${SPACING.sm}px ${SPACING.md}px ${SPACING.lg}px`,
  boxShadow: "0 -2px 12px rgba(0,0,0,0.15)",
  fontFamily: FONT_STACK,
  fontSize: 14,
  color: COLORS.textPrimary,
};

// A drag-handle bar is the near-universal visual cue for "this is a sheet,
// it can be dismissed" - matters most on mobile where there's no hover
// state to hint at interactivity another way.
const HANDLE_STYLE: CSSProperties = {
  width: 36,
  height: 4,
  borderRadius: 2,
  background: COLORS.border,
  margin: `${SPACING.sm}px auto ${SPACING.xs}px`,
};

const CLOSE_BUTTON_STYLE: CSSProperties = {
  position: "absolute",
  top: SPACING.xs,
  right: SPACING.xs,
  border: "none",
  background: "none",
  cursor: "pointer",
  color: COLORS.textMuted,
  fontSize: 16,
  width: 40,
  height: 40,
};

const SOURCE_STYLE: CSSProperties = {
  fontSize: 11,
  color: COLORS.textMuted,
  marginTop: SPACING.xs,
};

// condition_type values are OSM's raw vocabulary - plain English labels read
// better in a detail panel than the raw tag value.
const CONDITION_LABELS: Record<string, string> = {
  free: "Free - no restriction found",
  ticket: "Parkschein (ticket) required",
  no_stopping: "No stopping (Halteverbot)",
  no_parking: "No parking (Parkverbot)",
  residents: "Residents-only permit zone",
};

export default function SegmentDetailPanel({
  feature,
  onClose,
}: SegmentDetailPanelProps): JSX.Element {
  return (
    <div className="detail-sheet" style={PANEL_STYLE}>
      <div style={HANDLE_STYLE} />
      <button onClick={onClose} style={CLOSE_BUTTON_STYLE} aria-label="Close">
        ✕
      </button>
      {feature.kind === "segment" ? (
        <>
          <strong>{feature.name ?? "Unnamed street"}</strong>
          <div style={{ color: COLORS.textSecondary, marginTop: SPACING.xs }}>
            {CONDITION_LABELS[feature.conditionType ?? ""] ??
              "Unknown condition"}
          </div>
          {feature.conditionTags["parking:condition:left:time_interval"] && (
            <div style={{ color: COLORS.textSecondary }}>
              Restricted:{" "}
              {feature.conditionTags["parking:condition:left:time_interval"]}
            </div>
          )}
          {feature.conditionTags["parking:condition:right:time_interval"] && (
            <div style={{ color: COLORS.textSecondary }}>
              Restricted:{" "}
              {feature.conditionTags["parking:condition:right:time_interval"]}
            </div>
          )}
          {feature.conditionTags["parking:condition:left:residents"] && (
            <div style={{ color: COLORS.textSecondary }}>
              Residents exempt:{" "}
              {feature.conditionTags["parking:condition:left:residents"]}
            </div>
          )}
          <div style={{ marginTop: SPACING.sm }}>
            <a href={directionsUrl(feature)} target="_blank" rel="noreferrer">
              Get directions
            </a>
          </div>
          <div style={SOURCE_STYLE}>Source: OpenStreetMap</div>
        </>
      ) : (
        <>
          <strong>{feature.zoneName ?? "Resident parking zone"}</strong>
          {feature.zoneAbbreviation && (
            <div style={{ color: COLORS.textSecondary, marginTop: SPACING.xs }}>
              Zone: {feature.zoneAbbreviation}
            </div>
          )}
          <div style={{ color: COLORS.textSecondary }}>
            Residents-only permit zone - non-residents need a Parkschein here.
          </div>
          {feature.infoUrl && (
            <div style={{ marginTop: SPACING.xs }}>
              <a href={feature.infoUrl} target="_blank" rel="noreferrer">
                Official zone info (Stadt Köln)
              </a>
            </div>
          )}
          <div style={{ marginTop: SPACING.sm }}>
            <a href={directionsUrl(feature)} target="_blank" rel="noreferrer">
              Get directions
            </a>
          </div>
          <div style={SOURCE_STYLE}>Source: Stadt Köln Bewohnerparkgebiete</div>
        </>
      )}
    </div>
  );
}
