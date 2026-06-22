import type { Editor } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import { PALETTE } from "../constants/palette";

interface ColorSwatchesProps {
  /** Currently active color value (hex string or empty). */
  activeColor: string | undefined;
  /** Icon rendered in the trigger button. */
  triggerIcon: React.ReactNode;
  /** Callback fired when a color is selected. */
  onColorChange: (color: string) => void;
}

/**
 * Reusable color-picker popover shared by text-color and highlight groups.
 * Eliminates the ~90 lines of duplicated swatch JSX from the old toolbar.
 */
export function ColorSwatches({ activeColor, triggerIcon, onColorChange }: ColorSwatchesProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="editor-tool-btn"
          style={activeColor ? { color: activeColor } : undefined}
          title="Color"
        >
          {triggerIcon}
        </button>
      </PopoverTrigger>
      <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
        <ToggleGroup
          type="single"
          value={activeColor ?? ""}
          className="flex flex-col gap-1"
        >
          {PALETTE.map(({ value, label }) => (
            <ToggleGroupItem
              key={value}
              value={value}
              aria-label={`toggle ${label}`}
              onClick={() => onColorChange(value)}
              className="flex w-full items-center"
            >
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: value }}
              />
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </PopoverContent>
    </Popover>
  );
}

export default ColorSwatches;
