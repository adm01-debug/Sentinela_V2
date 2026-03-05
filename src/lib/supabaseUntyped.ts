// Untyped supabase client for tables not yet in the schema
// Use this when referencing tables that don't exist in the auto-generated types
import { supabase } from '@/integrations/supabase/client';

/**
 * Returns the supabase client without strict table type checking.
 * Use for tables not yet in the auto-generated schema types.
 */
export const supabaseUntyped = supabase as any;

export default supabaseUntyped;
