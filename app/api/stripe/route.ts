import { NextRequest, NextResponse } from "next/server";
import { getActivePrices } from '../../lib/stripe';

export async function GET() {
  try {
    const prices = await getActivePrices();
    return NextResponse.json({ prices });
  } catch (error) {
    console.error("Error fetching Stripe prices:", error);
    return NextResponse.json({ error: "Failed to fetch prices" }, { status: 500 });
  }
}