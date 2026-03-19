'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/app/lib/connection';
import { useAuthStore } from '@/app/store/useAuthStore';
import StepIntro from './_steps/StepIntro';
import StepExercise from './_steps/StepExercise';
import StepDone from './_steps/StepDone';

export interface PRFormData {
  back_squat_weight: number | '';
  back_squat_sensation: string;
  bench_press_weight: number | '';
  bench_press_sensation: string;
  shoulder_press_weight: number | '';
  shoulder_press_sensation: string;
  pull_weight: number | '';
  pull_reps: number | '';
  pull_sensation: string;
  deadlift_weight: number | '';
  deadlift_sensation: string;
}

const EXERCISES = [
  {
    title: 'Back Squat',
    day: 'Lunes',
    category: 'Pierna / Core',
    weightField: 'back_squat_weight' as keyof PRFormData,
    sensationField: 'back_squat_sensation' as keyof PRFormData,
  },
  {
    title: 'Bench Press',
    day: 'Martes',
    category: 'Empuje / Pectoral',
    weightField: 'bench_press_weight' as keyof PRFormData,
    sensationField: 'bench_press_sensation' as keyof PRFormData,
  },
  {
    title: 'Shoulder Press',
    day: 'Jueves',
    category: 'Empuje Vertical',
    weightField: 'shoulder_press_weight' as keyof PRFormData,
    sensationField: 'shoulder_press_sensation' as keyof PRFormData,
  },
  {
    title: 'Pull / Row',
    day: 'Jueves',
    category: 'Tirón',
    weightField: 'pull_weight' as keyof PRFormData,
    sensationField: 'pull_sensation' as keyof PRFormData,
    repsField: 'pull_reps' as keyof PRFormData,
    repsLabel: 'Reps completadas (5RM técnico)',
  },
  {
    title: 'Deadlift',
    day: 'Viernes',
    category: 'Cadena Posterior',
    weightField: 'deadlift_weight' as keyof PRFormData,
    sensationField: 'deadlift_sensation' as keyof PRFormData,
  },
];

// Step 0 = intro, 1-5 = ejercicios, 6 = done
const TOTAL_STEPS = EXERCISES.length + 2;

export default function PRInicial() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const { register, watch, setValue, trigger, formState: { errors }, getValues } = useForm<PRFormData>({
    defaultValues: {
      back_squat_weight: '', back_squat_sensation: '',
      bench_press_weight: '', bench_press_sensation: '',
      shoulder_press_weight: '', shoulder_press_sensation: '',
      pull_weight: '', pull_reps: '', pull_sensation: '',
      deadlift_weight: '', deadlift_sensation: '',
    },
  });

  const isIntro = currentStep === 0;
  const isDone = currentStep === TOTAL_STEPS - 1;
  const exerciseIndex = currentStep - 1; // 0-based index into EXERCISES
  const progress = Math.round((currentStep / (TOTAL_STEPS - 1)) * 100);

  const handleNext = async () => {
    if (isIntro) {
      setCurrentStep(1);
      return;
    }

    const exercise = EXERCISES[exerciseIndex];
    const fieldsToValidate: (keyof PRFormData)[] = [
      exercise.weightField,
      exercise.sensationField,
      ...(exercise.repsField ? [exercise.repsField] : []),
    ];

    // Validate sensation manually (not registered via RHF)
    const sensationVal = watch(exercise.sensationField);
    if (!sensationVal) {
      toast.error('Selecciona cómo se sintió el ejercicio');
      return;
    }

    const valid = await trigger(fieldsToValidate);
    if (!valid) return;

    // Last exercise → submit
    if (exerciseIndex === EXERCISES.length - 1) {
      await handleSubmit();
    } else {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const values = getValues();

    const records = [
      { exercise: 'Back Squat',      weight_kg: values.back_squat_weight,      reps: 1,                    sensation: values.back_squat_sensation },
      { exercise: 'Bench Press',     weight_kg: values.bench_press_weight,     reps: 1,                    sensation: values.bench_press_sensation },
      { exercise: 'Shoulder Press',  weight_kg: values.shoulder_press_weight,  reps: 1,                    sensation: values.shoulder_press_sensation },
      { exercise: 'Pull / Row',      weight_kg: values.pull_weight,            reps: values.pull_reps,     sensation: values.pull_sensation },
      { exercise: 'Deadlift',        weight_kg: values.deadlift_weight,        reps: 1,                    sensation: values.deadlift_sensation },
    ].map((r) => ({ ...r, user_id: user!.id, week: 0 }));

    const { error } = await supabase.from('pr_records').insert(records);

    setSubmitting(false);

    if (error) {
      toast.error('Error al guardar. Intenta de nuevo.');
      console.error(error);
      return;
    }

    setCurrentStep(TOTAL_STEPS - 1);
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4">
        {!isDone ? (
          <button
            onClick={() => currentStep > 0 ? setCurrentStep((s) => s - 1) : router.back()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
        ) : <div />}
        <p className="text-[10px] font-label uppercase tracking-[0.2em] text-muted-foreground">
          {isDone ? 'Completado' : isIntro ? 'Semana 0' : `${exerciseIndex + 1} / ${EXERCISES.length}`}
        </p>
        <div className="w-5" />
      </header>

      {/* Progress bar */}
      {!isIntro && (
        <div className="px-5 mb-2">
          <div className="w-full h-1 bg-secondary/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 px-5 py-6 overflow-y-auto">
        <div className="max-w-md mx-auto">
          {isIntro && <StepIntro />}
          {!isIntro && !isDone && (
            <StepExercise
              key={exerciseIndex}
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              exercise={EXERCISES[exerciseIndex]}
            />
          )}
          {isDone && <StepDone />}
        </div>
      </main>

      {/* Footer CTA */}
      <div className="px-5 pb-10 pt-4 max-w-md mx-auto w-full">
        {isDone ? (
          <button
            onClick={() => router.push('/mis-cargas')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5"
          >
            Ver mis cargas
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-label text-sm uppercase tracking-[0.2em] font-bold transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'GUARDANDO...' : isIntro ? 'COMENZAR' : exerciseIndex === EXERCISES.length - 1 ? 'FINALIZAR' : 'SIGUIENTE'}
          </button>
        )}
      </div>
    </div>
  );
}
