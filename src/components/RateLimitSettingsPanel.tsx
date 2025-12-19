import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, RefreshCw, Save, Shield, Smartphone, Brain, MapPin } from "lucide-react";
import { useRateLimitSettings, RateLimitThresholds } from "@/hooks/useRateLimitSettings";

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
