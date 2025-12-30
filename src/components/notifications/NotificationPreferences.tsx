import React, { useState, useCallback, memo } from 'react';
import { Bell, Mail, Smartphone, Volume2, VolumeX, Clock, Filter, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export interface NotificationChannel {
  id: string;
  name: string;
  icon: React.ElementType;
  enabled: boolean;
}

export interface NotificationCategory {
  id: string;
  name: string;
  description: string;
  channels: {
    inApp: boolean;
    email: boolean;
    push: boolean;
  };
}

export interface NotificationSchedule {
  enabled: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  weekendsOnly: boolean;
}

export interface NotificationPreferencesData {
  channels: NotificationChannel[];
  categories: NotificationCategory[];
  schedule: NotificationSchedule;
  soundEnabled: boolean;
  soundVolume: number;
  groupNotifications: boolean;
  showPreviews: boolean;
}

interface NotificationPreferencesProps {
  preferences: NotificationPreferencesData;
  onSave: (preferences: NotificationPreferencesData) => void;
  isLoading?: boolean;
}

const defaultChannels: NotificationChannel[] = [
  { id: 'inApp', name: 'Notificações no App', icon: Bell, enabled: true },
  { id: 'email', name: 'Email', icon: Mail, enabled: true },
  { id: 'push', name: 'Push no Navegador', icon: Smartphone, enabled: false },
];

const defaultCategories: NotificationCategory[] = [
  {
    id: 'security',
    name: 'Segurança',
    description: 'Alertas de segurança, tentativas de login e violações',
    channels: { inApp: true, email: true, push: true },
  },
  {
    id: 'activity',
    name: 'Atividade',
    description: 'Atualizações sobre atividades de funcionários',
    channels: { inApp: true, email: false, push: false },
  },
  {
    id: 'system',
    name: 'Sistema',
    description: 'Atualizações do sistema, manutenção e novidades',
    channels: { inApp: true, email: true, push: false },
  },
  {
    id: 'alerts',
    name: 'Alertas',
    description: 'Alertas personalizados e regras configuradas',
    channels: { inApp: true, email: true, push: true },
  },
];

function NotificationPreferencesComponent({
  preferences,
  onSave,
  isLoading = false,
}: NotificationPreferencesProps) {
  const [localPrefs, setLocalPrefs] = useState(preferences);
  const [hasChanges, setHasChanges] = useState(false);

  const updatePrefs = useCallback((updates: Partial<NotificationPreferencesData>) => {
    setLocalPrefs((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);

  const updateChannel = useCallback((channelId: string, enabled: boolean) => {
    setLocalPrefs((prev) => ({
      ...prev,
      channels: prev.channels.map((c) =>
        c.id === channelId ? { ...c, enabled } : c
      ),
    }));
    setHasChanges(true);
  }, []);

  const updateCategory = useCallback(
    (categoryId: string, channelId: keyof NotificationCategory['channels'], enabled: boolean) => {
      setLocalPrefs((prev) => ({
        ...prev,
        categories: prev.categories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, channels: { ...cat.channels, [channelId]: enabled } }
            : cat
        ),
      }));
      setHasChanges(true);
    },
    []
  );

  const updateSchedule = useCallback((updates: Partial<NotificationSchedule>) => {
    setLocalPrefs((prev) => ({
      ...prev,
      schedule: { ...prev.schedule, ...updates },
    }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localPrefs);
    setHasChanges(false);
  }, [localPrefs, onSave]);

  return (
    <div className="space-y-6">
      {/* Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>
            Escolha como deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {localPrefs.channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <div key={channel.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <Label htmlFor={`channel-${channel.id}`} className="cursor-pointer">
                    {channel.name}
                  </Label>
                </div>
                <Switch
                  id={`channel-${channel.id}`}
                  checked={channel.enabled}
                  onCheckedChange={(enabled) => updateChannel(channel.id, enabled)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Categorias
          </CardTitle>
          <CardDescription>
            Configure notificações por categoria
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {localPrefs.categories.map((category, index) => (
            <div key={category.id}>
              {index > 0 && <Separator className="mb-4" />}
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${category.id}-inApp`}
                      checked={category.channels.inApp}
                      onCheckedChange={(enabled) =>
                        updateCategory(category.id, 'inApp', enabled)
                      }
                      className="scale-75"
                    />
                    <Label
                      htmlFor={`${category.id}-inApp`}
                      className="text-xs cursor-pointer"
                    >
                      App
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${category.id}-email`}
                      checked={category.channels.email}
                      onCheckedChange={(enabled) =>
                        updateCategory(category.id, 'email', enabled)
                      }
                      className="scale-75"
                    />
                    <Label
                      htmlFor={`${category.id}-email`}
                      className="text-xs cursor-pointer"
                    >
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`${category.id}-push`}
                      checked={category.channels.push}
                      onCheckedChange={(enabled) =>
                        updateCategory(category.id, 'push', enabled)
                      }
                      className="scale-75"
                    />
                    <Label
                      htmlFor={`${category.id}-push`}
                      className="text-xs cursor-pointer"
                    >
                      Push
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {localPrefs.soundEnabled ? (
              <Volume2 className="h-5 w-5" />
            ) : (
              <VolumeX className="h-5 w-5" />
            )}
            Som
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">Sons de notificação</Label>
            <Switch
              id="sound-enabled"
              checked={localPrefs.soundEnabled}
              onCheckedChange={(enabled) => updatePrefs({ soundEnabled: enabled })}
            />
          </div>
          
          {localPrefs.soundEnabled && (
            <div className="space-y-2">
              <Label className="text-sm">Volume</Label>
              <Slider
                value={[localPrefs.soundVolume]}
                onValueChange={([value]) => updatePrefs({ soundVolume: value })}
                max={100}
                step={10}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">
                {localPrefs.soundVolume}%
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário Silencioso
          </CardTitle>
          <CardDescription>
            Pause notificações durante horários específicos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet-hours">Ativar horário silencioso</Label>
            <Switch
              id="quiet-hours"
              checked={localPrefs.schedule.enabled}
              onCheckedChange={(enabled) => updateSchedule({ enabled })}
            />
          </div>

          {localPrefs.schedule.enabled && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Início</Label>
                  <Select
                    value={localPrefs.schedule.quietHoursStart}
                    onValueChange={(value) => updateSchedule({ quietHoursStart: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Fim</Label>
                  <Select
                    value={localPrefs.schedule.quietHoursEnd}
                    onValueChange={(value) => updateSchedule({ quietHoursEnd: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                          {`${i.toString().padStart(2, '0')}:00`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="weekends-only" className="text-sm">
                  Aplicar apenas nos fins de semana
                </Label>
                <Switch
                  id="weekends-only"
                  checked={localPrefs.schedule.weekendsOnly}
                  onCheckedChange={(weekendsOnly) => updateSchedule({ weekendsOnly })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Other Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Outras Configurações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="group-notifications">Agrupar notificações</Label>
              <p className="text-xs text-muted-foreground">
                Agrupe notificações similares em uma única
              </p>
            </div>
            <Switch
              id="group-notifications"
              checked={localPrefs.groupNotifications}
              onCheckedChange={(groupNotifications) =>
                updatePrefs({ groupNotifications })
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-previews">Mostrar prévias</Label>
              <p className="text-xs text-muted-foreground">
                Exibir conteúdo da notificação em pop-ups
              </p>
            </div>
            <Switch
              id="show-previews"
              checked={localPrefs.showPreviews}
              onCheckedChange={(showPreviews) => updatePrefs({ showPreviews })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isLoading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Salvando...' : 'Salvar Preferências'}
        </Button>
      </div>
    </div>
  );
}

export const NotificationPreferences = memo(NotificationPreferencesComponent);
export default NotificationPreferences;
