"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/95 backdrop-blur-md shadow-lg"
          : "bg-primary"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-5 flex justify-between items-center">

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo3.png"
            alt="C&G Ingeniería"
            width={45}
            height={45}
          />
          <span className="text-lg md:text-3xl font-bold text-white">
            C&G Ingeniería
          </span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-10 text-white font-semibold text-sm tracking-wide">
          <Link href="#" className="hover:text-gold transition">Nosotros</Link>
          <Link href="#" className="hover:text-gold transition">Portafolio</Link>
          <Link href="#" className="hover:text-gold transition">Contáctanos</Link>
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-primary text-white px-6 pb-5 space-y-4">
          <Link href="#" className="block">Nosotros</Link>
          <Link href="#" className="block">Portafolio</Link>
          <Link href="#" className="block">Contáctanos</Link>
        </div>
      )}
    </nav>
  );
}
