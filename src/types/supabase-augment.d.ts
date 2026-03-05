// Type augmentation to allow supabase.from() with any table name
// This is needed because many hooks reference tables not yet in the auto-generated schema
import type { SupabaseClient } from '@supabase/supabase-js';

declare module '@supabase/supabase-js' {
  interface SupabaseClient<
    Database = any,
    SchemaName extends string & keyof Database = 'public' extends keyof Database
      ? 'public'
      : string & keyof Database,
    Schema extends Record<string, unknown> = Database[SchemaName] extends Record<string, unknown>
      ? Database[SchemaName]
      : any
  > {
    from(relation: string): any;
  }
}
