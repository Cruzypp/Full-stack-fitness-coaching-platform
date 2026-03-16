import { Stripe } from 'stripe';

// Initialize Stripe instance
//export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

// Stripe test instance
export const stripe = new Stripe(process.env.STRIPE_TEST_SECRET_KEY as string);

/**
 * Simplified Price type for frontend consumption
 */
export interface StripePrice {
  id: string;
  unit_amount: number | null;
  currency: string;
  product: string | Stripe.Product | Stripe.DeletedProduct;
}

/**
 * Fetches active prices from Stripe
 * Can be called from Server Components safely
 */
export async function getActivePrices(): Promise<StripePrice[]> {
  const prices = await stripe.prices.list({
    active: true,
    expand: ['data.product']
  });

  return prices.data.map(price => ({
    id: price.id,
    unit_amount: price.unit_amount,
    currency: price.currency,
    product: price.product,
  }));
}
