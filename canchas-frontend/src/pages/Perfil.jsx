import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { editarPerfil } from '../services/authService'

export default function Perfil() {
  const { usuario, guardarSesion } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    nuevo_password: ''
  })
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')

    if (!form.nombre) {
      setError('El nombre es obligatorio')
      return
    }
    if (form.nuevo_password && form.nuevo_password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setGuardando(true)
    try {
      await editarPerfil(form)
      // Actualizar nombre en el contexto
      guardarSesion({
        token: usuario.token,
        nombre: form.nombre,
        rol: usuario.rol
      })
      setExito('Perfil actualizado correctamente ✅')
      setForm(f => ({ ...f, nuevo_password: '' }))
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el perfil')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="min-h-screen bg-cy-black">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-10">

        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/')}
            className="text-cy-muted hover:text-cy-white text-sm transition-colors"
          >
            ← Volver
          </button>
          <span className="text-cy-gray3">/</span>
          <span className="text-cy-white text-sm font-medium">Mi perfil</span>
        </div>

        {/* Avatar */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-cy-green rounded-full flex items-center justify-center text-3xl font-medium text-white mx-auto mb-3">
            {usuario?.nombre.charAt(0).toUpperCase()}
          </div>
          <p className="text-cy-white font-medium">{usuario?.nombre}</p>
          <span className="text-xs bg-cy-gray2 text-cy-muted px-3 py-1 rounded-full mt-1 inline-block capitalize">
            {usuario?.rol}
          </span>
        </div>

        {/* Formulario */}
        <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-6">
          <h2 className="text-cy-white font-medium mb-5">Editar información</h2>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {exito && (
            <div className="bg-green-950 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">
              {exito}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-cy-muted text-sm block mb-1">Nombre</label>
              <input
                type="text"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Tu nombre"
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              />
            </div>

            <div>
              <label className="text-cy-muted text-sm block mb-1">
                Nueva contraseña <span className="text-cy-gray3">(dejá vacío para no cambiarla)</span>
              </label>
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
              disabled={guardando}
              className="w-full bg-cy-green hover:bg-cy-green-dark text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>

        {/* Links rápidos */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/mis-reservas')}
            className="bg-cy-gray border border-cy-gray2 text-cy-muted text-sm py-3 rounded-xl hover:border-cy-green hover:text-cy-white transition-colors"
          >
            📅 Mis reservas
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-cy-gray border border-cy-gray2 text-cy-muted text-sm py-3 rounded-xl hover:border-cy-green hover:text-cy-white transition-colors"
          >
            🏟️ Ver canchas
          </button>
        </div>

      </div>
    </div>
  )
}