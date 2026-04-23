import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  const { data: profiles, error } = await admin
    .from('profiles')
    .select('id, first_name, last_name, email, phone, payment_date')
    .order('first_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch latest measurement per client
  const ids = profiles.map((p) => p.id)
  const { data: measurements } = await admin
    .from('body_measurements')
    .select('*')
    .in('user_id', ids)
    .order('measured_at', { ascending: false })

  const latestByUser: Record<string, unknown> = {}
  for (const m of measurements ?? []) {
    if (!latestByUser[(m as { user_id: string }).user_id]) {
      latestByUser[(m as { user_id: string }).user_id] = m
    }
  }

  const clients = profiles.map((p) => ({
    ...p,
    latest_measurement: latestByUser[p.id] ?? null,
  }))

  return NextResponse.json(clients)
}
