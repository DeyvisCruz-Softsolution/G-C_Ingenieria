'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminLoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AdminLoginModal({ isOpen, onClose }: AdminLoginModalProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async () => {
    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/dashboard')
    } else {
      setError('Contraseña incorrecta')
    }
  }

  if (!isOpen) return null

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2>Acceso Administrativo</h2>
        <input
          type="password"
          placeholder="Ingrese contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button onClick={handleLogin} style={buttonStyle}>
          Ingresar
        </button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}

const overlayStyle = {
  position: 'fixed' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const modalStyle = {
  background: 'white',
  padding: '30px',
  borderRadius: '10px',
  width: '300px',
}

const inputStyle = {
  width: '100%',
  padding: '8px',
  marginBottom: '10px',
}

const buttonStyle = {
  width: '100%',
  padding: '10px',
  background: '#000',
  color: 'white',
  border: 'none',
  cursor: 'pointer',
}