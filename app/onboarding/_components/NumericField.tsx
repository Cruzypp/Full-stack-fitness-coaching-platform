"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"

interface Props {
  label: string
  unit?: string
  value: number | ""
  onChange: (val: number | "") => void
  onBlur?: () => void
  min?: number
  max?: number
  placeholder?: string
  disabled?: boolean
}

export function NumericField({ label, unit, value, onChange, onBlur, min, max, placeholder, disabled }: Props) {
  const handleChange = (raw: string) =>
    onChange(raw === "" ? "" : Number(raw))

  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label">
        {label}
      </Label>
      {unit ? (
        <InputGroup className="bg-secondary/20 border-border/30 focus-within:border-primary/40">
          <InputGroupInput
            type="number"
            step="any"
            min={min}
            max={max}
            placeholder={placeholder}
            value={value}
            disabled={disabled}
            onBlur={onBlur}
            onChange={(e) => handleChange(e.target.value)}
            className="text-foreground"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupText>{unit}</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
      ) : (
        <Input
          type="number"
          step="any"
          min={min}
          max={max}
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onBlur={onBlur}
          onChange={(e) => handleChange(e.target.value)}
          className="bg-secondary/20 border-border/30 focus:border-primary/40 text-foreground"
        />
      )}
    </div>
  )
}
