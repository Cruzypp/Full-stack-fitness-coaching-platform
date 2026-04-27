import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

  const { data, error } = await admin
    .from('body_measurements')
    .select('*')
    .eq('user_id', userId)
    .order('measured_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { user_id, ...fields } = body

  if (!user_id) return NextResponse.json({ error: 'user_id required' }, { status: 400 })

  const { data, error } = await admin
    .from('body_measurements')
    .insert({ user_id, ...fields })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Also send to Google Sheets (non-blocking)
  sendToSheets(data).catch(() => {})

  return NextResponse.json(data, { status: 201 })
}

async function sendToSheets(measurement: Record<string, unknown>) {
  await fetch(`${process.env.PYTHON_API_BASE_URL}/body_measurements`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(measurement),
  })
}
