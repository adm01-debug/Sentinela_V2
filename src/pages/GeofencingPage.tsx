import { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Users, Search, Bell, LayoutDashboard, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useGeofencingPage } from '@/hooks/useGeofencingPage';
import { GeofenceDashboard } from '@/components/geofence/GeofenceDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import { PolygonUpload } from '@/components/geofence/PolygonUpload';

// Parse numeric input tolerando vazio / NaN — evita gravar NaN no state
const parseNumField = (raw: string, fallback = 0, isInt = false): number => {
  if (raw === '' || raw === '-' || raw === undefined) return fallback;
  const n = isInt ? parseInt(raw, 10) : parseFloat(raw);
  return Number.isFinite(n) ? n : fallback;
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export default function GeofencingPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const {
    selectedGeofence, setSelectedGeofence,
    isDialogOpen, isDeleteDialogOpen, setIsDeleteDialogOpen,
    editingGeofence, formData, setFormData,
    geofences, stats, isLoading,
    isCreating, isUpdating, isDeleting,
    handleOpenCreate, handleOpenEdit, handleCloseDialog, handleSubmit, handleDelete,
  } = useGeofencingPage();

  if (isLoading) {
    return <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 md:grid-cols-3 gap-4">{[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}</div></div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geofencing"
        description="Configure cercas geográficas e áreas monitoradas"
        showBackButton={false}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/geofencing/alerts')} className="h-9 gap-2">
              <Bell className="h-4 w-4" />
              Ver Alertas
            </Button>
            <Button onClick={handleOpenCreate} className="h-9 gap-2">
              <Plus className="h-4 w-4" />
              Nova Geofence
            </Button>
          </div>
        }
      />


      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list" className="gap-2">
            <MapPin className="h-4 w-4" />
            Geofences
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold">{stats.total}</p><p className="text-xs text-muted-foreground">Total</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-success">{stats.active}</p><p className="text-xs text-muted-foreground">Ativas</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-destructive">{stats.restricted}</p><p className="text-xs text-muted-foreground">Restritas</p></CardContent></Card>
            <Card><CardContent className="pt-4 text-center"><p className="text-2xl font-bold text-info">{stats.required}</p><p className="text-xs text-muted-foreground">Obrigatórias</p></CardContent></Card>
          </div>

          {/* Geofences Grid */}
          {geofences.length === 0 ? (
            <Card><CardContent className="py-12 text-center text-muted-foreground"><MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" /><p>Nenhuma geofence configurada.</p></CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {geofences.map(geo => (
                <Card key={geo.id} className={`cursor-pointer transition-shadow hover:shadow-md ${selectedGeofence?.id === geo.id ? 'ring-2 ring-primary' : ''}`} onClick={() => setSelectedGeofence(geo)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: geo.color }} />
                        {geo.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); handleOpenEdit(geo); }}><Edit className="h-3 w-3" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={e => { e.stopPropagation(); setSelectedGeofence(geo); setIsDeleteDialogOpen(true); }}><Trash2 className="h-3 w-3" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{geo.description || 'Sem descrição'}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={geo.is_active ? 'default' : 'secondary'}>{geo.is_active ? 'Ativa' : 'Inativa'}</Badge>
                      <Badge variant="outline"><Users className="h-3 w-3 mr-1" />{geo.employees_count || 0}</Badge>
                      <Badge variant="outline">{geo.radius}m</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">📍 {geo.center_lat?.toFixed(4)}, {geo.center_lng?.toFixed(4)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="dashboard">
          <GeofenceDashboard />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingGeofence ? 'Editar Geofence' : 'Nova Geofence'}</DialogTitle>
            <DialogDescription>
              Configure os detalhes da área monitorada. Para polígonos, você pode desenhar ou importar coordenadas.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Ex: Escritório Central" />
              </div>
              <div className="space-y-2">
                <Label>Tipo de Área</Label>
                <Select value={formData.type} onValueChange={(v: string) => setFormData(prev => ({ ...prev, type: v as 'circle' | 'polygon' }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="circle">Circular (Raio)</SelectItem>
                    <SelectItem value="polygon">Polígono (Livre)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="Descrição opcional" />
            </div>

            {formData.type === 'circle' ? (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Latitude</Label>
                  <Input type="number" step="0.0001" min={-90} max={90} value={formData.center_lat}
                    onChange={e => setFormData(prev => ({ ...prev, center_lat: clamp(parseNumField(e.target.value, 0), -90, 90) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Longitude</Label>
                  <Input type="number" step="0.0001" min={-180} max={180} value={formData.center_lng}
                    onChange={e => setFormData(prev => ({ ...prev, center_lng: clamp(parseNumField(e.target.value, 0), -180, 180) }))} />
                </div>
                <div className="space-y-2">
                  <Label>Raio (m)</Label>
                  <Input type="number" min={1} value={formData.radius}
                    onChange={e => setFormData(prev => ({ ...prev, radius: Math.max(1, parseNumField(e.target.value, 1, true)) }))} />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Coordenadas do Polígono</Label>
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1" onClick={() => setIsUploadOpen(true)}>
                    <Upload className="h-3 w-3" />
                    Importar / Upload
                  </Button>
                </div>
                <div className="bg-muted p-3 rounded-md max-h-32 overflow-auto text-xs font-mono border">
                  {formData.coordinates && formData.coordinates.length > 0 
                    ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-success font-semibold">
                          <CheckCircle2 className="h-3 w-3" />
                          {formData.coordinates.length} pontos validados
                        </div>
                        <div className="opacity-70">
                          {JSON.stringify(formData.coordinates.slice(0, 3))}...
                        </div>
                      </div>
                    )
                    : (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <AlertCircle className="h-3 w-3" />
                        Nenhuma coordenada definida.
                      </div>
                    )}
                </div>
              </div>
            )}

            <PolygonUpload 
              isOpen={isUploadOpen} 
              onClose={() => setIsUploadOpen(false)} 
              onUpload={(coords) => setFormData(prev => ({ ...prev, coordinates: coords }))}
            />

            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-md">
              <div className="space-y-0.5">
                <Label>Status da Geofence</Label>
                <p className="text-xs text-muted-foreground">Áreas inativas não geram alertas</p>
              </div>
              <Switch checked={formData.is_active} onCheckedChange={v => setFormData(prev => ({ ...prev, is_active: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={isCreating || isUpdating || !formData.name}>
              {isCreating || isUpdating ? 'Salvando...' : editingGeofence ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Geofence?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. A geofence "{selectedGeofence?.name}" será removida permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Excluindo...' : 'Excluir'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export { GeofencingPage };
