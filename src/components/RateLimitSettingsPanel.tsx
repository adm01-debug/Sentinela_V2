import { useState, memo, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Settings, RefreshCw, Save, Shield, Smartphone, Brain, MapPin, Trash2, Clock, Volume2, Play } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRateLimitSettings, RateLimitThresholds } from "@/hooks/useRateLimitSettings";
import { SoundType, testSound } from "@/utils/notificationSound";

interface EndpointConfigProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  config: {
    maxRequests: number;
    windowSeconds: number;
    alertThreshold: number;
  };
  onChange: (field: string, value: number) => void;
}

const EndpointConfig = ({ title, description, icon, config, onChange }: EndpointConfigProps) => (
  <div className="space-y-4 p-4 border rounded-lg">
    <div className="flex items-center gap-3">
      {icon}
      <div>
        <h4 className="font-medium">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    
    <div className="grid grid-cols-3 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`${title}-maxRequests`}>Max Requisições</Label>
        <Input
          id={`${title}-maxRequests`}
          type="number"
          min={1}
          value={config.maxRequests}
          onChange={(e) => onChange('maxRequests', parseInt(e.target.value) || 1)}
        />
        <p className="text-xs text-muted-foreground">Por janela de tempo</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`${title}-windowSeconds`}>Janela (seg)</Label>
        <Input
          id={`${title}-windowSeconds`}
          type="number"
          min={1}
          value={config.windowSeconds}
          onChange={(e) => onChange('windowSeconds', parseInt(e.target.value) || 1)}
        />
        <p className="text-xs text-muted-foreground">Período de contagem</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor={`${title}-alertThreshold`}>Threshold Alerta</Label>
        <Input
          id={`${title}-alertThreshold`}
          type="number"
          min={1}
          value={config.alertThreshold}
          onChange={(e) => onChange('alertThreshold', parseInt(e.target.value) || 1)}
        />
        <p className="text-xs text-muted-foreground">Bloqueios p/ alertar</p>
      </div>
    </div>
  </div>
);

export const RateLimitSettingsPanel = () => {
  const { settings, isLoading, updateSettings, isUpdating, defaultSettings } = useRateLimitSettings();
  const [localSettings, setLocalSettings] = useState<RateLimitThresholds>(settings);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  useEffect(() => {
    setHasChanges(JSON.stringify(localSettings) !== JSON.stringify(settings));
  }, [localSettings, settings]);

  const handleEndpointChange = (endpoint: keyof Pick<RateLimitThresholds, 'agentCollector' | 'mobileCollector' | 'analyzeActivity' | 'checkGeofence'>, field: string, value: number) => {
    setLocalSettings(prev => ({
      ...prev,
      [endpoint]: {
        ...prev[endpoint],
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    updateSettings(localSettings);
  };

  const handleReset = () => {
    setLocalSettings(defaultSettings);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Configurações de Rate Limiting</CardTitle>
              <CardDescription>
                Ajuste os thresholds de limitação de taxa e alertas por endpoint
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleReset} disabled={isUpdating}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Restaurar Padrão
            </Button>
            <Button size="sm" onClick={handleSave} disabled={!hasChanges || isUpdating}>
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Global Settings */}
        <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
          <div className="space-y-1">
            <Label htmlFor="globalAlert" className="text-base font-medium">
              Alertas por Email Habilitados
            </Label>
            <p className="text-sm text-muted-foreground">
              Enviar alertas quando thresholds forem atingidos
            </p>
          </div>
          <Switch
            id="globalAlert"
            checked={localSettings.globalAlertEnabled}
            onCheckedChange={(checked) => 
              setLocalSettings(prev => ({ ...prev, globalAlertEnabled: checked }))
            }
          />
        </div>

        <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/30">
          <div className="flex-1 space-y-1">
            <Label htmlFor="cooldown" className="text-base font-medium">
              Cooldown de Alertas (minutos)
            </Label>
            <p className="text-sm text-muted-foreground">
              Intervalo mínimo entre alertas do mesmo IP
            </p>
          </div>
          <Input
            id="cooldown"
            type="number"
            min={1}
            className="w-24"
            value={localSettings.alertCooldownMinutes}
            onChange={(e) => 
              setLocalSettings(prev => ({ 
                ...prev, 
                alertCooldownMinutes: parseInt(e.target.value) || 1 
              }))
            }
          />
        </div>

        <Separator />

        {/* Cleanup Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-medium">Limpeza Automática de Logs</h3>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="cleanupEnabled" className="text-base font-medium">
                Limpeza Automática Habilitada
              </Label>
              <p className="text-sm text-muted-foreground">
                Remove logs antigos automaticamente em intervalos regulares
              </p>
            </div>
            <Switch
              id="cleanupEnabled"
              checked={localSettings.cleanup?.enabled ?? true}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ 
                  ...prev, 
                  cleanup: { ...prev.cleanup, enabled: checked } 
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="cleanupFrequency" className="font-medium">
                  Frequência de Limpeza
                </Label>
              </div>
              <Select
                value={String(localSettings.cleanup?.frequencyHours ?? 1)}
                onValueChange={(value) => 
                  setLocalSettings(prev => ({ 
                    ...prev, 
                    cleanup: { ...prev.cleanup, frequencyHours: parseInt(value) } 
                  }))
                }
                disabled={!localSettings.cleanup?.enabled}
              >
                <SelectTrigger id="cleanupFrequency">
                  <SelectValue placeholder="Selecione a frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">A cada 1 hora</SelectItem>
                  <SelectItem value="2">A cada 2 horas</SelectItem>
                  <SelectItem value="4">A cada 4 horas</SelectItem>
                  <SelectItem value="6">A cada 6 horas</SelectItem>
                  <SelectItem value="12">A cada 12 horas</SelectItem>
                  <SelectItem value="24">A cada 24 horas</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Com que frequência o job de limpeza será executado
              </p>
            </div>

            <div className="space-y-2 p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="logRetention" className="font-medium">
                  Retenção de Logs
                </Label>
              </div>
              <Select
                value={String(localSettings.cleanup?.logRetentionHours ?? 24)}
                onValueChange={(value) => 
                  setLocalSettings(prev => ({ 
                    ...prev, 
                    cleanup: { ...prev.cleanup, logRetentionHours: parseInt(value) } 
                  }))
                }
                disabled={!localSettings.cleanup?.enabled}
              >
                <SelectTrigger id="logRetention">
                  <SelectValue placeholder="Selecione o período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="6">6 horas</SelectItem>
                  <SelectItem value="12">12 horas</SelectItem>
                  <SelectItem value="24">24 horas</SelectItem>
                  <SelectItem value="48">48 horas</SelectItem>
                  <SelectItem value="72">72 horas (3 dias)</SelectItem>
                  <SelectItem value="168">168 horas (7 dias)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Logs mais antigos que este período serão removidos
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Sound Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-medium">Sons de Alerta</h3>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
            <div className="space-y-1">
              <Label htmlFor="soundEnabled" className="text-base font-medium">
                Sons de Notificação Habilitados
              </Label>
              <p className="text-sm text-muted-foreground">
                Tocar sons quando alertas forem recebidos
              </p>
            </div>
            <Switch
              id="soundEnabled"
              checked={localSettings.sound?.enabled ?? true}
              onCheckedChange={(checked) => 
                setLocalSettings(prev => ({ 
                  ...prev, 
                  sound: { ...prev.sound, enabled: checked } 
                }))
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3 p-4 border rounded-lg">
              <Label htmlFor="soundType" className="font-medium">Tipo de Som</Label>
              <div className="flex gap-2">
                <Select
                  value={localSettings.sound?.soundType ?? 'chime'}
                  onValueChange={(value) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      sound: { ...prev.sound, soundType: value as SoundType } 
                    }))
                  }
                  disabled={!localSettings.sound?.enabled}
                >
                  <SelectTrigger id="soundType" className="flex-1">
                    <SelectValue placeholder="Selecione o som" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="chime">Chime (Suave)</SelectItem>
                    <SelectItem value="bell">Bell (Sino)</SelectItem>
                    <SelectItem value="alert">Alert (Alerta)</SelectItem>
                    <SelectItem value="alarm">Alarm (Urgente)</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => testSound(
                    localSettings.sound?.soundType ?? 'chime',
                    localSettings.sound?.volume ?? 70
                  )}
                  disabled={!localSettings.sound?.enabled}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Alertas críticos sempre usam som de alarme
              </p>
            </div>

            <div className="space-y-3 p-4 border rounded-lg">
              <Label className="font-medium">Volume: {localSettings.sound?.volume ?? 70}%</Label>
              <Slider
                value={[localSettings.sound?.volume ?? 70]}
                onValueChange={(value) => 
                  setLocalSettings(prev => ({ 
                    ...prev, 
                    sound: { ...prev.sound, volume: value[0] } 
                  }))
                }
                min={10}
                max={100}
                step={10}
                disabled={!localSettings.sound?.enabled}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Ajuste o volume dos alertas sonoros
              </p>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-3">
            <Label className="font-medium">Tocar Som Para:</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="playCritical"
                  checked={localSettings.sound?.playCritical ?? true}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      sound: { ...prev.sound, playCritical: checked } 
                    }))
                  }
                  disabled={!localSettings.sound?.enabled}
                />
                <Label htmlFor="playCritical" className="text-sm text-destructive font-medium">
                  Crítico
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="playHigh"
                  checked={localSettings.sound?.playHigh ?? true}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      sound: { ...prev.sound, playHigh: checked } 
                    }))
                  }
                  disabled={!localSettings.sound?.enabled}
                />
                <Label htmlFor="playHigh" className="text-sm text-orange-500 font-medium">
                  Alto
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="playMedium"
                  checked={localSettings.sound?.playMedium ?? false}
                  onCheckedChange={(checked) => 
                    setLocalSettings(prev => ({ 
                      ...prev, 
                      sound: { ...prev.sound, playMedium: checked } 
                    }))
                  }
                  disabled={!localSettings.sound?.enabled}
                />
                <Label htmlFor="playMedium" className="text-sm text-yellow-500 font-medium">
                  Médio
                </Label>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Endpoint Configurations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configurações por Endpoint</h3>
          
          <EndpointConfig
            title="Agent Collector"
            description="Coleta de dados do agente desktop"
            icon={<Shield className="h-5 w-5 text-blue-500" />}
            config={localSettings.agentCollector}
            onChange={(field, value) => handleEndpointChange('agentCollector', field, value)}
          />

          <EndpointConfig
            title="Mobile Collector"
            description="Coleta de dados de dispositivos móveis"
            icon={<Smartphone className="h-5 w-5 text-green-500" />}
            config={localSettings.mobileCollector}
            onChange={(field, value) => handleEndpointChange('mobileCollector', field, value)}
          />

          <EndpointConfig
            title="Analyze Activity"
            description="Análise de atividade com IA"
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            config={localSettings.analyzeActivity}
            onChange={(field, value) => handleEndpointChange('analyzeActivity', field, value)}
          />

          <EndpointConfig
            title="Check Geofence"
            description="Verificação de localização"
            icon={<MapPin className="h-5 w-5 text-orange-500" />}
            config={localSettings.checkGeofence}
            onChange={(field, value) => handleEndpointChange('checkGeofence', field, value)}
          />
        </div>

        {hasChanges && (
          <div className="flex items-center justify-end p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <p className="text-sm text-amber-600 dark:text-amber-400">
              Você tem alterações não salvas
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
