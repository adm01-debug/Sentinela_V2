import { supabase } from '@/integrations/supabase/client';
import type { Geofence, CreateGeofenceInput, UpdateGeofenceInput } from '@/hooks/useGeofences';

export const geofenceService = {
  async getGeofences() {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    return data as Geofence[];
  },

  async getActiveGeofences() {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('is_active', true);

    if (error) throw error;
    return data as Geofence[];
  },

  async getGeofenceById(id: string) {
    const { data, error } = await supabase
      .from('geofences')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Geofence;
  },

  async createGeofence(input: CreateGeofenceInput) {
    const { data, error } = await supabase
      .from('geofences')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data as Geofence;
  },

  async updateGeofence(id: string, input: Partial<UpdateGeofenceInput>) {
    const { data, error } = await supabase
      .from('geofences')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Geofence;
  },

  async deleteGeofence(id: string) {
    const { error } = await supabase
      .from('geofences')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  },

  async toggleGeofence(id: string, is_active: boolean) {
    const { data, error } = await supabase
      .from('geofences')
      .update({ is_active })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Geofence;
  }
};

export default geofenceService;
