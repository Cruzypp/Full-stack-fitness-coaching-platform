import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PATCH(req: NextRequest) {
  const { userId, enabled } = await req.json()
  if (!userId || typeof enabled !== 'boolean') {
    return NextResponse.json({ error: 'userId and enabled required' }, { status: 400 })
  }

  const { error } = await admin
    .from('profiles')
    .update({ nutrition_reminders_enabled: enabled })
    .eq('id', userId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
