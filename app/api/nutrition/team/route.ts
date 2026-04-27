import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

// GET /api/nutrition/team — list nutritionists for the authenticated coach
export async function GET() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.user_metadata?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = getSupabaseAdmin()

  // Find all auth users with role=nutriologo and coach_id = this coach
  // Supabase Admin API lets us list users and filter by metadata
  const { data: { users }, error } = await admin.auth.admin.listUsers({ perPage: 1000 })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const nutriologos = (users ?? [])
    .filter(u =>
      u.user_metadata?.role?.toLowerCase() === "nutriologo" &&
      u.user_metadata?.coach_id === user.id
    )
    .map(u => ({
      id: u.id,
      first_name: u.user_metadata?.first_name ?? "",
      last_name: u.user_metadata?.last_name ?? "",
      email: u.email ?? "",
    }))

  return NextResponse.json(nutriologos)
}
