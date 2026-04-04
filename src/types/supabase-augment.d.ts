// Type augmentation to allow supabase.from() with any table name
// This is needed because many hooks reference tables not yet in the auto-generated schema
import type { SupabaseClient, PostgrestFilterBuilder } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type PublicSchema = Database['public'];
type TableName = string & keyof PublicSchema['Tables'];

declare module '@supabase/supabase-js' {
  interface SupabaseClient<
    DB = Database,
    SchemaName extends string & keyof DB = 'public' extends keyof DB
      ? 'public'
      : string & keyof DB,
    Schema extends Record<string, unknown> = DB[SchemaName] extends Record<string, unknown>
      ? DB[SchemaName]
      : unknown
  > {
    from(relation: string): PostgrestFilterBuilder<PublicSchema, Record<string, unknown>, Record<string, unknown>[]>;
  }
}
