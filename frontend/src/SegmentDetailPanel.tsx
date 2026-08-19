import type { CSSProperties } from "react";

export type SelectedFeature =
  | {
      kind: "segment";
      name: string | null;
      conditionType: string | null;
      conditionTags: Record<string, string>;
    }
  | {
      kind: "zone";
      zoneName: string | null;
      zoneAbbreviation: string | null;
      infoUrl: string | null;
    };

interface SegmentDetailPanelProps {
  feature: SelectedFeature;
  onClose: () => void;
}

const PANEL_STYLE: CSSProperties = {
  position: "absolute",
  bottom: 20,
  left: 20,
  zIndex: 1,
  background: "white",
  padding: "12px 16px",
  borderRadius: 6,
  boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
  fontFamily: "sans-serif",
  fontSize: "13px",
  maxWidth: 320,
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
    <div style={PANEL_STYLE}>
      <button
        onClick={onClose}
        style={{
          float: "right",
          border: "none",
          background: "none",
          cursor: "pointer",
        }}
        aria-label="Close"
      >
        ✕
      </button>
      {feature.kind === "segment" ? (
        <>
          <strong>{feature.name ?? "Unnamed street"}</strong>
          <div>
            {CONDITION_LABELS[feature.conditionType ?? ""] ??
              "Unknown condition"}
          </div>
          {feature.conditionTags["parking:condition:left:time_interval"] && (
            <div>
              Restricted:{" "}
              {feature.conditionTags["parking:condition:left:time_interval"]}
            </div>
          )}
          {feature.conditionTags["parking:condition:right:time_interval"] && (
            <div>
              Restricted:{" "}
              {feature.conditionTags["parking:condition:right:time_interval"]}
            </div>
          )}
          {feature.conditionTags["parking:condition:left:residents"] && (
            <div>
              Residents exempt:{" "}
              {feature.conditionTags["parking:condition:left:residents"]}
            </div>
          )}
          <div style={{ fontSize: "11px", color: "#777", marginTop: 4 }}>
            Source: OpenStreetMap
          </div>
        </>
      ) : (
        <>
          <strong>{feature.zoneName ?? "Resident parking zone"}</strong>
          {feature.zoneAbbreviation && (
            <div>Zone: {feature.zoneAbbreviation}</div>
          )}
          <div>
            Residents-only permit zone - non-residents need a Parkschein here.
          </div>
          {feature.infoUrl && (
            <div>
              <a href={feature.infoUrl} target="_blank" rel="noreferrer">
                Official zone info (Stadt Köln)
              </a>
            </div>
          )}
          <div style={{ fontSize: "11px", color: "#777", marginTop: 4 }}>
            Source: Stadt Köln Bewohnerparkgebiete
          </div>
        </>
      )}
    </div>
  );
}
