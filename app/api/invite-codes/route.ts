import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

async function getAuthedUser() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {},
      },
    }
  )
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// GET /api/invite-codes — list codes for authenticated coach
export async function GET() {
  const user = await getAuthedUser()
  if (!user || user.user_metadata?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("invite_codes")
    .select("id, code, role, is_used, used_by, created_at, expires_at")
    .eq("coach_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data ?? [])
}

// POST /api/invite-codes — generate a new invite code
export async function POST(req: NextRequest) {
  const user = await getAuthedUser()
  if (!user || user.user_metadata?.role?.toLowerCase() !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const role = body.role ?? "nutriologo"

  // Generate 8-char alphanumeric code
  const code = Array.from(crypto.getRandomValues(new Uint8Array(6)))
    .map(b => b.toString(36).toUpperCase())
    .join("")
    .slice(0, 8)
    .padEnd(8, "X")

  const admin = getSupabaseAdmin()
  const { data, error } = await admin
    .from("invite_codes")
    .insert({ code, coach_id: user.id, role })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
