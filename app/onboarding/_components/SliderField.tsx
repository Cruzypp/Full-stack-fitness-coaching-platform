"use client"

import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"

interface Props {
  label: string
  value: number
  onChange: (val: number) => void
  min: number
  max: number
  step?: number
  formatValue: (v: number) => string
}

export function SliderField({ label, value, onChange, min, max, step = 1, formatValue }: Props) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <Label className="font-body text-sm font-normal text-foreground/80 leading-snug">{label}</Label>
        <span className="shrink-0 text-sm font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full whitespace-nowrap">
          {formatValue(value)}
        </span>
      </div>
      <Slider
        min={min}
        max={max}
        step={step}
        value={[value]}
        onValueChange={([v]) => onChange(v)}
      />
      <div className="flex justify-between text-xs text-muted-foreground/50">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>
    </div>
  )
}
