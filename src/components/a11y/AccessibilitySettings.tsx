import * as React from 'react';
import { useState } from 'react';
import { useHighContrast } from '@/hooks/useHighContrast';
import { useColorBlindMode, type ColorBlindMode } from '@/hooks/useColorBlindMode';
import { Settings, Eye, Contrast, Volume2, Keyboard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export interface AccessibilitySettingsProps {
  className?: string;
}

export function AccessibilitySettings({ className }: AccessibilitySettingsProps) {
  const { isHighContrast, toggleHighContrast } = useHighContrast();
  const { mode: colorBlindMode, setColorBlindMode, SVGFilters } = useColorBlindMode();
  const [fontSize, setFontSize] = useState(100);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderAnnouncements, setScreenReaderAnnouncements] = useState(true);

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value[0]);
    document.documentElement.style.fontSize = `${value[0]}%`;
  };

  const handleReduceMotionChange = (checked: boolean) => {
    setReduceMotion(checked);
    document.documentElement.classList.toggle('reduce-motion', checked);
  };

  const resetSettings = () => {
    setFontSize(100);
    document.documentElement.style.fontSize = '100%';
    if (isHighContrast) toggleHighContrast();
    setColorBlindMode('none');
    setReduceMotion(false);
    document.documentElement.classList.remove('reduce-motion');
    setScreenReaderAnnouncements(true);
  };

  return (
    <>
      <SVGFilters />
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Accessibility Settings
          </CardTitle>
          <CardDescription>
            Customize the interface to meet your accessibility needs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Visual Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Visual
            </h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <Switch id="high-contrast" checked={isHighContrast} onCheckedChange={toggleHighContrast} />
            </div>

            <div className="space-y-2">
              <Label>Color Blind Mode</Label>
              <Select value={colorBlindMode} onValueChange={(v) => setColorBlindMode(v as ColorBlindMode)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                  <SelectItem value="achromatopsia">Achromatopsia (Grayscale)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Font Size: {fontSize}%</Label>
              </div>
              <Slider value={[fontSize]} onValueChange={handleFontSizeChange} min={75} max={150} step={5} />
            </div>
          </div>

          <Separator />

          {/* Motion Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Contrast className="h-4 w-4" />
              Motion & Animation
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reduce-motion">Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
              </div>
              <Switch id="reduce-motion" checked={reduceMotion} onCheckedChange={handleReduceMotionChange} />
            </div>
          </div>

          <Separator />

          {/* Screen Reader Settings */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Screen Reader
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sr-announcements">Live Announcements</Label>
                <p className="text-xs text-muted-foreground">Announce important updates</p>
              </div>
              <Switch id="sr-announcements" checked={screenReaderAnnouncements} onCheckedChange={setScreenReaderAnnouncements} />
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetSettings}>Reset to Defaults</Button>
            <Button variant="ghost" asChild>
              <a href="/help/accessibility" className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" />
                Keyboard Shortcuts
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default AccessibilitySettings;
