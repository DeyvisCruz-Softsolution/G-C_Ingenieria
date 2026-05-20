import { Suspense } from 'react'
import CotizacionContent from './CotizacionContent'

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <CotizacionContent />
    </Suspense>
  )
}