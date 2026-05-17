import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Variables Supabase manquantes:', { supabaseUrl, supabaseAnonKey })
}

export const supabase = createClient(
  supabaseUrl || 'https://ymvlvkcrdcrsrzbvhcus.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdmx2a2NyZGNyc3J6YnZoY3VzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4ODIzNjMsImV4cCI6MjA5NDQ1ODM2M30.8Ua6tI3i_SDphSHRV_6Fblhwgx2s6Rze2NZA-3wFiHk'
)

export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inltdmx2a2NyZGNyc3J6YnZoY3VzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg4MjM2MywiZXhwIjoyMDk0NDU4MzYzfQ.k5BuojK2GXVr13AG41E44qWuqrph6dQ198fqfIFFvSk'
  
  return createClient(
    'https://ymvlvkcrdcrsrzbvhcus.supabase.co',
    serviceKey
  )
}
