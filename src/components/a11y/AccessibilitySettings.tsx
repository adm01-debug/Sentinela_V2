import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Eye,
  Type,
  Sun,
  Moon,
  Contrast,
  ZoomIn,
  ZoomOut,
  Volume2,
  VolumeX,
  MousePointer2,
  Sparkles,
  Monitor,
  Save,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export interface AccessibilitySettingsData {
  // Visual
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'default' | 'dyslexic' | 'monospace';
  lineHeight: 'compact' | 'normal' | 'relaxed';
  letterSpacing: 'tight' | 'normal' | 'wide';
  
  // Colors
  highContrast: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  
  // Motion
  reducedMotion: boolean;
  
  // Cursor
  largeCursor: boolean;
  cursorHighlight: boolean;
  
  // Focus
  focusIndicatorSize: 'default' | 'large' | 'extra-large';
  
  // Audio
  screenReaderOptimized: boolean;
  soundEffects: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettingsData = {
  fontSize: 'medium',
  fontFamily: 'default',
  lineHeight: 'normal',
  letterSpacing: 'normal',
  highContrast: false,
  colorBlindMode: 'none',
  reducedMotion: false,
  largeCursor: false,
  cursorHighlight: false,
  focusIndicatorSize: 'default',
  screenReaderOptimized: false,
  soundEffects: true,
};

interface AccessibilitySettingsProps {
  settings?: AccessibilitySettingsData;
  onSave: (settings: AccessibilitySettingsData) => void;
  onReset?: () => void;
}

function AccessibilitySettingsComponent({
  settings: initialSettings,
  onSave,
  onReset,
}: AccessibilitySettingsProps) {
  const [settings, setSettings] = useState<AccessibilitySettingsData>(
    initialSettings || DEFAULT_SETTINGS
  );
  const [hasChanges, setHasChanges] = useState(false);

  // Detect system preferences
  useEffect(() => {
    if (!initialSettings) {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
      const prefersHighContrast = window.matchMedia(
        '(prefers-contrast: more)'
      ).matches;

      setSettings((prev) => ({
        ...prev,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      }));
    }
  }, [initialSettings]);

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;

    // Font size
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px',
      xlarge: '20px',
    };
    root.style.setProperty('--base-font-size', fontSizeMap[settings.fontSize]);

    // High contrast
    root.classList.toggle('high-contrast', settings.highContrast);

    // Reduced motion
    root.classList.toggle('reduce-motion', settings.reducedMotion);

    // Color blind mode
    root.setAttribute('data-color-blind-mode', settings.colorBlindMode);

    // Large cursor
    root.classList.toggle('large-cursor', settings.largeCursor);

    // Focus indicator
    root.setAttribute('data-focus-size', settings.focusIndicatorSize);
  }, [settings]);

  const updateSetting = useCallback(
    <K extends keyof AccessibilitySettingsData>(
      key: K,
      value: AccessibilitySettingsData[K]
    ) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
      setHasChanges(true);
    },
    []
  );

  const handleSave = useCallback(() => {
    onSave(settings);
    setHasChanges(false);
  }, [settings, onSave]);

  const handleReset = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
    onReset?.();
  }, [onReset]);

  return (
    <div className="space-y-6">
      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Type className="h-5 w-5" />
            Tipografia
          </CardTitle>
          <CardDescription>
            Ajuste o tamanho e estilo do texto
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size */}
          <div className="space-y-3">
            <Label>Tamanho da Fonte</Label>
            <RadioGroup
              value={settings.fontSize}
              onValueChange={(value) =>
                updateSetting('fontSize', value as AccessibilitySettingsData['fontSize'])
              }
              className="grid grid-cols-4 gap-2"
            >
              {[
                { value: 'small', label: 'P', title: 'Pequeno' },
                { value: 'medium', label: 'M', title: 'Médio' },
                { value: 'large', label: 'G', title: 'Grande' },
                { value: 'xlarge', label: 'XG', title: 'Extra Grande' },
              ].map((option) => (
                <div key={option.value}>
                  <RadioGroupItem
                    value={option.value}
                    id={`font-${option.value}`}
                    className="sr-only"
                  />
                  <Label
                    htmlFor={`font-${option.value}`}
                    className={cn(
                      'flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-colors',
                      settings.fontSize === option.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-muted-foreground'
                    )}
                    title={option.title}
                  >
                    <span className="font-medium">{option.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Font Family */}
          <div className="space-y-2">
            <Label>Família da Fonte</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) =>
                updateSetting('fontFamily', value as AccessibilitySettingsData['fontFamily'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão do Sistema</SelectItem>
                <SelectItem value="dyslexic">OpenDyslexic (Dislexia)</SelectItem>
                <SelectItem value="monospace">Monoespaçada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Line Height */}
          <div className="space-y-2">
            <Label>Espaçamento entre Linhas</Label>
            <Select
              value={settings.lineHeight}
              onValueChange={(value) =>
                updateSetting('lineHeight', value as AccessibilitySettingsData['lineHeight'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compacto</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="relaxed">Relaxado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Letter Spacing */}
          <div className="space-y-2">
            <Label>Espaçamento entre Letras</Label>
            <Select
              value={settings.letterSpacing}
              onValueChange={(value) =>
                updateSetting('letterSpacing', value as AccessibilitySettingsData['letterSpacing'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tight">Apertado</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="wide">Amplo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visual
          </CardTitle>
          <CardDescription>
            Configurações de contraste e cores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="high-contrast">Alto Contraste</Label>
              <p className="text-xs text-muted-foreground">
                Aumenta o contraste entre elementos
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Modo Daltonismo</Label>
            <Select
              value={settings.colorBlindMode}
              onValueChange={(value) =>
                updateSetting('colorBlindMode', value as AccessibilitySettingsData['colorBlindMode'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                <SelectItem value="protanopia">Protanopia (Vermelho)</SelectItem>
                <SelectItem value="deuteranopia">Deuteranopia (Verde)</SelectItem>
                <SelectItem value="tritanopia">Tritanopia (Azul)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Motion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Movimento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="reduced-motion">Reduzir Movimento</Label>
              <p className="text-xs text-muted-foreground">
                Minimiza animações e transições
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={settings.reducedMotion}
              onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cursor & Focus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MousePointer2 className="h-5 w-5" />
            Cursor e Foco
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="large-cursor">Cursor Grande</Label>
              <p className="text-xs text-muted-foreground">
                Aumenta o tamanho do cursor
              </p>
            </div>
            <Switch
              id="large-cursor"
              checked={settings.largeCursor}
              onCheckedChange={(checked) => updateSetting('largeCursor', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="cursor-highlight">Destacar Cursor</Label>
              <p className="text-xs text-muted-foreground">
                Adiciona um círculo ao redor do cursor
              </p>
            </div>
            <Switch
              id="cursor-highlight"
              checked={settings.cursorHighlight}
              onCheckedChange={(checked) => updateSetting('cursorHighlight', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Indicador de Foco</Label>
            <Select
              value={settings.focusIndicatorSize}
              onValueChange={(value) =>
                updateSetting('focusIndicatorSize', value as AccessibilitySettingsData['focusIndicatorSize'])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Padrão</SelectItem>
                <SelectItem value="large">Grande</SelectItem>
                <SelectItem value="extra-large">Extra Grande</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audio */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            Áudio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="screen-reader">Otimizado para Leitor de Tela</Label>
              <p className="text-xs text-muted-foreground">
                Melhora a semântica para leitores de tela
              </p>
            </div>
            <Switch
              id="screen-reader"
              checked={settings.screenReaderOptimized}
              onCheckedChange={(checked) =>
                updateSetting('screenReaderOptimized', checked)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sound-effects">Efeitos Sonoros</Label>
              <p className="text-xs text-muted-foreground">
                Sons de feedback para ações
              </p>
            </div>
            <Switch
              id="sound-effects"
              checked={settings.soundEffects}
              onCheckedChange={(checked) => updateSetting('soundEffects', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Restaurar Padrões
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges} className="gap-2">
          <Save className="h-4 w-4" />
          Salvar Configurações
        </Button>
      </div>
    </div>
  );
}

export const AccessibilitySettings = memo(AccessibilitySettingsComponent);
export default AccessibilitySettings;
