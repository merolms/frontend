/**
 * Shared color palette for text-color and highlight swatches.
 * Extracted so both TextColorGroup and HighlightGroup use the
 * same canonical list without duplication.
 */

export interface PaletteColor {
  value: string;
  label: string;
}

export const PALETTE: PaletteColor[] = [
  { value: "#e11d48", label: "Rose" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#2563eb", label: "Blue" },
  { value: "#10b981", label: "Emerald" },
  { value: "#f59e0b", label: "Amber" },
  { value: "#737373", label: "Neutral" },
  { value: "#fafafa", label: "White" },
];
