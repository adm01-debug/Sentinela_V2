import React, { Suspense, memo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolicyToggle } from '@/components/PolicyToggle';
import { ApplicationRuleRow } from '@/components/ApplicationRuleRow';
import { AddApplicationDialog } from '@/components/AddApplicationDialog';
import { EditApplicationDialog } from '@/components/EditApplicationDialog';
import { SettingsAuditLog } from '@/components/SettingsAuditLog';
import { MFASettings } from '@/components/MFASettings';
import { AlertSettingsPanel } from '@/components/AlertSettingsPanel';
import { useSettings, type ApplicationRule } from '@/hooks/useSettings';
import { categoryLabels } from '@/data/settingsData';
import { SettingsSkeleton } from '@/components/PageSkeletons';
import { ArrowLeft, Shield, AppWindow, Bell, UserCog, Search, Loader2 } from 'lucide-react';

const SettingsContent = memo(function SettingsContent() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { policies, appRules, loading, updatePolicy, updateAppRule, addAppRule, deleteAppRule, editAppRule } = useSettings();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingRule, setEditingRule] = useState<ApplicationRule | null>(null);

  const handlePolicyToggle = (id: string, enabled: boolean) => {
    updatePolicy(id, enabled);
  };

  const handleStatusChange = (id: string, status: 'allowed' | 'blocked' | 'monitored') => {
    updateAppRule(id, status);
  };

  const devicePolicies = policies.filter(p => p.category === 'device');
  const screenPolicies = policies.filter(p => p.category === 'screen');
  const networkPolicies = policies.filter(p => p.category === 'network');

  const filteredApps = appRules.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const appCategories = ['all', 'productivity', 'communication', 'entertainment', 'development', 'other'];

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4 px-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{t('settings.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('settings.subtitle')}</p>
          </div>
        </div>
      </header>

      <main className="container px-4 py-6">
        <Tabs defaultValue="policies" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="policies" className="gap-2">
              <Shield className="h-4 w-4" />
              {t('navigation.policies')}
            </TabsTrigger>
            <TabsTrigger value="apps" className="gap-2">
              <AppWindow className="h-4 w-4" />
              {t('monitoring.applications')}
            </TabsTrigger>
            <TabsTrigger value="alerts" className="gap-2">
              <Bell className="h-4 w-4" />
              {t('settings.alerts')}
            </TabsTrigger>
            <TabsTrigger value="account" className="gap-2">
              <UserCog className="h-4 w-4" />
              {t('common.profile')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="policies" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">{categoryLabels.device}</h3>
              <div className="space-y-3">
                {devicePolicies.map(policy => (
                  <PolicyToggle 
                    key={policy.id} 
                    policy={policy} 
                    onToggle={handlePolicyToggle} 
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">{categoryLabels.screen}</h3>
              <div className="space-y-3">
                {screenPolicies.map(policy => (
                  <PolicyToggle 
                    key={policy.id} 
                    policy={policy} 
                    onToggle={handlePolicyToggle} 
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">{categoryLabels.network}</h3>
              <div className="space-y-3">
                {networkPolicies.map(policy => (
                  <PolicyToggle 
                    key={policy.id} 
                    policy={policy} 
                    onToggle={handlePolicyToggle} 
                  />
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6">
              <h3 className="text-lg font-semibold mb-2">{t('common.details')}</h3>
              <p className="text-sm text-muted-foreground">
                <span className="text-success font-medium">{policies.filter(p => p.enabled).length}</span> {t('common.active')} {t('navigation.policies').toLowerCase()}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="apps" className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder={t('common.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {appCategories.map(cat => (
                  <Button
                    key={cat}
                    variant={categoryFilter === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat === 'all' ? t('common.all') : categoryLabels[cat]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{t('monitoring.applications')}</h3>
                <AddApplicationDialog onAdd={addAppRule} />
              </div>
              <div className="space-y-3">
                {filteredApps.map(rule => (
                  <ApplicationRuleRow 
                    key={rule.id} 
                    rule={rule} 
                    onStatusChange={handleStatusChange}
                    onDelete={deleteAppRule}
                    onEdit={setEditingRule}
                  />
                ))}
                {filteredApps.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    {t('common.noResults')}
                  </p>
                )}
              </div>
            </div>

            <EditApplicationDialog
              rule={editingRule}
              open={!!editingRule}
              onOpenChange={(open) => !open && setEditingRule(null)}
              onSave={editAppRule}
            />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl border border-success/30 bg-success/5 p-4 text-center">
                <p className="text-2xl font-bold text-success">
                  {appRules.filter(r => r.status === 'allowed').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('common.enabled')}</p>
              </div>
              <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 text-center">
                <p className="text-2xl font-bold text-warning">
                  {appRules.filter(r => r.status === 'monitored').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('monitoring.title')}</p>
              </div>
              <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-center">
                <p className="text-2xl font-bold text-destructive">
                  {appRules.filter(r => r.status === 'blocked').length}
                </p>
                <p className="text-sm text-muted-foreground">{t('common.disabled')}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">{t('settings.emailNotifications')}</h3>
              <AlertSettingsPanel />
            </div>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <MFASettings />

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">{t('settings.security')}</h3>
              <div className="space-y-4 text-sm text-muted-foreground">
                <p>• {t('auth.password')}</p>
                <p>• {t('auth.mfaRequired')}</p>
                <p>• {t('auth.sessionExpired')}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <SettingsAuditLog />
        </div>
      </main>
    </div>
  );
});

const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid gap-4 md:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
    </div>
    <Skeleton className="h-96" />
  </div>
);

export default function Settings() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <SettingsContent />
      </Suspense>
    </ErrorBoundary>
  );
}
