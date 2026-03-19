export default function StepIntro() {
  return (
    <div className="space-y-6">
      <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-2xl">
        🏋️
      </div>

      <div className="space-y-2">
        <h2 className="font-bebas text-3xl tracking-tight">PR INICIAL</h2>
        <p className="text-sm text-foreground/50 leading-relaxed">
          Esta semana conocerás tu fuerza real. Registrarás <strong className="text-foreground/80">1 repetición máxima</strong> en cada ejercicio principal con técnica limpia.
        </p>
      </div>

      <div className="space-y-3">
        {[
          { day: 'Lunes', exercise: 'Back Squat', type: '1RM' },
          { day: 'Martes', exercise: 'Bench Press', type: '1RM' },
          { day: 'Jueves', exercise: 'Shoulder Press', type: '1RM' },
          { day: 'Jueves', exercise: 'Pull / Row', type: '5RM técnico' },
          { day: 'Viernes', exercise: 'Deadlift', type: '1RM' },
        ].map(({ day, exercise, type }) => (
          <div
            key={exercise}
            className="flex items-center justify-between px-4 py-3 rounded-xl bg-secondary/20 border border-border/20"
          >
            <div>
              <p className="text-sm font-semibold text-foreground">{exercise}</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{day}</p>
            </div>
            <span className="text-[10px] font-label uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
              {type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
