import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId')
  const yearMonth = req.nextUrl.searchParams.get('yearMonth')

  let query = admin.from('meal_plans').select('*')
  if (userId) query = query.eq('user_id', userId)
  if (yearMonth) query = query.eq('year_month', yearMonth)

  const { data, error } = await query.order('year_month', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { data, error } = await admin
    .from('meal_plans')
    .upsert(body, { onConflict: 'user_id,year_month' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
