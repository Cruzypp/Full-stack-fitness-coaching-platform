"use client"

import { useState } from "react"
import { Controller } from "react-hook-form"
import type { Control, UseFormWatch, UseFormSetValue, FieldErrors } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Upload, AlertCircle, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import type { OnboardingFormData } from "@/app/types/onboarding"
import { NumericField } from "../_components/NumericField"
import { ErrorMsg } from "../_components/ErrorMsg"

interface Props {
  control: Control<OnboardingFormData>
  watch: UseFormWatch<OnboardingFormData>
  setValue: UseFormSetValue<OnboardingFormData>
  errors: FieldErrors<OnboardingFormData>
}

// Fields the InBody parser fills in (mapped by API route)
const INBODY_FIELDS: (keyof OnboardingFormData)[] = [
  "height", "weight", "imc",
  "fatPercentage", "musclePercentage", "viceralFatPercentage",
  "bodyWaterPercentage", "boneMass",
]

export function StepMetrics({ control, watch, setValue, errors }: Props) {
  const manualMetrics = watch("manualMetrics")

  const [file, setFile] = useState<File | null>(null)
  const [processing, setProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [parseError, setParseError] = useState<string | null>(null)

  const handleFileSelect = async (selected: File) => {
    setFile(selected)
    setProcessing(true)
    setParseError(null)
    setProcessed(false)

    try {
      const fd = new FormData()
      fd.append("file", selected)
      const res = await fetch("/api/inbody", { method: "POST", body: fd })
      if (!res.ok) throw new Error(`Error ${res.status}`)

      const parsed = await res.json()
      INBODY_FIELDS.forEach((field) => {
        if (parsed[field] !== undefined && parsed[field] !== null) {
          setValue(field, parsed[field], { shouldValidate: false })
        }
      })
      setProcessed(true)
      toast.success("Datos extraídos correctamente", {
        description: "Revisa los campos y corrígelos si es necesario.",
      })
    } catch {
      setParseError(
        "No se pudo procesar el archivo. Puedes ingresar los datos manualmente a continuación."
      )
      setProcessed(true)
    } finally {
      setProcessing(false)
    }
  }

  const resetInBody = () => {
    setFile(null)
    setProcessed(false)
    setParseError(null)
    INBODY_FIELDS.forEach((field) => setValue(field, "" as any, { shouldValidate: false }))
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bebas text-2xl tracking-tight mb-1">Medidas Físicas</h2>
        <p className="text-sm text-foreground/50">¿Cómo registrarás tus medidas?</p>
      </div>

      {/* ── Mode selector ─────────────────────────────── */}
      <Controller
        name="manualMetrics"
        control={control}
        rules={{ validate: (v) => v !== null || "Selecciona una opción" }}
        render={({ field }) => (
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { field.onChange(true); resetInBody() }}
              className={cn(
                "h-auto px-4 py-3 flex flex-col items-start text-left gap-0.5 w-full whitespace-normal",
                field.value === true && "bg-primary/15 border-primary/40 text-primary"
              )}
            >
              <span className="font-medium text-sm">Ingreso manual</span>
              <span className="text-xs text-foreground/50 font-normal leading-snug">
                Altura, peso y medidas corporales
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { field.onChange(false); resetInBody() }}
              className={cn(
                "h-auto px-4 py-3 flex flex-col items-start text-left gap-0.5 w-full whitespace-normal",
                field.value === false && "bg-primary/15 border-primary/40 text-primary"
              )}
            >
              <span className="font-medium text-sm">Estudio InBody</span>
              <span className="text-xs text-foreground/50 font-normal leading-snug">
                Sube tu resultado para auto-completar los campos
              </span>
            </Button>
          </div>
        )}
      />
      <ErrorMsg msg={errors.manualMetrics?.message} />

      {/* ══ MANUAL MODE ════════════════════════════════ */}
      {manualMetrics === true && (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
              Medidas generales
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Controller
                name="height"
                control={control}
                rules={{ validate: (v) => (v !== "" && Number(v) >= 80) || "Mín. 80cm" }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <NumericField label="Estatura" unit="cm" min={80} max={250} placeholder="170" value={value} onChange={onChange} onBlur={onBlur} />
                )}
              />
              <Controller
                name="weight"
                control={control}
                rules={{ validate: (v) => (v !== "" && Number(v) >= 30) || "Mín. 30kg" }}
                render={({ field: { value, onChange, onBlur } }) => (
                  <NumericField label="Peso" unit="kg" min={30} max={300} placeholder="70" value={value} onChange={onChange} onBlur={onBlur} />
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
              Circunferencias
            </Label>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Controller name="waist" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 30) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Cintura" unit="cm" min={30} max={250} placeholder="80" value={value} onChange={onChange} onBlur={onBlur} />} />
              <Controller name="hip" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 30) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Cadera" unit="cm" min={30} max={250} placeholder="95" value={value} onChange={onChange} onBlur={onBlur} />} />
              <Controller name="arm" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 10) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Brazo" unit="cm" min={10} max={100} placeholder="32" value={value} onChange={onChange} onBlur={onBlur} />} />
              <Controller name="wrist" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 5) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Muñeca" unit="cm" min={5} max={50} placeholder="17" value={value} onChange={onChange} onBlur={onBlur} />} />
              <Controller name="kneeHeight" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 20) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Altura rodilla" unit="cm" min={20} max={120} placeholder="50" value={value} onChange={onChange} onBlur={onBlur} />} />
              <Controller name="calf" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 10) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Pantorrilla" unit="cm" min={10} max={100} placeholder="36" value={value} onChange={onChange} onBlur={onBlur} />} />
            </div>
          </div>
        </div>
      )}

      {/* ══ INBODY MODE ════════════════════════════════ */}
      {manualMetrics === false && (
        <div className="space-y-6">

          {/* Upload area */}
          {!processing && !processed && (
            <div className="space-y-3">
              <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
                Sube tu estudio InBody
              </Label>
              <p className="text-sm text-foreground/60">
                El sistema procesará el archivo y completará todos los campos automáticamente.
                Podrás revisarlos y corregirlos antes de continuar.
              </p>
              <label className="flex flex-col items-center justify-center gap-3 w-full h-36 rounded-xl border-2 border-dashed border-border/30 bg-secondary/10 hover:border-primary/30 hover:bg-secondary/20 cursor-pointer transition-all duration-200">
                <input
                  type="file"
                  className="sr-only"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFileSelect(f)
                  }}
                />
                <div className="w-10 h-10 rounded-full bg-secondary/30 flex items-center justify-center">
                  <Upload size={20} className="text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-foreground/60">Arrastra o haz click para seleccionar</p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">PDF, JPG o PNG</p>
                </div>
              </label>
            </div>
          )}

          {/* Processing spinner */}
          {processing && (
            <div className="flex flex-col items-center justify-center gap-3 py-12">
              <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-foreground/60">Procesando tu InBody...</p>
              {file && <p className="text-xs text-muted-foreground/50">{file.name}</p>}
            </div>
          )}

          {/* Results after processing */}
          {processed && (
            <div className="space-y-6">
              {/* Error banner (success is shown via sonner) */}
              {parseError && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20">
                  <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
                  <p className="text-sm text-destructive">{parseError}</p>
                </div>
              )}

              {/* General measurements */}
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
                  Medidas generales
                </Label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Controller name="height" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 80) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Estatura" unit="cm" min={80} max={250} placeholder="170" value={value} onChange={onChange} onBlur={onBlur} />} />
                  <Controller name="weight" control={control} rules={{ validate: (v) => (v !== "" && Number(v) >= 30) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Peso" unit="kg" min={30} max={300} placeholder="70" value={value} onChange={onChange} onBlur={onBlur} />} />
                  <Controller name="imc" control={control} rules={{ validate: (v) => (v !== "" && Number(v) > 0) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="IMC" unit="kg/m²" placeholder="22.5" value={value} onChange={onChange} onBlur={onBlur} />} />
                </div>
              </div>

              {/* Body composition */}
              <div className="space-y-4">
                <Label className="text-[10px] uppercase tracking-[0.15em] text-primary font-label block">
                  Composición corporal
                </Label>
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <Controller name="fatPercentage" control={control} rules={{ validate: (v) => (v !== "" && Number(v) > 0) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="% Grasa corporal" unit="%" min={1} max={70} placeholder="20" value={value} onChange={onChange} onBlur={onBlur} />} />
                  <Controller name="musclePercentage" control={control} rules={{ validate: (v) => (v !== "" && Number(v) > 0) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Masa muscular" unit="kg" min={1} max={80} placeholder="25" value={value} onChange={onChange} onBlur={onBlur} />} />
                  <Controller name="viceralFatPercentage" control={control} rules={{ validate: (v) => (v !== "" && Number(v) > 0) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Nivel grasa visceral" min={1} max={20} placeholder="5" value={value} onChange={onChange} onBlur={onBlur} />} />
                  <Controller name="bodyWaterPercentage" control={control} rules={{ validate: (v) => (v !== "" && Number(v) > 0) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Agua corporal" unit="L" min={1} max={80} placeholder="30" value={value} onChange={onChange} onBlur={onBlur} />} />
                  <Controller name="boneMass" control={control} rules={{ validate: (v) => (v !== "" && Number(v) > 0) || "Requerido" }} render={({ field: { value, onChange, onBlur } }) => <NumericField label="Minerales óseos" unit="kg" min={0.5} max={10} placeholder="2.5" value={value} onChange={onChange} onBlur={onBlur} />} />
                </div>
              </div>

              {/* Re-upload option */}
              <button
                type="button"
                onClick={resetInBody}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw size={12} />
                Subir otro archivo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
