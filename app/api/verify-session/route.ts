import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS and update user profiles server-side
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
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

    // Update the user's payment_date in Supabase and retrieve their first name
    const { data: profileData, error } = await supabaseAdmin
      .from("profiles")
      .update({ payment_date: new Date().toISOString() })
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
