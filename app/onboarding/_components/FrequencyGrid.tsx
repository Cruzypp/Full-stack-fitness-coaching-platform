"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { FrequencyItem } from "@/app/types/onboarding"

const FREQ_LABELS: Record<string, string> = {
  "1-2_week": "1-2 veces",
  "3-4_week": "3-4 veces",
  "5-6_week": "5-6 veces",
  daily: "Diario",
  every_meal: "Cada comida",
}

interface Props {
  options: readonly string[]
  value: FrequencyItem[]
  onChange: (val: FrequencyItem[]) => void
}

export function FrequencyGrid({ options, value, onChange }: Props) {
  const selectedNames = value.map((v) => v.name)

  const toggleItem = (option: string) => {
    if (selectedNames.includes(option)) {
      onChange(value.filter((v) => v.name !== option))
    } else {
      onChange([...value, { name: option, frequency: "" }])
    }
  }

  const setFrequency = (name: string, frequency: string) => {
    onChange(value.map((v) => (v.name === name ? { ...v, frequency } : v)))
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {options.map((option) => {
          const isChecked = selectedNames.includes(option)
          return (
            <label
              key={option}
              className={cn(
                "flex items-center gap-2 px-2.5 py-2 rounded-lg border cursor-pointer transition-all duration-200 leading-tight",
                isChecked
                  ? "bg-primary/15 border-primary/40 text-primary"
                  : "bg-secondary/20 border-border/20 text-foreground/70 hover:border-border/40 hover:bg-secondary/30"
              )}
            >
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => toggleItem(option)}
                className="size-3.5 shrink-0"
              />
              <Label className="cursor-pointer text-xs font-normal leading-tight pointer-events-none">
                {option}
              </Label>
            </label>
          )
        })}
      </div>

      {value.length > 0 && (
        <div className="space-y-3 border-t border-border/20 pt-4">
          <Label className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-label block">
            Frecuencia por semana
          </Label>
          {value.map((item) => (
            <div key={item.name} className="space-y-1.5">
              <Label className="text-xs font-medium text-foreground/80">{item.name}</Label>
              <div className="flex gap-1.5 flex-wrap">
                {Object.entries(FREQ_LABELS).map(([key, label]) => (
                  <Button
                    key={key}
                    type="button"
                    size="xs"
                    variant={item.frequency === key ? "default" : "outline"}
                    onClick={() => setFrequency(item.name, key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
