import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv, isSupabaseConfigured } from "./client";

export async function createServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient(
    url!,
    key!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options?: Record<string, unknown>;
          }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Safe to ignore when called inside a Server Component
          }
        },
      },
    }
  );
}
