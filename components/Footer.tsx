export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">

      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold to-transparent" />

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid md:grid-cols-3 gap-8">

          <div>
            <h3 className="text-lg font-bold mb-3">
              C&G Ingeniería
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Infraestructura y soluciones técnicas con estándares internacionales.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Servicios</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Obras Civiles</li>
              <li>Climatización</li>
              <li>Ingeniería Eléctrica</li>
              <li>Consultoría</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Contacto</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Cra 22 # 51-32 Bucaramanga - Colombia</li>
              <li>+57 315 341 1850 - +57 350 471 7130</li>
              <li>cgIngenieria0@gmail.com</li>
              <li>www.g-c-ingenieria.vercel.app</li>  

            </ul>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} DISEÑADO POR SOFTSOLUTION E.U. @ Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}
