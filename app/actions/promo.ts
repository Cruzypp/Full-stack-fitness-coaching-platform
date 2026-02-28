'use server'

import { stripe } from '@/app/lib/stripe'

export type CreatePromoProps = {
  /**
   * El código alfanumérico que el usuario utilizará (Ej: VERANO20)
   * Este mismo código servirá como el ID del cupón en Stripe.
   */
  code: string;
  /**
   * El porcentaje de descuento (Ej: 20)
   */
  discountPercent: number;
  /**
   * El nombre interno del cupón (Opcional, Ej: 'Promoción de Verano')
   */
  name?: string;
  /**
   * Tiempo de duración del cupón:
   * 'forever' (para siempre), 'once' (un solo uso por suscripción), 'repeating' (múltiples meses)
   */
  duration?: 'forever' | 'once' | 'repeating';
  /**
   * Si duration es 'repeating', por cuántos meses aplica el descuento.
   */
  durationInMonths?: number;
}

/**
 * Crea un cupón dinámicamente en Stripe basado en la información de la BD.
 * Esta acción puede ser llamada desde el panel de administración
 * justo después de insertar el cupón en la base de datos (Supabase).
 */
export async function createStripeCoupon(params: CreatePromoProps) {
  try {
    const {
      code,
      discountPercent,
      name = `Promo: ${code}`,
      duration = 'once',
      durationInMonths
    } = params;

    // 1. Verificamos si el cupón ya existe para evitar errores de duplicidad
    try {
      const existingCoupon = await stripe.coupons.retrieve(code.toUpperCase());
      if (existingCoupon) {
        return {
          success: true,
          message: 'El cupón ya estaba registrado en Stripe',
          couponId: existingCoupon.id
        };
      }
    } catch (err: any) {
      // Si el error es 404, significa que no existe y podemos continuar creándolo.
      // Si es otro error, lo lanzamos.
      if (err.statusCode !== 404) {
        throw err;
      }
    }

    // 2. Creamos el cupón en Stripe
    const couponParams: any = {
      id: code.toUpperCase(), // Usamos el código promocional como el ID literal del cupón
      name: name,
      percent_off: discountPercent,
      duration: duration,
    };

    if (duration === 'repeating' && durationInMonths) {
      couponParams.duration_in_months = durationInMonths;
    }

    const newCoupon = await stripe.coupons.create(couponParams);

    return {
      success: true,
      message: 'Cupón creado exitosamente en Stripe',
      couponId: newCoupon.id
    };

  } catch (error: any) {
    console.error('Error al crear el cupón en Stripe:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido creando el cupón'
    };
  }
}
