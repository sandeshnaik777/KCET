import { createClient } from '@supabase/supabase-js'

const supabaseUrl    = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * PRIMARY client — used for auth operations (signIn, signUp, signOut, profile).
 * This client carries the JWT session, so it uses the authenticated role in Supabase.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * DATA client — used exclusively for KCET table queries (kcet2021–2024).
 * persistSession: false  → never reads/writes JWT from localStorage
 * autoRefreshToken: false → no background token refresh
 * This means it ALWAYS uses the anon role, regardless of login state.
 * This ensures KCET data is always readable (anon RLS policies apply).
 */
export const supabaseData = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession:      false,
    autoRefreshToken:    false,
    detectSessionInUrl:  false,
    storageKey:          'kcet_data_client',  // isolated storage key
  },
})

export const TABLES = {
  2021: 'kcet2021',
  2022: 'kcet2022',
  2023: 'kcet2023',
  2024: 'kcet2024',
}

export const YEARS = [2024, 2023, 2022, 2021]
