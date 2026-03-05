import { useState } from 'react';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

// Re-export for route compatibility
export { default } from '@/pages/Settings';
export const SettingsPage = () => {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  if (isLoading) return <Skeleton className="h-[400px]" />;

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
        <TabsContent value="general"><p className="text-muted-foreground p-4">General settings.</p></TabsContent>
        <TabsContent value="security"><p className="text-muted-foreground p-4">Security settings.</p></TabsContent>
        <TabsContent value="notifications"><p className="text-muted-foreground p-4">Notifications settings.</p></TabsContent>
        <TabsContent value="monitoring"><p className="text-muted-foreground p-4">Monitoring settings.</p></TabsContent>
      </Tabs>
    </div>
  );
};
