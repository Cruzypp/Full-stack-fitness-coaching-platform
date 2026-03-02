const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function test() {
  try {
    const products = await stripe.products.list({ active: true, expand: ['data.default_price'] });
    console.log("Active Products count:", products.data.length);
    products.data.forEach(p => {
      console.log(`Product: ${p.name}, default_price:`, p.default_price);
    });
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
