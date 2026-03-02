import { NextRequest, NextResponse } from "next/server";
import { stripe } from "../../lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, couponId, userId } = body;

    if (!priceId) {
      return NextResponse.json(
        { error: "Price ID is required" },
        { status: 400 }
      );
    }

    // Prepare line items
    const lineItems = [
      {
        price: priceId,
        quantity: 1,
      },
    ];

    // Prepare discounts array if coupon is provided
    // Stripe coupon IDs are case-sensitive, and we create them in uppercase.
    const discounts = couponId ? [{ coupon: couponId.toUpperCase() }] : undefined;

    // Dynamically retrieve the base URL from the request headers to support ngrok/Vercel seamlessly
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const host = req.headers.get("host");
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (host ? `${protocol}://${host}` : 'http://localhost:3000');

    // Retrieve the price from Stripe to check if it's recurring or one-time
    const price = await stripe.prices.retrieve(priceId);
    const mode = price.type === 'recurring' ? 'subscription' : 'payment';

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode: mode,
      discounts: discounts,
      client_reference_id: userId, // Attach user ID here
      // URL to redirect on success
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      // URL to redirect on cancel
      cancel_url: `${baseUrl}/pricing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Error creating checkout session:", err);
    return NextResponse.json(
      { error: err.message || "Failed to create checkout session", details: err },
      { status: 500 }
    );
  }
}
