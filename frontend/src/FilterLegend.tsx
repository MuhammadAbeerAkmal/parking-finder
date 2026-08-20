import type { CSSProperties } from "react";
import {
  COLORS,
  CONDITION_BUCKET_COLORS,
  ConditionBucket,
  FILTER_ITEMS,
  FONT_STACK,
  RADIUS,
  SPACING,
  ZONE_COLOR,
} from "./theme";

interface FilterLegendProps {
  visibleBuckets: Set<ConditionBucket>;
  onToggleBucket: (bucket: ConditionBucket) => void;
  showZones: boolean;
  onToggleZones: () => void;
}

const PANEL_STYLE: CSSProperties = {
  position: "absolute",
  top: SPACING.lg,
  right: SPACING.lg,
  zIndex: 1,
  background: COLORS.surface,
  border: `1px solid ${COLORS.border}`,
  borderRadius: RADIUS,
  padding: SPACING.xs,
  fontFamily: FONT_STACK,
  fontSize: 13,
  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
};

// Real touch targets (not just visually-sized text) - this panel has no
// hover state to lean on for affordance on a phone, so each row needs to
// be big enough to tap accurately on its own.
const ROW_STYLE: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: SPACING.sm,
  padding: `${SPACING.sm}px ${SPACING.sm}px`,
  minHeight: 40,
  borderRadius: RADIUS - 2,
  cursor: "pointer",
  background: "none",
  border: "none",
  width: "100%",
  textAlign: "left",
  font: "inherit",
};

const SWATCH_STYLE: CSSProperties = {
  width: 14,
  height: 14,
  borderRadius: 4,
  flexShrink: 0,
};

function FilterRow({
  color,
  label,
  active,
  onClick,
}: {
  color: string;
  label: string;
  active: boolean;
  onClick: () => void;
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      style={{
        ...ROW_STYLE,
        opacity: active ? 1 : 0.4,
        color: active ? COLORS.textPrimary : COLORS.textMuted,
      }}
      aria-pressed={active}
    >
      <span style={{ ...SWATCH_STYLE, background: color }} />
      {label}
    </button>
  );
}

// Doubles as both the legend (always shows what each color means) and a
// real filter (click any row to show/hide it) - merging what used to be a
// static legend plus a separate single checkbox into one interactive
// control, rather than two overlapping pieces of UI.
export default function FilterLegend({
  visibleBuckets,
  onToggleBucket,
  showZones,
  onToggleZones,
}: FilterLegendProps): JSX.Element {
  return (
    <div style={PANEL_STYLE}>
      {FILTER_ITEMS.map((item) => (
        <FilterRow
          key={item.bucket}
          color={CONDITION_BUCKET_COLORS[item.bucket]}
          label={item.label}
          active={visibleBuckets.has(item.bucket)}
          onClick={() => onToggleBucket(item.bucket)}
        />
      ))}
      <FilterRow
        color={ZONE_COLOR}
        label="Resident permit zone"
        active={showZones}
        onClick={onToggleZones}
      />
    </div>
  );
}
