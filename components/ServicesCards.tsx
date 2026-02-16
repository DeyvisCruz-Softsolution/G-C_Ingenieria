"use client";

import { useEffect, useRef } from "react";
import { Zap, Building2, Snowflake } from "lucide-react";

export default function ServicesCards() {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Animación suave al hacer scroll
  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll(".fade-up");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "translate-y-6");
            entry.target.classList.add("opacity-100", "translate-y-0");
          }
        });
      },
      { threshold: 0.2 }
    );

    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-white to-gray-100">

      <div className="max-w-7xl mx-auto px-6">

        {/* Encabezado */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
            Nuestros Servicios
          </h2>
          <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"></div>
        </div>

        {/* Cards */}
        <div
          ref={sectionRef}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-8"
        >

          {/* Card 1 */}
          <div className="fade-up opacity-0 translate-y-6 transition-all duration-700 group backdrop-blur-lg bg-white/60 border border-white/30 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2">

            <Zap className="w-10 h-10 text-primary group-hover:text-gold transition mb-4" />

            <h3 className="text-lg font-semibold text-primary mb-3 group-hover:text-gold transition">
              Ingeniería Eléctrica
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              Diseño, instalación y mantenimiento de sistemas eléctricos
              industriales y comerciales con altos estándares de seguridad.
            </p>

            <div className="mt-6 h-[2px] w-0 bg-gold transition-all duration-500 group-hover:w-full"></div>
          </div>

          {/* Card 2 */}
          <div className="fade-up opacity-0 translate-y-6 transition-all duration-700 group backdrop-blur-lg bg-white/60 border border-white/30 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2">

            <Snowflake className="w-10 h-10 text-primary group-hover:text-gold transition mb-4" />

            <h3 className="text-lg font-semibold text-primary mb-3 group-hover:text-gold transition">
              Climatización
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              Implementación de sistemas HVAC eficientes y adaptados a cada
              tipo de infraestructura.
            </p>

            <div className="mt-6 h-[2px] w-0 bg-gold transition-all duration-500 group-hover:w-full"></div>
          </div>

          {/* Card 3 */}
          <div className="fade-up opacity-0 translate-y-6 transition-all duration-700 group backdrop-blur-lg bg-white/60 border border-white/30 p-8 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-2">

            <Building2 className="w-10 h-10 text-primary group-hover:text-gold transition mb-4" />

            <h3 className="text-lg font-semibold text-primary mb-3 group-hover:text-gold transition">
              Obras Civiles
            </h3>

            <p className="text-sm text-gray-600 leading-relaxed">
              Desarrollo de infraestructura con planificación estratégica,
              calidad técnica y cumplimiento normativo.
            </p>

            <div className="mt-6 h-[2px] w-0 bg-gold transition-all duration-500 group-hover:w-full"></div>
          </div>

        </div>

      </div>
    </section>
  );
}
