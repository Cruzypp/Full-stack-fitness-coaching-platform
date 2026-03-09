// app/terminos/page.tsx
// Coloca este archivo en: src/app/terminos/page.tsx

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y Condiciones | On3 P3rcent",
  description:
    "Términos y Condiciones de uso de la plataforma On3 P3rcent. Lee nuestras políticas antes de usar el servicio.",
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
    id: "aceptacion",
    number: "01",
    title: "Aceptación de los Términos",
    content: [
      `Somos The On3 P3rcent ("Empresa", "nosotros", "nuestro"). Operamos el sitio web https://theon3p3rcent.vercel.app (el "Sitio") y los servicios relacionados de coaching de fitness (colectivamente, los "Servicios"). Contacto: oviverossecin@gmail.com`,
      `Estos Términos y Condiciones ("Términos") constituyen un acuerdo legalmente vinculante entre usted ("Usuario") y The On3 P3rcent, que rige su acceso y uso de los Servicios. Al acceder a los Servicios, confirma haber leído, comprendido y aceptado estos Términos en su totalidad.`,
      "SI NO ESTÁ DE ACUERDO, DEBE DEJAR DE UTILIZAR LOS SERVICIOS DE INMEDIATO.",
      "Los Servicios están destinados a usuarios mayores de 13 años. Los menores de edad requieren el consentimiento de su padre, madre o tutor legal.",
    ],
  },
  {
    id: "servicios",
    number: "02",
    title: "Descripción de los Servicios",
    content: [
      "On3 P3rcent es una plataforma digital de coaching fitness que conecta a un coach con sus alumnos a través de:",
    ],
    bullets: [
      `Retos de entrenamiento estructurados ("Challenges") disponibles como compras únicas`,
      "Acceso a biblioteca de ejercicios, rutinas de entrenamiento y planes personalizados",
      "Envío de fotos y videos como evidencia de cumplimiento del reto",
      "Comunicación vía WhatsApp entre el coach y los alumnos",
      "Seguimiento de progreso y retroalimentación del coach",
    ],
    afterBullets: [
      "Los Servicios no constituyen asesoramiento médico. Consulte siempre a un profesional de la salud antes de iniciar cualquier programa de ejercicio. El coach es un profesional independiente; On3 P3rcent es una plataforma tecnológica que facilita la relación coach-alumno.",
    ],
  },
  {
    id: "propiedad",
    number: "03",
    title: "Derechos de Propiedad Intelectual",
    content: [
      `Somos dueños o licenciatarios de toda la propiedad intelectual de nuestros Servicios, incluyendo código fuente, bases de datos, funcionalidad, software, diseños, audio, video, texto, fotografías y gráficos (el "Contenido"), así como marcas comerciales y logotipos (las "Marcas").`,
      "Le otorgamos una licencia no exclusiva, intransferible y revocable para acceder a los Servicios únicamente para su uso personal y no comercial. Queda prohibido copiar, reproducir, distribuir, vender o explotar cualquier Contenido o Marca sin nuestro permiso previo por escrito.",
    ],
  },
  {
    id: "declaraciones",
    number: "04",
    title: "Declaraciones del Usuario",
    content: ["Al utilizar los Servicios, usted declara y garantiza que:"],
    bullets: [
      "Toda la información de registro que proporcione es verdadera, precisa, actual y completa",
      "Mantendrá la exactitud de dicha información y la actualizará cuando sea necesario",
      "Tiene capacidad legal y acepta cumplir con estos Términos",
      "No es menor de 13 años",
      "No utilizará los Servicios para ningún propósito ilegal o no autorizado",
      "Comprende que las actividades físicas conllevan riesgos inherentes y participa de manera voluntaria",
    ],
  },
  {
    id: "pagos",
    number: "05",
    title: "Compras y Pagos",
    subsections: [
      {
        title: "Métodos de Pago",
        content:
          "Aceptamos Visa y Mastercard, procesados de forma segura a través de Stripe, Inc. Al completar una compra, acepta los Términos de Servicio de Stripe (https://stripe.com/es-mx/legal).",
      },
      {
        title: "Precios y Moneda",
        content:
          "Todos los pagos se procesarán en Pesos Mexicanos (MXN). Podemos cambiar los precios en cualquier momento.",
      },
      {
        title: "Compras de Challenges",
        content:
          "Cada Challenge se vende como compra única. Al completar el pago, obtendrá acceso al contenido completo del Challenge durante el período especificado al momento de la compra.",
      },
    ],
  },
  {
    id: "stripe-connect",
    number: "06",
    title: "Stripe Connect y Procesamiento de Pagos",
    content: [
      "On3 P3rcent utiliza Stripe Connect Marketplace para facilitar los pagos entre alumnos y coaches.",
    ],
    subsections: [
      {
        title: "Para Alumnos",
        bullets: [
          "Los servicios de pago son provistos por Stripe y están sujetos al Acuerdo de Servicios de Stripe",
          "On3 P3rcent actúa como plataforma facilitadora, no como vendedor directo de los servicios de coaching",
          "Las disputas sobre calidad del servicio deben dirigirse primero al coach a través de la plataforma",
        ],
      },
      {
        title: "Para Coaches",
        bullets: [
          "Al registrarse como coach, acepta el Acuerdo de Cuenta Conectada de Stripe (https://stripe.com/es-mx/legal/connect-account)",
          "Autoriza a On3 P3rcent a compartir su información con Stripe para proveer los servicios de pago",
          "Los pagos están sujetos al calendario de desembolsos de Stripe",
          "Es responsable de declarar y pagar los impuestos aplicables sobre sus ingresos",
        ],
      },
    ],
  },
  {
    id: "reembolsos",
    number: "07",
    title: "Política de Reembolsos",
    content: [
      "Todas las compras de Challenges son definitivas. No se emitirán reembolsos una vez otorgado el acceso, excepto en los siguientes casos:",
    ],
    bullets: [
      "El contenido del Challenge es materialmente diferente a lo descrito al momento de la compra",
      "Problemas técnicos en nuestra plataforma impiden el acceso por más de 72 horas consecutivas",
      "El coach cancela el Challenge antes de que comience",
    ],
    afterBullets: [
      "Para solicitar un reembolso, contáctenos dentro de los 7 días siguientes a la compra en yagope211@gmail.com. Los reembolsos aprobados se procesarán a través de Stripe en un plazo de 5 a 10 días hábiles.",
    ],
  },
  {
    id: "evidencias",
    number: "08",
    title: "Contenido Generado por el Usuario y Evidencias",
    content: [
      `La plataforma le permite enviar fotos y videos como evidencia de sus entrenamientos ("Evidencias"). Al enviar Evidencias:`,
    ],
    bullets: [
      "Confirma que es el creador del contenido y cuenta con todos los derechos necesarios",
      "Otorga a On3 P3rcent y al coach una licencia limitada para ver y usar la Evidencia únicamente para verificar el cumplimiento del Challenge",
      "Confirma que el contenido refleja fielmente su desempeño sin manipulación ni engaño",
      "No enviará contenido inapropiado, obsceno o que viole cualquier ley aplicable",
    ],
  },
  {
    id: "prohibidas",
    number: "09",
    title: "Actividades Prohibidas",
    content: ["Usted acepta no:"],
    bullets: [
      "Enviar evidencias fraudulentas o manipuladas de entrenamiento",
      "Hacerse pasar por otro usuario, el coach o cualquier representante de On3 P3rcent",
      "Extraer o recopilar sistemáticamente datos de los Servicios sin permiso escrito",
      "Interferir o interrumpir la seguridad o rendimiento de los Servicios",
      "Cargar código malicioso, virus o cualquier material dañino",
      "Intentar acceder a cuentas o datos privados de otros usuarios",
      "Acosar, abusar o amenazar a otros usuarios, al coach o al personal de On3 P3rcent",
    ],
    afterBullets: [
      "La violación de estas actividades podrá resultar en la cancelación inmediata de su cuenta sin reembolso.",
    ],
  },
  {
    id: "privacidad",
    number: "10",
    title: "Política de Privacidad",
    content: [
      "Nos preocupamos por la privacidad y seguridad de sus datos. Al usar los Servicios, acepta nuestra Política de Privacidad. Los Servicios están alojados en México y Estados Unidos.",
      "Los datos recopilados incluyen: información de registro, datos de pago (procesados por Stripe), evidencias de entrenamiento y datos de uso de la plataforma.",
    ],
  },
  {
    id: "terminacion",
    number: "11",
    title: "Vigencia y Terminación",
    content: [
      "Estos Términos permanecerán en plena vigencia mientras use los Servicios. Nos reservamos el derecho de cancelar su cuenta y eliminar cualquier contenido en cualquier momento, sin previo aviso, por incumplimiento de estos Términos o cualquier ley aplicable.",
    ],
  },
  {
    id: "ley",
    number: "12",
    title: "Ley Aplicable y Resolución de Controversias",
    content: [
      "Estos Términos se regirán por las leyes de los Estados Unidos Mexicanos. Los tribunales de México tendrán jurisdicción exclusiva para resolver cualquier controversia.",
      "Antes de iniciar cualquier proceso formal, ambas partes acuerdan negociar informalmente durante al menos 30 días. Si no prosperara, las controversias se resolverán mediante arbitraje con sede en Monterrey, Nuevo León, México, en idioma español.",
    ],
  },
  {
    id: "descargo",
    number: "13",
    title: "Descargo de Responsabilidad y Limitación de Responsabilidad",
    content: [
      "LOS SERVICIOS SE PROPORCIONAN TAL COMO ESTÁN Y SEGÚN DISPONIBILIDAD. LAS ACTIVIDADES FÍSICAS CONLLEVAN RIESGOS INHERENTES. ON3 P3RCENT NO ES RESPONSABLE POR LESIONES, COMPLICACIONES DE SALUD O RESULTADOS ADVERSOS DERIVADOS DE LA PARTICIPACIÓN EN CHALLENGES.",
      "NUESTRA RESPONSABILIDAD TOTAL HACIA USTED ESTARÁ LIMITADA AL MONTO PAGADO POR USTED DURANTE LOS DOS (2) MESES ANTERIORES A LA CAUSA DE LA ACCIÓN.",
    ],
  },
  {
    id: "contacto",
    number: "14",
    title: "Contáctenos",
    content: [
      "Para resolver una queja o recibir más información sobre los Servicios:",
      "The On3 P3rcent — yagope211@gmail.com — https://theon3p3rcent.vercel.app",
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
          <p className="text-white/70 text-sm leading-relaxed">
            Al acceder o utilizar la plataforma On3 P3rcent, aceptas estos
            Términos y Condiciones en su totalidad. Si no estás de acuerdo,
            debes dejar de usar los Servicios de inmediato.
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
            href="mailto:yagope211@gmail.com"
            className="text-[#E8FF47]/60 text-xs font-mono hover:text-[#E8FF47] transition-colors"
          >
            yagope211@gmail.com
          </a>
        </div>
      </main>
    </div>
  );
}