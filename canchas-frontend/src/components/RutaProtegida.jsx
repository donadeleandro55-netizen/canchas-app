import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>
  if (!usuario) return <Navigate to="/login" />
  return children
}

export function RutaAdmin({ children }) {
  const { usuario, cargando } = useAuth()
  if (cargando) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Cargando...</div>
  if (!usuario) return <Navigate to="/login" />
  if (usuario.rol !== 'admin') return <Navigate to="/" />
  return children
}