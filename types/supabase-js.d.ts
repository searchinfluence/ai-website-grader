declare module '@supabase/supabase-js' {
  export type SupabaseError = {
    message: string;
  };

  export type SupabaseQueryBuilder<T = unknown> = {
    insert: (payload: unknown) => Promise<{ data?: T | null; error: SupabaseError | null }>;
    select: (columns?: string) => SupabaseQueryBuilder<T>;
    eq: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
    gt: (column: string, value: unknown) => SupabaseQueryBuilder<T>;
    maybeSingle: <R = T>() => Promise<{ data: R | null; error: SupabaseError | null }>;
    single: <R = T>() => Promise<{ data: R | null; error: SupabaseError | null }>;
  };

  export type SupabaseClient = {
    from: <T = unknown>(table: string) => SupabaseQueryBuilder<T>;
  };

  export function createClient(url: string, key: string, options?: unknown): SupabaseClient;
}
