import type { CSSProperties } from "react";

interface InfoBarProps {
  showFreeOnly: boolean;
  onToggleFreeOnly: (value: boolean) => void;
}

const BAR_STYLE: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  zIndex: 1,
  background: "rgba(255, 255, 255, 0.95)",
  padding: "10px 14px",
  fontFamily: "sans-serif",
  fontSize: "13px",
  lineHeight: 1.4,
  boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
};

export default function InfoBar({
  showFreeOnly,
  onToggleFreeOnly,
}: InfoBarProps): JSX.Element {
  return (
    <div style={BAR_STYLE}>
      <strong>Verified parking data for central Köln only.</strong> Colored
      streets/zones are confirmed data; blank areas simply haven&apos;t been
      checked yet - they are <strong>not</strong> confirmed free. Always verify
      against real signage.
      <div style={{ marginTop: 6 }}>
        <label>
          <input
            type="checkbox"
            checked={showFreeOnly}
            onChange={(e) => onToggleFreeOnly(e.target.checked)}
          />{" "}
          Show only streets confirmed free
        </label>
      </div>
      <div style={{ marginTop: 4, fontSize: "11px", color: "#555" }}>
        Contains data from OpenStreetMap contributors (ODbL) and Stadt Köln
        Bewohnerparkgebiete (Datenlizenz Deutschland – Zero – Version 2.0).
      </div>
    </div>
  );
}
