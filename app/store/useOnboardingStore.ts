import { create } from "zustand"
import {
  type FrequencyItem,
  type HabitFrequency,
  type OnboardingFormData,
  DEFAULT_FORM_DATA,
} from "@/app/types/onboarding"

// Re-exporta los tipos para que los consumidores existentes no necesiten
// cambiar su ruta de importación si todavía los traen desde aquí.
export type { FrequencyItem, HabitFrequency, OnboardingFormData }
export { DEFAULT_FORM_DATA }

// ─── Store ────────────────────────────────────────────────

interface OnboardingStore {
  /** Datos acumulados del formulario, sincronizados en cada cambio desde react-hook-form */
  formData: OnboardingFormData
  /** Índice del paso actual (0-based) */
  currentStep: number
  /** Fusiona datos parciales al estado actual (usado en el useEffect de watch en page.tsx) */
  setFormData: (data: Partial<OnboardingFormData>) => void
  setCurrentStep: (step: number) => void
  /** Reinicia el store a su estado inicial (se llama tras un envío exitoso) */
  reset: () => void
}

/**
 * Store global del onboarding construido con Zustand.
 *
 * Flujo de sincronización:
 * page.tsx → watch() de RHF → setFormData() → este store
 *
 * El store guarda el estado entre renders y sirve como respaldo
 * en caso de que el usuario navegue fuera del formulario y regrese.
 */
export const useOnboardingStore = create<OnboardingStore>()((set) => ({
  formData: DEFAULT_FORM_DATA,
  currentStep: 0,

  setFormData: (data) =>
    set((state) => ({ formData: { ...state.formData, ...data } })),

  setCurrentStep: (step) => set({ currentStep: step }),

  reset: () =>
    set({ formData: DEFAULT_FORM_DATA, currentStep: 0 }),
}))
