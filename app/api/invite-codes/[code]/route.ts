import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

// GET /api/invite-codes/[code] — validate code (public, no auth required)
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  const admin = getSupabaseAdmin()

  const { data, error } = await admin
    .from("invite_codes")
    .select("id, code, coach_id, role, is_used, expires_at")
    .eq("code", code.toUpperCase())
    .single()

  if (error || !data) {
    return NextResponse.json({ error: "Código inválido" }, { status: 404 })
  }
  if (data.is_used) {
    return NextResponse.json({ error: "Este código ya fue utilizado" }, { status: 410 })
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: "Este código ha expirado" }, { status: 410 })
  }

  return NextResponse.json({
    valid: true,
    coach_id: data.coach_id,
    role: data.role,
  })
}
