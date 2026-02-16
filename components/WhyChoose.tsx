export default function WhyChooseUs() {
  return (
    <section className="py-10 md:py-14 bg-gray-50">

      <div className="max-w-7xl mx-auto px-6">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
            ¿Por qué elegirnos?
          </h2>

          <div className="w-16 h-[2px] bg-gold mx-auto"></div>
        </div>

        {/* Tarjetas */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">

          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-primary mb-2">
              Experiencia Técnica
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Contamos con profesionales con más de una década de experiencia
              en proyectos eléctricos, tecnológicos y civiles.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-primary mb-2">
              Innovación y Tecnología
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Implementamos soluciones modernas adaptadas a cada necesidad,
              garantizando eficiencia y rendimiento.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition">
            <h3 className="font-semibold text-primary mb-2">
              Compromiso y Calidad
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Trabajamos bajo altos estándares técnicos y de seguridad,
              asegurando cumplimiento y satisfacción del cliente.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
