const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test_checkout() {
  try {
    const prices = await stripe.prices.list({ active: true, limit: 1 });
    if (prices.data.length === 0) {
      console.log("No active prices found, cannot test checkout. Searching for all prices...");
      const all = await stripe.prices.list({ limit: 1 });
      if (all.data.length === 0) {
        console.log("Still no prices found.");
        return;
      }
      prices.data = all.data;
    }
    const priceId = prices.data[0].id;

    console.log("Testing checkout with price:", priceId);

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: "http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "http://localhost:3000/pricing",
    });

    console.log("Session URL:", session.url);

  } catch (e) {
    console.error("Stripe Checkout Error:", e.message);
  }
}

test_checkout();
