declare module '@supabase/supabase-js' {
  export type SupabaseClient = {
    from: (table: string) => {
      insert: (payload: unknown) => Promise<{ error: { message: string } | null }>;
    };
  };

  export function createClient(url: string, key: string, options?: unknown): SupabaseClient;
}
