import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export async function fetchPromo(code: string) {
  const { data, error } = await supabase
    .rpc('get_active_promotion', { promo_code: code });
  if (error) {
    console.log("Hubo un error: ", error);
  }

  if (!data || data.length === 0) return 0;
  return data[0];
}

// Admin create a promotion
interface PromotionProps {
  code: string;
  title: string;
  originalPrice: number;
  discountPercent: number;
  durationHours: number;
  startsAt: Date;
  maxRedemptions?: number;
}
export async function createPromotion(props: PromotionProps) {
  const promoPrice = +(props.originalPrice * (1 - props.discountPercent / 100)).toFixed(2);
  const insertData: Record<string, any> = {
    code: props.code.toLowerCase(),
    title: props.title,
    original_price: props.originalPrice,
    promo_price: promoPrice,
    duration_hours: props.durationHours,
    starts_at: props.startsAt.toISOString(),
  };
  if (props.maxRedemptions != null) {
    insertData.max_redemptions = props.maxRedemptions;
  }
  const { data, error } = await supabase
    .from('promotions')
    .insert(insertData)
    .select()
    .single()

  if (error) throw error;
  return data;
}

// Configuración de la tienda
export async function getActiveStripePriceId() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('active_stripe_price_id')
    .eq('id', 1)
    .single();

  if (error || !data) return null;
  return data.active_stripe_price_id;
}

export async function updateActiveStripePriceId(priceId: string) {
  const { data, error } = await supabase
    .from('store_settings')
    .update({ active_stripe_price_id: priceId })
    .eq('id', 1)
    .select();

  if (error) throw error;
  return true;
}