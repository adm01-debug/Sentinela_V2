import React, { Suspense, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeofencingPage } from '@/hooks/useGeofencingPage';
import { GeofenceStatsCards, GeofenceList } from '@/components/geofencing';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { LocationMap } from '@/components/LocationMap';
import { Plus, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const GeofencingContent = memo(function GeofencingContent() {
  const { t } = useTranslation();
  const {
    selectedGeofence,
    setSelectedGeofence,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingGeofence,
    formData,
    setFormData,
    geofences,
    stats,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    GEOFENCE_COLORS,
  } = useGeofencingPage();

  return (
    <div className="flex-1 space-y-6 p-6">
      <PageHeader
        title={t('geofencing.title')}
        description={t('geofencing.subtitle')}
      >
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          {t('geofencing.addGeofence')}
        </Button>
      </PageHeader>

      <GeofenceStatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{t('geofencing.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <GeofenceList
              geofences={geofences}
              selectedId={selectedGeofence?.id}
              onSelect={setSelectedGeofence}
              onEdit={handleOpenEdit}
              onDelete={(g) => { setSelectedGeofence(g); setIsDeleteDialogOpen(true); }}
              onToggle={() => {}}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('violations.location')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <LocationMap
                geofences={geofences}
                selectedGeofenceId={selectedGeofence?.id}
                onGeofenceClick={setSelectedGeofence}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingGeofence ? t('geofencing.editGeofence') : t('geofencing.addGeofence')}
            </DialogTitle>
            <DialogDescription>
              {t('geofencing.subtitle')}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{t('geofencing.name')}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('geofencing.name')}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">{t('teams.description')}</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('common.optional')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">{t('violations.type')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: 'circle' | 'polygon') => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Círculo</SelectItem>
                    <SelectItem value="polygon">Polígono</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <Select
                  value={formData.color}
                  onValueChange={(v) => setFormData({ ...formData, color: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GEOFENCE_COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.type === 'circle' && (
              <div className="grid gap-2">
                <Label htmlFor="radius">{t('geofencing.radius')}</Label>
                <Input
                  id="radius"
                  type="number"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) || 0 })}
                />
              </div>
            )}

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('geofencing.active')}</Label>
                  <p className="text-sm text-muted-foreground">{t('geofencing.subtitle')}</p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('geofencing.violations')}</Label>
                  <p className="text-sm text-muted-foreground">{t('geofencing.subtitle')}</p>
                </div>
                <Switch
                  checked={formData.restricted}
                  onCheckedChange={(v) => setFormData({ ...formData, restricted: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t('common.required')}</Label>
                  <p className="text-sm text-muted-foreground">{t('geofencing.subtitle')}</p>
                </div>
                <Switch
                  checked={formData.required}
                  onCheckedChange={(v) => setFormData({ ...formData, required: v })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating}>
              {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingGeofence ? t('common.save') : t('common.create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={t('geofencing.deleteGeofence')}
        description={`${t('employees.confirmDelete')} "${selectedGeofence?.name}"?`}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        variant="destructive"
      />
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

export default function Geofencing() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSkeleton />}>
        <GeofencingContent />
      </Suspense>
    </ErrorBoundary>
  );
}
