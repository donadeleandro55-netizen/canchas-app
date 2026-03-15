import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/authService'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const { guardarSesion } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await login(form)
      guardarSesion(res.data)
      if (res.data.rol === 'admin') {
        navigate('/admin')
      } else {
        navigate('/')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-cy-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-cy-green rounded-xl flex items-center justify-center text-xl">⚽</div>
            <span className="text-2xl font-medium text-cy-white">Cancha<span className="text-cy-green-light">Ya</span></span>
          </div>
          <p className="text-cy-muted text-sm">Iniciá sesión para reservar tu cancha</p>
        </div>

        {/* Card */}
        <div className="bg-cy-gray border border-cy-gray2 rounded-2xl p-8">
          <h2 className="text-cy-white font-medium text-lg mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-cy-muted text-sm block mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="tu@email.com"
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              />
            </div>
            <div>
              <label className="text-cy-muted text-sm block mb-1">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••"
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-cy-green hover:bg-cy-green-dark text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <Link to="/recuperar-password" className="text-cy-muted text-sm hover:text-cy-green-light transition-colors block">
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-cy-muted text-sm">
              ¿No tenés cuenta?{' '}
              <Link to="/registro" className="text-cy-green-light hover:underline">
                Registrate
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}