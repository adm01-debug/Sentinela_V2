import * as React from "react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pipette } from "lucide-react";

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  presets?: string[];
  className?: string;
  disabled?: boolean;
}

const DEFAULT_PRESETS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e",
  "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#64748b",
];

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
}

export function ColorPicker({
  value = "#3b82f6",
  onChange,
  presets = DEFAULT_PRESETS,
  className,
  disabled = false,
}: ColorPickerProps) {
  const [color, setColor] = React.useState(value);
  const [rgb, setRgb] = React.useState(() => hexToRgb(value) || { r: 59, g: 130, b: 246 });

  React.useEffect(() => {
    setColor(value);
    const newRgb = hexToRgb(value);
    if (newRgb) setRgb(newRgb);
  }, [value]);

  const handleHexChange = (hex: string) => {
    setColor(hex);
    const newRgb = hexToRgb(hex);
    if (newRgb) setRgb(newRgb);
    onChange?.(hex);
  };

  const handleRgbChange = (channel: "r" | "g" | "b", val: number) => {
    const newRgb = { ...rgb, [channel]: Math.max(0, Math.min(255, val)) };
    setRgb(newRgb);
    const hex = rgbToHex(newRgb.r, newRgb.g, newRgb.b);
    setColor(hex);
    onChange?.(hex);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-full justify-start gap-2", className)} disabled={disabled}>
          <div className="h-4 w-4 rounded border" style={{ backgroundColor: color }} />
          <span className="flex-1 text-left font-mono text-sm">{color}</span>
          <Pipette className="h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3">
        <div className="space-y-3">
          <div className="h-24 rounded-lg border" style={{ backgroundColor: color }} />
          <div className="grid grid-cols-6 gap-1">
            {presets.map((preset) => (
              <button
                key={preset}
                className={cn("h-6 w-6 rounded border-2 transition-transform hover:scale-110", color === preset ? "border-foreground" : "border-transparent")}
                style={{ backgroundColor: preset }}
                onClick={() => handleHexChange(preset)}
              />
            ))}
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Label className="w-10 text-xs">HEX</Label>
              <Input value={color} onChange={(e) => handleHexChange(e.target.value)} className="h-7 font-mono text-xs" />
            </div>
            <div className="flex gap-2">
              <Label className="w-10 text-xs">R</Label>
              <Input type="number" min={0} max={255} value={rgb.r} onChange={(e) => handleRgbChange("r", Number(e.target.value))} className="h-7 text-xs" />
              <Label className="w-10 text-xs">G</Label>
              <Input type="number" min={0} max={255} value={rgb.g} onChange={(e) => handleRgbChange("g", Number(e.target.value))} className="h-7 text-xs" />
              <Label className="w-10 text-xs">B</Label>
              <Input type="number" min={0} max={255} value={rgb.b} onChange={(e) => handleRgbChange("b", Number(e.target.value))} className="h-7 text-xs" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ColorPicker;
