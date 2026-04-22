import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  const body = await req.json()
  const { data, error } = await admin
    .from('meal_plan_entries')
    .update(body)
    .eq('id', params.entryId)
    .eq('meal_plan_id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  const { error } = await admin
    .from('meal_plan_entries')
    .delete()
    .eq('id', params.entryId)
    .eq('meal_plan_id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
