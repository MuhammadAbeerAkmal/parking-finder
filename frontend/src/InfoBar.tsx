import { useState } from "react";
import type { CSSProperties } from "react";
import { COLORS, FONT_STACK, RADIUS, SPACING } from "./theme";

const CARD_STYLE: CSSProperties = {
  position: "absolute",
  top: SPACING.lg,
  left: SPACING.lg,
  zIndex: 1,
  maxWidth: 300,
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS,
  padding: `${SPACING.sm}px ${SPACING.md}px`,
  fontFamily: FONT_STACK,
  fontSize: 12,
  lineHeight: 1.5,
  color: COLORS.textSecondary,
  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
};

const ICON_BUTTON_STYLE: CSSProperties = {
  position: "absolute",
  top: SPACING.lg,
  left: SPACING.lg,
  zIndex: 1,
  width: 40,
  height: 40,
  borderRadius: "50%",
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
  cursor: "pointer",
  fontSize: 16,
  fontFamily: FONT_STACK,
  color: COLORS.textSecondary,
};

const DISMISS_BUTTON_STYLE: CSSProperties = {
  float: "right",
  border: "none",
  background: "none",
  cursor: "pointer",
  color: COLORS.textMuted,
  fontSize: 14,
  marginLeft: SPACING.xs,
};

const ATTRIBUTION_STYLE: CSSProperties = {
  marginTop: SPACING.xs,
  fontSize: 10,
  color: COLORS.textMuted,
};

// Expanded by default so the disclaimer is actually seen once, but
// dismissible to a small icon afterward - a permanent text block eating
// map space on every visit, especially on a phone screen, is worse than
// showing it once and letting people collapse it.
export default function InfoBar(): JSX.Element {
  const [expanded, setExpanded] = useState(true);

  if (!expanded) {
    return (
      <button
        style={ICON_BUTTON_STYLE}
        onClick={() => setExpanded(true)}
        aria-label="Show data info"
      >
        ℹ️
      </button>
    );
  }

  return (
    <div style={CARD_STYLE}>
      <button
        style={DISMISS_BUTTON_STYLE}
        onClick={() => setExpanded(false)}
        aria-label="Collapse"
      >
        ✕
      </button>
      <div>
        <strong style={{ color: COLORS.textPrimary }}>
          Verified parking data for central Köln only.
        </strong>{" "}
        Colored streets/zones are confirmed data; blank areas simply
        haven&apos;t been checked yet - they are <strong>not</strong> confirmed
        free. Always verify against real signage.
      </div>
      <div style={ATTRIBUTION_STYLE}>
        Contains data from OpenStreetMap contributors (ODbL) and Stadt Köln
        Bewohnerparkgebiete (Datenlizenz Deutschland – Zero – Version 2.0).
      </div>
    </div>
  );
}
