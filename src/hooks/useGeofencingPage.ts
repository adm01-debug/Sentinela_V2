import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export interface Geofence {
  id: string;
  name: string;
  description?: string;
  type: 'polygon' | 'circle';
  center_lat?: number;
  center_lng?: number;
  radius?: number;
  geometry?: { type: string; coordinates: number[][] };
  color: string;
  is_active: boolean;
  restricted: boolean;
  required: boolean;
  created_at: string;
  employees_count?: number;
}

export interface GeofenceFormData {
  name: string;
  description: string;
  type: 'polygon' | 'circle';
  center_lat: number;
  center_lng: number;
  radius: number;
  color: string;
  is_active: boolean;
  restricted: boolean;
  required: boolean;
}

const initialFormData: GeofenceFormData = {
  name: '',
  description: '',
  type: 'circle',
  center_lat: -23.5505,
  center_lng: -46.6333,
  radius: 500,
  color: '#3b82f6',
  is_active: true,
  restricted: false,
  required: false,
};

export const GEOFENCE_COLORS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#22c55e', label: 'Verde' },
  { value: '#ef4444', label: 'Vermelho' },
  { value: '#f59e0b', label: 'Amarelo' },
  { value: '#8b5cf6', label: 'Roxo' },
  { value: '#ec4899', label: 'Rosa' },
];

export function useGeofencingPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedGeofence, setSelectedGeofence] = useState<Geofence | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingGeofence, setEditingGeofence] = useState<Geofence | null>(null);
  const [formData, setFormData] = useState<GeofenceFormData>(initialFormData);
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 });
  const [mapZoom, setMapZoom] = useState(12);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnPoints, setDrawnPoints] = useState<Array<{ lat: number; lng: number }>>([]);

  const { data: geofences = [], isLoading } = useQuery({
    queryKey: ['geofences'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('geofences')
        .select('*, geofence_employees(count)')
        .order('name');
      if (error) throw error;
      return data.map(g => ({
        ...g,
        employees_count: g.geofence_employees?.[0]?.count || 0,
      })) as Geofence[];
    },
  });

  const { data: events = [] } = useQuery({
    queryKey: ['geofence-events', selectedGeofence?.id],
    queryFn: async () => {
      if (!selectedGeofence) return [];
      const { data, error } = await supabase
        .from('geofence_events')
        .select('*, employees(name)')
        .eq('geofence_id', selectedGeofence.id)
        .order('occurred_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!selectedGeofence,
  });

  const createMutation = useMutation({
    mutationFn: async (data: GeofenceFormData) => {
      const geofenceData = {
        ...data,
        geometry: data.type === 'polygon' && drawnPoints.length >= 3
          ? { type: 'polygon', coordinates: drawnPoints.map(p => [p.lng, p.lat]) }
          : null,
      };
      const { error } = await supabase.from('geofences').insert(geofenceData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      toast({ title: 'Geofence criada com sucesso!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao criar geofence', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: GeofenceFormData }) => {
      const geofenceData = {
        ...data,
        geometry: data.type === 'polygon' && drawnPoints.length >= 3
          ? { type: 'polygon', coordinates: drawnPoints.map(p => [p.lng, p.lat]) }
          : null,
      };
      const { error } = await supabase.from('geofences').update(geofenceData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      toast({ title: 'Geofence atualizada!' });
      handleCloseDialog();
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('geofences').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geofences'] });
      toast({ title: 'Geofence excluída!' });
      setIsDeleteDialogOpen(false);
      setSelectedGeofence(null);
    },
    onError: (error: Error) => {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
    },
  });

  const stats = useMemo(() => ({
    total: geofences.length,
    active: geofences.filter(g => g.is_active).length,
    restricted: geofences.filter(g => g.restricted).length,
    required: geofences.filter(g => g.required).length,
  }), [geofences]);

  const handleOpenCreate = useCallback(() => {
    setEditingGeofence(null);
    setFormData(initialFormData);
    setDrawnPoints([]);
    setIsDialogOpen(true);
  }, []);

  const handleOpenEdit = useCallback((geofence: Geofence) => {
    setEditingGeofence(geofence);
    setFormData({
      name: geofence.name,
      description: geofence.description || '',
      type: geofence.type,
      center_lat: geofence.center_lat || -23.5505,
      center_lng: geofence.center_lng || -46.6333,
      radius: geofence.radius || 500,
      color: geofence.color,
      is_active: geofence.is_active,
      restricted: geofence.restricted,
      required: geofence.required,
    });
    if (geofence.geometry?.coordinates) {
      setDrawnPoints(geofence.geometry.coordinates.map(c => ({ lat: c[1], lng: c[0] })));
    }
    setIsDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsDialogOpen(false);
    setEditingGeofence(null);
    setFormData(initialFormData);
    setDrawnPoints([]);
    setIsDrawing(false);
  }, []);

  const handleSubmit = useCallback(() => {
    if (editingGeofence) {
      updateMutation.mutate({ id: editingGeofence.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  }, [editingGeofence, formData, createMutation, updateMutation]);

  const handleDelete = useCallback(() => {
    if (selectedGeofence) {
      deleteMutation.mutate(selectedGeofence.id);
    }
  }, [selectedGeofence, deleteMutation]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (isDrawing && formData.type === 'polygon') {
      setDrawnPoints(prev => [...prev, { lat, lng }]);
    } else if (formData.type === 'circle') {
      setFormData(prev => ({ ...prev, center_lat: lat, center_lng: lng }));
    }
  }, [isDrawing, formData.type]);

  return {
    selectedGeofence,
    setSelectedGeofence,
    isDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    editingGeofence,
    formData,
    setFormData,
    mapCenter,
    setMapCenter,
    mapZoom,
    setMapZoom,
    isDrawing,
    setIsDrawing,
    drawnPoints,
    setDrawnPoints,
    geofences,
    events,
    stats,
    isLoading,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseDialog,
    handleSubmit,
    handleDelete,
    handleMapClick,
    GEOFENCE_COLORS,
  };
}
