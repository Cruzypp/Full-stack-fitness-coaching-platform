/**
 * Traducciones de claves internas al español para Google Sheets.
 *
 * Los valores del formulario usan claves en inglés para mantener independencia
 * entre la UI y el almacenamiento. La traducción ocurre en la capa de API
 * justo antes de escribir en el sheet.
 */

/** Mapa de claves de frecuencia y hábitos → español legible */
export const FREQ_ES: Record<string, string> = {
  "1-2_week":     "1-2 veces por semana",
  "3-4_week":     "3-4 veces por semana",
  "5-6_week":     "5-6 veces por semana",
  daily:          "Diariamente",
  every_meal:     "Cada comida",
  no:             "No",
  ocasionalmente: "Ocasionalmente",
  frecuentemente: "Frecuentemente",
}

/** Traduce una clave de frecuencia al español. Si no existe en el mapa, devuelve el valor original. */
export function tr(val: unknown): string {
  if (typeof val !== "string") return String(val ?? "")
  return FREQ_ES[val] ?? val
}

/**
 * Traduce la clave `frequency` dentro de cada elemento de un arreglo FrequencyItem.
 * Se usa antes de pasarlo a `fmt()` para que el texto en el sheet ya esté en español.
 */
export function trItems(val: unknown): unknown {
  if (!Array.isArray(val)) return val
  return (val as { name: string; frequency: string }[]).map((i) => ({
    ...i,
    frequency: FREQ_ES[i.frequency] ?? i.frequency,
  }))
}
