import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

type CallerInfo = { role: "admin"; coachId: string } | { role: "nutriologo"; coachId: string; nutriologoId: string } | null

async function getCallerInfo(): Promise<CallerInfo> {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: () => {} } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const role = user.user_metadata?.role?.toLowerCase()
  if (role === 'admin') return { role: 'admin', coachId: user.id }
  if (role === 'nutriologo') {
    const coachId = user.user_metadata?.coach_id
    if (!coachId) return null
    return { role: 'nutriologo', coachId, nutriologoId: user.id }
  }
  return null
}

export async function GET() {
  const caller = await getCallerInfo()
  if (!caller) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()

  let query = admin
    .from('profiles')
    .select('id, first_name, last_name, email, phone, payment_date, wants_nutrition, nutrition_reminders_enabled, lives_lost, coach_id, nutriologo_id')
    .eq('wants_nutrition', true)
    .order('first_name')

  if (caller.role === 'admin') {
    // Coach sees all their clients
    query = query.eq('coach_id', caller.coachId)
  } else {
    // Nutriólogo sees only their assigned clients
    query = query.eq('nutriologo_id', caller.nutriologoId)
  }

  const { data: profiles, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const ids = (profiles ?? []).map((p) => p.id)

  let measurements: any[] = []
  if (ids.length > 0) {
    const { data } = await admin
      .from('body_measurements')
      .select('*')
      .in('user_id', ids)
      .order('measured_at', { ascending: false })
    measurements = data ?? []
  }

  const latestByUser: Record<string, unknown> = {}
  for (const m of measurements) {
    if (!latestByUser[m.user_id]) latestByUser[m.user_id] = m
  }

  const clients = (profiles ?? []).map((p) => ({
    ...p,
    latest_measurement: latestByUser[p.id] ?? null,
  }))

  return NextResponse.json(clients)
}
