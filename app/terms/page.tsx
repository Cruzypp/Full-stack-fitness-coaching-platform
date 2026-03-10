// app/terminos/page.tsx
// Coloca este archivo en: src/app/terminos/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | The On3 P3rcent",
  description:
    "Términos y Condiciones de uso de la plataforma The On3 P3rcent. Lee nuestras políticas antes de usar el servicio.",
};

interface Subsection {
  title: string;
  content?: string;
  bullets?: string[];
}

interface Section {
  id: string;
  number: string;
  title: string;
  content?: string[];
  bullets?: string[];
  afterBullets?: string[];
  subsections?: Subsection[];
}

const sections: Section[] = [
  {
    id: "requisitos",
    number: "01",
    title: "Requisitos de participación",
    bullets: [
      "Ser mayor de 18 años.",
      "En caso de ser menor de edad, deberá contar obligatoriamente con la autorización expresa de un padre, madre o tutor legal, quien asume toda la responsabilidad del participante.",
      "Contar con la capacidad física y mental para realizar actividad física.",
      "El participante declara conocer su estado de salud y acepta que: Si participa lesionado, con molestias o condiciones preexistentes, lo hace bajo su total responsabilidad. Aun estando sano, participa bajo su propio riesgo.",
      "Aceptar en su totalidad estos términos, reglas y el sistema de vidas del reto.",
    ],
  },
  {
    id: "responsabilidad",
    number: "02",
    title: "Responsabilidad y exención médica",
    bullets: [
      "El participante (o su tutor legal) acepta que participa voluntariamente y bajo su propia responsabilidad, independientemente de su estado de salud.",
      "ON3P3RCENT, sus coaches, organizadores y colaboradores no se hacen responsables por lesiones, recaídas, accidentes, daños físicos, emocionales o complicaciones de salud derivadas de la participación.",
      "La asesoría brindada no sustituye atención médica, fisioterapéutica o nutricional profesional.",
    ],
  },
  {
    id: "equipo",
    number: "03",
    title: "Requerimientos de equipo e instalaciones",
    content: ["El participante deberá contar obligatoriamente con el siguiente equipo:"],
    subsections: [
      {
        title: "Equipo obligatorio desde el inicio",
        bullets: [
          "Barra libre con suficiente peso",
          "Mancuernas con suficiente peso",
          "Barra para dominadas (chin ups, pull ups, etc.)",
          "Foam roller para calentamiento y recuperación",
          "Espacio adecuado para entrenar",
          "Dispositivo con acceso a internet",
          "Capacidad para grabar y enviar evidencia en video",
          "Tenis adecuados para el gym y para correr",
          "Faja deportiva para cargar peso",
        ],
      },
      {
        title: "Equipo para niveles avanzados (cuando se solicite)",
        bullets: [
          "Pelota de yoga",
          "Bosu ball",
          "Ligas de resistencia",
        ],
      },
    ],
    afterBullets: [
      "La falta de equipo no exime al participante del cumplimiento del reto, ni evita la pérdida de vidas o eliminación.",
      "No contar con el equipo no da derecho a reembolso."
    ],
  },
  {
    id: "evidencia",
    number: "04",
    title: "Evidencia obligatoria (videos, fotos e InBody)",
    subsections: [
      {
        title: "Videos diarios (asistencia)",
        bullets: [
          "Se deberá enviar un video diario correspondiente al ejercicio compuesto asignado para ese día.",
          "El video funciona como comprobante de asistencia.",
          "No enviar el video implica pérdida de una vida.",
        ],
      },
      {
        title: "Fotografías",
        bullets: [
          "Enviar foto antes de iniciar el reto.",
          "Enviar foto al finalizar el reto para analizar el antes y después.",
        ],
      },
      {
        title: "InBody",
        bullets: [
          "Enviar InBody inicial antes de comenzar el reto.",
          "Si no se envía el InBody inicial, el participante será eliminado automáticamente.",
          "Enviar InBody cuando sea solicitado durante el reto.",
          "Enviar InBody final al terminar el reto.",
          "Si no se envía el InBody final, el participante no podrá obtener ningún premio.",
        ],
      },
    ],
    afterBullets: [
      "Evidencia incompleta, fuera de tiempo o alterada no será válida."
    ],
  },
  {
    id: "horarios",
    number: "05",
    title: "Horarios, zonas y cortes",
    bullets: [
      "La zona horaria oficial es CDMX.",
      "El participante cuenta con 24 horas naturales para enviar su prueba diaria.",
      "Fines de semana no se envía prueba, excepto el sábado, en el cual sí es obligatorio.",
      "Envíos fuera de tiempo no serán válidos y aplicarán las reglas del sistema de vidas."
    ],
  },
  {
    id: "vidas",
    number: "06",
    title: "Sistema de vidas y eliminación",
    bullets: [
      "Cada participante inicia el reto con 3 vidas.",
      "Cada día que no se envíe el video, se pierde 1 vida automáticamente.",
      "Al perder la totalidad de sus vidas antes de finalizar el reto, el participante será:"
    ],
    afterBullets: [
      "❌ Eliminado inmediatamente del reto",
      "❌ Sin acceso a rutinas",
      "❌ Sin acceso a la comunidad",
      "❌ Sin acceso a premios",
      "",
      "La eliminación es definitiva e irreversible."
    ],
  },
  {
    id: "pagos",
    number: "07",
    title: "Pagos y reembolsos",
    bullets: [
      "El pago del reto no es reembolsable bajo ninguna circunstancia.",
      "No hay devoluciones por:",
      "• Eliminación por pérdida de vidas",
      "• Lesiones",
      "• Abandono",
      "• Falta de tiempo",
      "• Incumplimiento",
      "• No enviar evidencia",
    ],
  },
  {
    id: "imagen",
    number: "08",
    title: "Uso de imagen, fotos y videos (consentimiento)",
    content: [
      "El participante (o su tutor legal) autoriza expresa, libre y gratuitamente a ON3P3RCENT a utilizar:"
    ],
    bullets: [
      "Fotografías",
      "Videos",
      "Testimonios"
    ],
    afterBullets: [
      "El uso será con fines publicitarios, promocionales, educativos y de difusión.",
      "La autorización es sin límite de tiempo ni territorio y sin compensación económica.",
      "El participante renuncia a cualquier reclamación futura relacionada con el uso de su imagen."
    ],
  },
  {
    id: "premios",
    number: "09",
    title: "Premios",
    bullets: [
      "Los premios serán anónimos.",
      "Para determinar ganadores se evaluará:",
      "• Resultados del InBody",
      "• Incremento de fuerza, medido por aumento de cargas",
      "El progreso es individual: cada participante compite contra sí mismo.",
      "El participante con el mayor resultado general será ganador.",
      "Habrá 3 premios generales."
    ],
    afterBullets: [
      "Solo podrán ganar quienes:",
      "• No hayan sido eliminados.",
      "• Hayan enviado toda la evidencia requerida."
    ],
  },
  {
    id: "propiedad-intelectual",
    number: "10",
    title: "Propiedad intelectual y confidencialidad",
    bullets: [
      "Todo el contenido, material, rutinas, métodos, técnicas y conocimientos proporcionados durante el reto son propiedad exclusiva de ON3P3RC3NT.",
      "Queda prohibido compartir, distribuir, reproducir o comercializar el contenido del reto sin autorización expresa por escrito.",
      "El incumplimiento de esta cláusula podrá resultar en:"
    ],
    afterBullets: [
      "❌ Expulsión inmediata del reto",
      "❌ Posibles acciones legales"
    ],
  },
  {
    id: "conducta",
    number: "11",
    title: "Conducta y acceso",
    bullets: [
      "El acceso al reto es personal e intransferible.",
      "ON3P3RCENT podrá remover o expulsar a cualquier participante que:",
      "• Incumpla las reglas",
      "• Falte al respeto",
      "• Comparta contenido del programa",
      "• Afecte a la comunidad"
    ],
    afterBullets: [
      "La expulsión no genera derecho a reembolso."
    ],
  },
  {
    id: "fuerza-mayor",
    number: "12",
    title: "Fuerza mayor",
    content: [
      "ON3P3RCENT no será responsable por incumplimientos derivados de situaciones de fuerza mayor, incluyendo pero no limitándose a:"
    ],
    bullets: [
      "Fallas de plataforma",
      "Cortes de internet",
      "Problemas técnicos externos",
      "Casos externos o ajenos a la organización"
    ],
    afterBullets: [
      "En estos casos:",
      "• El reto continuará.",
      "• Las decisiones operativas se tomarán a criterio exclusivo de la organización, sin generar derecho a reembolso o compensación."
    ],
  },
  {
    id: "modificaciones",
    number: "13",
    title: "Modificaciones",
    content: [
      "ON3P3RCENT se reserva el derecho de modificar estos términos y condiciones en cualquier momento para mejorar la operación del reto.",
      "Cualquier cambio será comunicado a los participantes."
    ],
  },
  {
    id: "aceptacion",
    number: "14",
    title: "Aceptación",
    content: [
      "Al realizar el pago, registrarse o participar, el participante (o su tutor legal) declara haber:"
    ],
    bullets: [
      "Leído",
      "Comprendido",
      "Aceptado"
    ],
    afterBullets: [
      "la totalidad de estos términos y condiciones."
    ],
  },
];

export default function TerminosPage() {
  const lastUpdated = "09 de marzo de 2026";

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-5 flex items-center justify-between sticky top-0 bg-[#050505]/90 backdrop-blur-sm z-10">
        <a href="/" className="flex items-center gap-2 group">
          <span className="text-white/40 text-xs font-mono mt-1">THE ON3 P3RCENT</span>
        </a>
        <span className="text-white/30 text-xs font-mono">
          LEGAL / TÉRMINOS
        </span>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-16">
          <p className="text-[#E8FF47] text-xs font-mono tracking-widest uppercase mb-4">
            Documento Legal
          </p>
          <h1 className="text-5xl font-black tracking-tight leading-none mb-6">
            Términos y
            <br />
            <span className="text-white/30">Condiciones</span>
          </h1>
          <p className="text-white/40 text-sm font-mono">
            Última actualización:{" "}
            <span className="text-white/60">{lastUpdated}</span>
          </p>
        </div>

        {/* Intro callout */}
        <div className="border border-[#E8FF47]/20 bg-[#E8FF47]/5 rounded-lg p-5 mb-16">
          <p className="text-[#E8FF47] font-bold mb-2">Reto ON3P3RCENT</p>
          <p className="text-white/70 text-sm leading-relaxed">
            Al inscribirse, realizar el pago y/o participar en el Reto ON3P3RCENT, el participante acepta de manera expresa los siguientes términos y condiciones.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-0">
          {sections.map((section, i) => (
            <section
              key={section.id}
              id={section.id}
              className="border-t border-white/10 py-10"
            >
              <div className="flex gap-6 items-start">
                {/* Number */}
                <span className="text-[#E8FF47]/30 font-mono text-xs pt-1 shrink-0 w-6">
                  {section.number}
                </span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold mb-4 text-white">
                    {section.title}
                  </h2>

                  {/* Main content paragraphs */}
                  {section.content?.map((paragraph, j) => (
                    <p
                      key={j}
                      className={`text-white/60 text-sm leading-relaxed mb-3 ${paragraph === paragraph.toUpperCase() &&
                        paragraph.length > 30
                        ? "text-white/40 text-xs"
                        : ""
                        }`}
                    >
                      {paragraph}
                    </p>
                  ))}

                  {/* Bullets */}
                  {section.bullets && (
                    <ul className="mt-3 mb-3 space-y-2">
                      {section.bullets.map((item, j) => (
                        <li key={j} className="flex gap-3 items-start">
                          <span className="text-[#E8FF47] text-xs mt-1 shrink-0">
                            —
                          </span>
                          <span className="text-white/60 text-sm leading-relaxed">
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* After bullets */}
                  {section.afterBullets?.map((paragraph, j) => (
                    <p
                      key={j}
                      className="text-white/60 text-sm leading-relaxed mt-3"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {/* Subsections */}
                  {section.subsections?.map((sub, j) => (
                    <div key={j} className="mt-5">
                      <h3 className="text-white/80 text-sm font-semibold mb-2">
                        {sub.title}
                      </h3>
                      {sub.content && (
                        <p className="text-white/60 text-sm leading-relaxed mb-2">
                          {sub.content}
                        </p>
                      )}
                      {sub.bullets && (
                        <ul className="space-y-2">
                          {sub.bullets.map((item, k) => (
                            <li key={k} className="flex gap-3 items-start">
                              <span className="text-[#E8FF47] text-xs mt-1 shrink-0">
                                —
                              </span>
                              <span className="text-white/60 text-sm leading-relaxed">
                                {item}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 pt-10 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-white/20 text-xs font-mono">
            © 2026 The On3 P3rcent. Todos los derechos reservados.
          </p>
          <a
            href="mailto:oviverossecin@gmail.com"
            className="text-[#E8FF47]/60 text-xs font-mono hover:text-[#E8FF47] transition-colors"
          >
            oviverossecin@gmail.com
          </a>
        </div>
      </main>
    </div>
  );
}