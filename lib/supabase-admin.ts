import { createClient } from "@supabase/supabase-js"

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  if (!url) {
    console.error("DEBUG: NEXT_PUBLIC_SUPABASE_URL is missing")
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment variables")
  }
  if (!key) {
    console.error("DEBUG: SUPABASE_SERVICE_ROLE_KEY is missing")
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment variables")
  }

  return createClient(url, key)
}
