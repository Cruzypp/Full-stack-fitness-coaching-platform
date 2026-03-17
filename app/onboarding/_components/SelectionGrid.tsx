"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface Props {
  options: readonly string[]
  selected: string[]
  onChange: (val: string[]) => void
  /** When this option is picked it clears all others (and vice-versa) */
  exclusive?: string
}

export function SelectionGrid({ options, selected, onChange, exclusive }: Props) {
  const toggle = (option: string) => {
    if (exclusive && option === exclusive) {
      onChange(selected.includes(option) ? [] : [exclusive])
      return
    }
    if (exclusive && selected.includes(exclusive)) {
      onChange([option])
      return
    }
    onChange(
      selected.includes(option)
        ? selected.filter((s) => s !== option)
        : [...selected, option]
    )
  }

  return (
    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-3">
      {options.map((option) => {
        const isChecked = selected.includes(option)
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
              onCheckedChange={() => toggle(option)}
              className="size-3.5 shrink-0"
            />
            <Label className="cursor-pointer text-xs font-normal leading-tight pointer-events-none">
              {option}
            </Label>
          </label>
        )
      })}
    </div>
  )
}
