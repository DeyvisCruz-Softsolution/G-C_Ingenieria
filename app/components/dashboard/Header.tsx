'use client'

export default function Header() {
  return (
    <header className="bg-black border-b border-orange-500 p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-orange-500">
        Panel Administrativo
      </h1>

      <div className="text-sm text-gray-400">
        Acceso Autorizado
      </div>
    </header>
  )
}