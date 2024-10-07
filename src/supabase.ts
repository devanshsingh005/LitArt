import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseStorageUrl = 'https://lwjnpmbjiufmjzeqlcef.supabase.co/storage/v1/s3'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
  storage: {
    url: supabaseStorageUrl,
  },
})