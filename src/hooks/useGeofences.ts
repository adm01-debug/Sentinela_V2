import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Geofence {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmployeeGeofence {
  id: string;
  employee_id: string;
  geofence_id: string;
  assigned_at: string;
  geofence?: Geofence;
}

export interface GeofenceViolation {
  id: string;
  employee_name: string;
  device: string | null;
  latitude: number;
  longitude: number;
  detected_address: string | null;
  nearest_geofence_id: string | null;
  distance_meters: number | null;
  action_taken: string;
  created_at: string;
}

export function useGeofences() {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchGeofences = async () => {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGeofences(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar geofences',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchViolations = async () => {
    try {
      const { data, error } = await supabase
        .from('geofence_violations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setViolations(data || []);
    } catch (error: any) {
      console.error('Error fetching violations:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGeofences(), fetchViolations()]);
      setLoading(false);
    };
    loadData();

    // Subscribe to realtime violations
    const channel = supabase
      .channel('geofence_violations_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'geofence_violations' },
        (payload) => {
          setViolations((prev) => [payload.new as GeofenceViolation, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const createGeofence = async (geofence: Omit<Geofence, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .insert(geofence)
        .select()
        .single();

      if (error) throw error;
      setGeofences((prev) => [data, ...prev]);
      toast({ title: 'Geofence criada com sucesso' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao criar geofence',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const updateGeofence = async (id: string, updates: Partial<Geofence>) => {
    try {
      const { data, error } = await supabase
        .from('geofences')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setGeofences((prev) => prev.map((g) => (g.id === id ? data : g)));
      toast({ title: 'Geofence atualizada com sucesso' });
      return data;
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar geofence',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const deleteGeofence = async (id: string) => {
    try {
      const { error } = await supabase.from('geofences').delete().eq('id', id);
      if (error) throw error;
      setGeofences((prev) => prev.filter((g) => g.id !== id));
      toast({ title: 'Geofence excluída com sucesso' });
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir geofence',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const assignToEmployee = async (employeeId: string, geofenceId: string) => {
    try {
      const { error } = await supabase
        .from('employee_geofences')
        .insert({ employee_id: employeeId, geofence_id: geofenceId });

      if (error) throw error;
      toast({ title: 'Geofence atribuída ao funcionário' });
    } catch (error: any) {
      toast({
        title: 'Erro ao atribuir geofence',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  const removeFromEmployee = async (employeeId: string, geofenceId: string) => {
    try {
      const { error } = await supabase
        .from('employee_geofences')
        .delete()
        .eq('employee_id', employeeId)
        .eq('geofence_id', geofenceId);

      if (error) throw error;
      toast({ title: 'Geofence removida do funcionário' });
    } catch (error: any) {
      toast({
        title: 'Erro ao remover geofence',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    geofences,
    violations,
    loading,
    createGeofence,
    updateGeofence,
    deleteGeofence,
    assignToEmployee,
    removeFromEmployee,
    refetch: fetchGeofences,
  };
}
