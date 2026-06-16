import * as React from "react";
import { useState, useCallback, useMemo } from "react";
import { Pipette, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presetColors?: string[];
  showInput?: boolean;
  showPresets?: boolean;
  className?: string;
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#64748b",
  "#1e293b",
  "#000000",
  "#ffffff",
  "#f8fafc",
];

export function ColorPicker({
  value = "#3b82f6",
  onChange,
  presetColors = DEFAULT_PRESETS,
  showInput = true,
  showPresets = true,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [localValue, setLocalValue] = useState(value);
  const [open, setOpen] = useState(false);

  const handleChange = useCallback(
    (newColor: string) => {
      setLocalValue(newColor);
      onChange?.(newColor);
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) onChange?.(newValue);
    },
    [onChange]
  );

  const rgb = useMemo(() => {
    const hex = localValue.replace("#", "");
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }, [localValue]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-full justify-start gap-2", className)}
        >
          <div className="h-6 w-6 rounded border" style={{ backgroundColor: localValue }} />
          <span className="font-mono text-sm">{localValue}</span>
          <Pipette className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="h-12 w-12 rounded-lg border" style={{ backgroundColor: localValue }} />
            <div className="flex-1 space-y-1">
              <Input
                type="color"
                value={localValue}
                onChange={(e) => handleChange(e.target.value)}
                className="h-8 w-full cursor-pointer"
              />
              {showInput && (
                <Input
                  value={localValue}
                  onChange={handleInputChange}
                  className="h-8 font-mono text-xs"
                  maxLength={7}
                />
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <label htmlFor="color-picker-r" className="text-muted-foreground">
                R
              </label>
              <Input
                id="color-picker-r"
                type="number"
                min={0}
                max={255}
                value={rgb.r}
                onChange={(e) =>
                  handleChange(
                    `#${parseInt(e.target.value).toString(16).padStart(2, "0")}${rgb.g.toString(16).padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`
                  )
                }
                className="h-7"
              />
            </div>
            <div>
              <label htmlFor="color-picker-g" className="text-muted-foreground">
                G
              </label>
              <Input
                id="color-picker-g"
                type="number"
                min={0}
                max={255}
                value={rgb.g}
                onChange={(e) =>
                  handleChange(
                    `#${rgb.r.toString(16).padStart(2, "0")}${parseInt(e.target.value).toString(16).padStart(2, "0")}${rgb.b.toString(16).padStart(2, "0")}`
                  )
                }
                className="h-7"
              />
            </div>
            <div>
              <label htmlFor="color-picker-b" className="text-muted-foreground">
                B
              </label>
              <Input
                id="color-picker-b"
                type="number"
                min={0}
                max={255}
                value={rgb.b}
                onChange={(e) =>
                  handleChange(
                    `#${rgb.r.toString(16).padStart(2, "0")}${rgb.g.toString(16).padStart(2, "0")}${parseInt(e.target.value).toString(16).padStart(2, "0")}`
                  )
                }
                className="h-7"
              />
            </div>
          </div>
          {showPresets && (
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Presets</span>
              <div className="grid grid-cols-8 gap-1">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "h-6 w-6 rounded border-2 transition-transform hover:scale-110",
                      localValue === color ? "border-primary" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    onClick={() => handleChange(color)}
                  >
                    {localValue === color && (
                      <Check className="mx-auto h-3 w-3 text-white drop-shadow" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
export default ColorPicker;
