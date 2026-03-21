'use client';

import { UseFormRegister, UseFormWatch, UseFormSetValue, FieldErrors } from 'react-hook-form';
import type { PRFormData } from '../page';

interface Props {
  register: UseFormRegister<PRFormData>;
  watch: UseFormWatch<PRFormData>;
  setValue: UseFormSetValue<PRFormData>;
  errors: FieldErrors<PRFormData>;
  isInjured: boolean;
  onToggleInjured: () => void;
  exercise: {
    title: string;
    day: string;
    category: string;
    weightField: keyof PRFormData;
    sensationField: keyof PRFormData;
  };
}

export default function StepExercise({ register, watch, errors, exercise, isInjured, onToggleInjured }: Props) {
  const sensationValue = (watch(exercise.sensationField) as string) || '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-label">
          {exercise.day} · {exercise.category}
        </p>
        <h2 className="font-bebas text-3xl tracking-tight">{exercise.title}</h2>
        <p className="text-xs text-foreground/50">
          Registra el peso máximo que lograste con técnica limpia.
        </p>
      </div>

      {/* Toggle lesionado */}
      <button
        type="button"
        onClick={onToggleInjured}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
          isInjured
            ? 'bg-destructive/10 border-destructive/40 text-destructive'
            : 'bg-secondary/10 border-border/20 text-muted-foreground hover:border-border/40'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-base">{isInjured ? '🤕' : '🩹'}</span>
          <span className="text-xs font-label uppercase tracking-[0.15em]">
            {isInjured ? 'Marcado como lesionado' : 'Estoy lesionado en este ejercicio'}
          </span>
        </div>
        {/* Indicador visual */}
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
          isInjured ? 'border-destructive bg-destructive' : 'border-border/40'
        }`}>
          {isInjured && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
        </div>
      </button>

      {isInjured ? (
        /* Mensaje cuando está lesionado */
        <div className="flex flex-col items-center justify-center py-8 space-y-2 text-center">
          <span className="text-4xl">🤕</span>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Este ejercicio se guardará como <span className="text-foreground font-medium">Lesionado</span>.<br />
            Puedes continuar con los demás.
          </p>
        </div>
      ) : (
        <>
          {/* Aviso barra olímpica */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/20">
            <span className="text-sm mt-0.5">⚖️</span>
            <p className="text-xs text-foreground/60 leading-relaxed">
              Tu PR debe incluir el peso de la barra olímpica (20 kg).
            </p>
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-label">
              Peso (kg)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="0"
                placeholder="0"
                {...register(exercise.weightField, {
                  required: 'Ingresa el peso',
                  min: { value: 1, message: 'El peso debe ser mayor a 0' },
                })}
                className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors"
              />
              <span className="text-sm text-muted-foreground font-label shrink-0">kg</span>
            </div>
            {errors[exercise.weightField] && (
              <p className="text-xs text-destructive">{errors[exercise.weightField]?.message as string}</p>
            )}
          </div>

          {/* Sensation */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-label">
                ¿Cómo se sintió?
              </label>
              <span className="text-[10px] text-muted-foreground">
                {(sensationValue?.length || 0)}/200
              </span>
            </div>
            <textarea
              maxLength={200}
              rows={3}
              placeholder="Describe cómo se sintió el ejercicio..."
              {...register(exercise.sensationField, {
                required: 'Describe cómo se sintió',
                maxLength: { value: 200, message: 'Máximo 200 caracteres' },
              })}
              className="w-full bg-secondary/20 border border-border/20 rounded-xl px-4 py-3 text-foreground text-sm focus:outline-none focus:border-primary/40 transition-colors resize-none placeholder:text-muted-foreground/40"
            />
            {errors[exercise.sensationField] && (
              <p className="text-xs text-destructive">{errors[exercise.sensationField]?.message as string}</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
