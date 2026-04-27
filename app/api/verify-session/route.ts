import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

// Use service role key to bypass RLS and update user profiles server-side
export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin();

  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id is required" },
        { status: 400 }
      );
    }

    // Retrieve the Stripe Checkout Session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Verify the payment status
    const isPaid =
      session.payment_status === "paid" ||
      session.status === "complete";

    if (!isPaid) {
      return NextResponse.json(
        { error: "Payment not completed", payment_status: session.payment_status },
        { status: 402 }
      );
    }

    // The userId was attached as client_reference_id during checkout creation
    const userId = session.client_reference_id;

    if (!userId) {
      // Payment was confirmed but no user reference — return success without DB update
      return NextResponse.json({ success: true, first_name: null });
    }

    // Read coach_id from session metadata if present
    const coachId = session.metadata?.coach_id ?? null

    // Update payment_date and coach_id in one shot
    const updatePayload: Record<string, unknown> = { payment_date: new Date().toISOString() }
    if (coachId) updatePayload.coach_id = coachId

    const { data: profileData, error } = await supabaseAdmin
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId)
      .select("first_name")
      .single();

    if (error) {
      console.error("Error updating payment_date in Supabase:", error);
      // Still return success since Stripe confirmed the payment
      return NextResponse.json({ success: true, first_name: null });
    }

    return NextResponse.json({
      success: true,
      first_name: profileData?.first_name ?? null,
    });
  } catch (err: any) {
    console.error("Error verifying Stripe session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to verify session" },
      { status: 500 }
    );
  }
}
