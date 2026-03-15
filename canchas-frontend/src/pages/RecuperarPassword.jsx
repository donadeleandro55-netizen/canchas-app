import { useState } from 'react'
import { Link } from 'react-router-dom'
import { recuperarPassword } from '../services/authService'

export default function RecuperarPassword() {
  const [form, setForm] = useState({ email: '', nuevo_password: '' })
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.nuevo_password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setCargando(true)
    try {
      await recuperarPassword(form)
      setExito(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al recuperar contraseña')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="min-h-screen bg-cy-black flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-cy-green rounded-xl flex items-center justify-center text-xl">⚽</div>
            <span className="text-2xl font-medium text-cy-white">Cancha<span className="text-cy-green-light">Ya</span></span>
          </div>
          <p className="text-cy-muted text-sm">Recuperá el acceso a tu cuenta</p>
        </div>

        <div className="bg-cy-gray border border-cy-gray2 rounded-2xl p-8">
          <h2 className="text-cy-white font-medium text-lg mb-6">Recuperar contraseña</h2>

          {exito ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-cy-white font-medium mb-2">¡Contraseña actualizada!</p>
              <p className="text-cy-muted text-sm mb-6">Ya podés iniciar sesión con tu nueva contraseña.</p>
              <Link to="/login" className="bg-cy-green text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-cy-green-dark transition-colors">
                Ir al login
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-cy-muted text-sm block mb-1">Email de tu cuenta</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="tu@email.com"
                    className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
                  />
                </div>
                <div>
                  <label className="text-cy-muted text-sm block mb-1">Nueva contraseña</label>
                  <input
                    type="password"
                    value={form.nuevo_password}
                    onChange={(e) => setForm({ ...form, nuevo_password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-cy-green hover:bg-cy-green-dark text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
                >
                  {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link to="/login" className="text-cy-muted text-sm hover:text-cy-green-light transition-colors">
                  Volver al login
                </Link>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}