import { useState } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks';
import { Tabs, TabsContent, TabsList, TabsTrigger  } from '@/components/ui/tabs';
import { GeneralSettings } from '@/components/settings/GeneralSettings';
import { SecuritySettings } from '@/components/settings/SecuritySettings';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { MonitoringSettings } from '@/components/settings/MonitoringSettings';
import { Skeleton } from '@/components/Skeleton';

export const SettingsPage = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  if (isLoading) return <Skeleton height={400} />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettings settings={settings?.general} onSave={(data) => updateSettings.mutate({ general: data })} />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings settings={settings?.security} onSave={(data) => updateSettings.mutate({ security: data })} />
        </TabsContent>
        <TabsContent value="notifications">
          <NotificationSettings settings={settings?.notifications} onSave={(data) => updateSettings.mutate({ notifications: data })} />
        </TabsContent>
        <TabsContent value="monitoring">
          <MonitoringSettings settings={settings?.monitoring} onSave={(data) => updateSettings.mutate({ monitoring: data })} />
        </TabsContent>
      </Tabs>
    </div>
  );
};