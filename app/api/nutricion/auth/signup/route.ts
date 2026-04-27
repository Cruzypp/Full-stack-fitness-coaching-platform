import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase-admin"

// POST /api/nutricion/auth/signup
// Validates invite code, creates nutriologo user, marks code as used — all atomic.
export async function POST(req: NextRequest) {
  const { code, email, password, name } = await req.json()

  if (!code || !email || !password || !name) {
    return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  // 1. Validate code
  const { data: inviteCode, error: codeError } = await admin
    .from("invite_codes")
    .select("id, coach_id, role, is_used, expires_at")
    .eq("code", code.toUpperCase())
    .single()

  if (codeError || !inviteCode) {
    // Surface the real DB error in logs to help debug (e.g. table doesn't exist yet)
    console.error("[nutricion/signup] invite_codes lookup failed:", JSON.stringify(codeError))
    const msg = codeError?.code === "42P01"
      ? "La tabla invite_codes no existe. Ejecuta la migración SQL en Supabase."
      : "Código de invitación inválido"
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  if (inviteCode.is_used) {
    return NextResponse.json({ error: "Este código ya fue utilizado" }, { status: 409 })
  }
  if (inviteCode.expires_at && new Date(inviteCode.expires_at) < new Date()) {
    return NextResponse.json({ error: "Este código ha expirado" }, { status: 410 })
  }

  // Split "Nombre Apellido" → first_name + last_name (triggers de Supabase los esperan separados)
  const parts = name.trim().split(/\s+/)
  const first_name = parts[0] ?? name
  const last_name = parts.slice(1).join(" ") || "-"

  // 2. Create user via Admin API (skips email confirmation for staff accounts)
  const { data: authData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name,
      last_name,
      role: inviteCode.role,
      coach_id: inviteCode.coach_id,
    },
  })

  if (createError) {
    console.error("[nutricion/signup] createUser failed:", JSON.stringify(createError))
    return NextResponse.json({ error: createError.message }, { status: 400 })
  }

  // 3. Mark code as used
  await admin
    .from("invite_codes")
    .update({ is_used: true, used_by: authData.user.id })
    .eq("id", inviteCode.id)

  return NextResponse.json({ success: true })
}
