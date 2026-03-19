import { CheckCircle } from 'lucide-react';

export default function StepDone() {
  return (
    <div className="flex flex-col items-center text-center space-y-5 py-8">
      <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
        <CheckCircle size={32} className="text-primary" />
      </div>
      <div className="space-y-2">
        <h2 className="font-bebas text-3xl tracking-tight">¡PR REGISTRADO!</h2>
        <p className="text-sm text-foreground/50 leading-relaxed max-w-xs">
          Tu coach ya tiene tus datos. A partir de aquí se calculan todos tus porcentajes de trabajo para las semanas siguientes.
        </p>
      </div>
      <p className="text-xs text-primary font-label uppercase tracking-widest">
        Listo para la Semana 1 💪
      </p>
    </div>
  );
}
