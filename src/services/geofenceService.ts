import { supabase } from "@/integrations/supabase/client";
import { handleApiError } from "@/utils/api-errors";

export interface Geofence {
  id: string;
  name: string;
  description?: string | null;
  address?: string | null;
  color?: string | null;
  type?: "circle" | "polygon" | null;
  geometry?: unknown;
  latitude: number;
  longitude: number;
  radius_meters: number;
  is_active: boolean;
  restricted: boolean;
  required: boolean;
  company_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateGeofenceInput {
  name: string;
  description?: string | null;
  address?: string | null;
  color?: string | null;
  type?: "circle" | "polygon" | null;
  geometry?: unknown;
  latitude: number;
  longitude: number;
  radius_meters?: number;
  is_active?: boolean;
  restricted?: boolean;
  required?: boolean;
  company_id?: string | null;
}

export interface UpdateGeofenceInput
  extends Partial<Omit<CreateGeofenceInput, "name">> {
  id: string;
  name?: string;
}

const GEOFENCE_COLUMNS =
  "id, name, description, address, color, type, geometry, latitude, longitude, radius_meters, is_active, restricted, required, company_id, created_at, updated_at";

export interface GeofenceCheckRow {
  geofence_id: string;
  geofence_name: string;
  is_inside: boolean;
  event_type?: "enter" | "exit" | "stay";
}

export interface GeofenceCheckResponse {
  success: boolean;
  results: GeofenceCheckRow[];
  violations_count: number;
  timestamp: string;
}

export const geofenceService = {
  async getGeofences() {
    const { data, error } = await supabase
      .from("geofences")
      .select(GEOFENCE_COLUMNS)
      .order("name", { ascending: true });

    if (error) throw error;
    return (data ?? []) as unknown as Geofence[];
  },

  async getActiveGeofences() {
    const { data, error } = await supabase
      .from("geofences")
      .select(GEOFENCE_COLUMNS)
      .eq("is_active", true);

    if (error) throw error;
    return (data ?? []) as unknown as Geofence[];
  },

  async getGeofenceById(id: string) {
    const { data, error } = await supabase
      .from("geofences")
      .select(GEOFENCE_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Geofence;
  },

  async createGeofence(input: CreateGeofenceInput) {
    const { data, error } = await supabase
      .from("geofences")
      .insert({
        ...input,
        radius_meters: input.radius_meters ?? 100,
        updated_at: new Date().toISOString(),
      })
      .select(GEOFENCE_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Geofence;
  },

  async updateGeofence(id: string, input: Partial<UpdateGeofenceInput>) {
    const { data, error } = await supabase
      .from("geofences")
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(GEOFENCE_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Geofence;
  },

  async deleteGeofence(id: string) {
    const { error } = await supabase.from("geofences").delete().eq("id", id);

    if (error) throw error;
    return id;
  },

  async toggleGeofence(id: string, is_active: boolean) {
    const { data, error } = await supabase
      .from("geofences")
      .update({ is_active, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(GEOFENCE_COLUMNS)
      .maybeSingle();

    if (error) throw error;
    return data as unknown as Geofence;
  },

  async checkGeofence(
    input: {
      employee_id: string;
      device_id?: string;
      latitude?: number;
      longitude?: number;
      location?: { latitude: number; longitude: number; accuracy?: number };
      accuracy?: number;
      timestamp?: string;
    },
    version: "v1" | "v2" = "v2"
  ): Promise<GeofenceCheckResponse> {
    const { data, error } = await supabase.functions.invoke("check-geofence", {
      body: input,
      headers: { "x-api-version": version },
    });

    if (error) {
      handleApiError(error, "checkGeofence");
      throw error;
    }
    return data as GeofenceCheckResponse;
  },
};

export default geofenceService;
