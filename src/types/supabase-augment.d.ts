// Type augmentation to allow supabase.from() with any table name
// This is needed because many hooks reference tables not yet in the auto-generated schema
import type { PostgrestFilterBuilder } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type PublicSchema = Database["public"];
type TableName = string & keyof PublicSchema["Tables"];

declare module "@supabase/supabase-js" {
  interface SupabaseClient {
    from(
      relation: TableName | string
    ): PostgrestFilterBuilder<PublicSchema, Record<string, unknown>, Record<string, unknown>[]>;
  }
}
