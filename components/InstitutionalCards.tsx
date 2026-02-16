"use client";

import { useState, useEffect } from "react";

const cards = [
  {
    title: "MISIÓN",
    content: `Diseñar, desarrollar y ejecutar proyectos integrales en electricidad residencial, comercial e industrial, redes y telecomunicaciones y obras civiles asociadas.`,
  },
  {
    title: "VISIÓN",
    content: `Consolidarnos como empresa referente en infraestructura eléctrica y tecnológica a nivel nacional.`,
  },
  {
    title: "OBJETIVOS ESTRATÉGICOS",
    content: `• Garantizar ejecución técnica.
• Integrar soluciones multidisciplinarias.
• Optimizar cronogramas y costos.
• Fortalecer relaciones comerciales.
• Implementar innovación tecnológica.`,
  },
];

export default function InstitutionalCards() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-light pt-12 pb-16 px-4 md:px-4 -mt-2">

      <div className="max-w-4xl mx-auto">

        <div className="bg-white shadow-xl rounded-2xl md:rounded-3xl p-6 md:p-10 border-t-4 border-gold transition-all duration-500">

          <h3 className="text-xl md:text-2xl font-bold text-gold mb-4">
            {cards[active].title}
          </h3>

          <p className="text-gray-700 whitespace-pre-line leading-relaxed text-xs sm:text-sm md:text-base text-justify">
            {cards[active].content}
          </p>

        </div>

      </div>
    </section>
  );
}
