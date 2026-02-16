"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section className="relative pt-28 pb-14 md:pb-18 bg-gradient-to-r from-primary via-secondary to-primary text-white overflow-hidden">
      
      <div className="max-w-6xl mx-auto px-6">

        {/* TÍTULO */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight">
            Soluciones Integrales en Ingeniería,
            <span className="text-gold block sm:inline">
              {" "}Tecnología e Infraestructura
            </span>
          </h1>

          {/* Línea dorada animada */}
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "900px" }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="h-[3px] bg-gold mx-auto mt-5 rounded-full"
          />
        </motion.div>

        {/* CONTENIDO 60 / 40 */}
        <div className="grid md:grid-cols-5 gap-8 md:gap-12 items-center">


          {/* TEXTO 60% */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-3 text-sm sm:text-base md:text-lg leading-relaxed text-justify"
          >
            <p>
              En <strong>C&G Ingeniería</strong> integramos experiencia técnica,
              innovación y compromiso para desarrollar proyectos eléctricos,
              tecnológicos, de climatización y obras civiles con altos estándares
              de calidad.
            </p>

            <p className="mt-12">
              Somos una empresa fundada en 2026, con profesionales que cuentan
              con más de una década de experiencia en sus áreas, ofreciendo
              soluciones eficientes, seguras y adaptadas a cada necesidad.
            </p>
          </motion.div>

          {/* LOGO 40% */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="md:col-span-2 flex justify-center md:justify-start md:pl-20"

          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="bg-white/5 backdrop-blur-md p-2 rounded-3xl border border-white/10 shadow-xl"
            >
              <Image
                src="/logo1.png"
                alt="C&G Ingeniería"
                width={250}
                height={250}
                className="object-contain"
              />
            </motion.div>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
