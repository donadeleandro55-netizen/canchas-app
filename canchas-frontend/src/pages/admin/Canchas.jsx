import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarCanchas } from '../../services/canchaService'
import api from '../../services/api'

export default function Canchas() {
  const navigate = useNavigate()
  const [canchas, setCanchas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [form, setForm] = useState({ nombre: '', descripcion: '', precio: '', foto: '' })
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')
  const [guardando, setGuardando] = useState(false)

  const cargarCanchas = () => {
    listarCanchas()
      .then(res => setCanchas(res.data || []))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargarCanchas() }, [])

  const handleGuardar = async (e) => {
    e.preventDefault()
    setError('')
    setExito('')
    if (!form.nombre || !form.precio) {
      setError('Nombre y precio son obligatorios')
      return
    }
    setGuardando(true)
    try {
      if (editando) {
        await api.put(`/admin/canchas/${editando}`, { ...form, precio: parseFloat(form.precio) })
        setExito('Cancha actualizada correctamente')
      } else {
        await api.post('/admin/canchas', { ...form, precio: parseFloat(form.precio) })
        setExito('Cancha creada correctamente')
      }
      setForm({ nombre: '', descripcion: '', precio: '', foto: '' })
      setEditando(null)
      cargarCanchas()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleEditar = (cancha) => {
    setEditando(cancha.id)
    setForm({ nombre: cancha.nombre, descripcion: cancha.descripcion, precio: cancha.precio.toString(), foto: cancha.foto || '' })
    setError('')
    setExito('')
    window.scrollTo(0, 0)
  }

  const handleDesactivar = async (id) => {
    if (!confirm('¿Desactivar esta cancha?')) return
    try {
      await api.delete(`/admin/canchas/${id}`)
      cargarCanchas()
    } catch (err) {
      alert('Error al desactivar')
    }
  }

  return (
    <div className="min-h-screen bg-cy-black">
      <div className="bg-cy-gray border-b border-cy-gray2 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-cy-muted hover:text-cy-white text-sm transition-colors">
            ← Panel admin
          </button>
          <span className="text-cy-gray3">/</span>
          <span className="text-cy-white text-sm font-medium">Gestión de canchas</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Formulario */}
        <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-6 mb-8">
          <h2 className="text-cy-white font-medium mb-5">
            {editando ? '✏️ Editar cancha' : '+ Nueva cancha'}
          </h2>

          {error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
          {exito && <div className="bg-green-950 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-lg mb-4">{exito}</div>}

          <form onSubmit={handleGuardar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-cy-muted text-sm block mb-1">Nombre</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  placeholder="Ej: Cancha 1 - Techada"
                  className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
                />
              </div>
              <div>
                <label className="text-cy-muted text-sm block mb-1">Precio por hora</label>
                <input
                  type="number"
                  value={form.precio}
                  onChange={(e) => setForm({ ...form, precio: e.target.value })}
                  placeholder="Ej: 4000"
                  className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="text-cy-muted text-sm block mb-1">Descripción</label>
              <input
                type="text"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                placeholder="Ej: Pasto sintético techada con iluminación LED"
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              />
            </div>
            <div>
              <label className="text-cy-muted text-sm block mb-1">
                Foto <span className="text-cy-gray3">(URL de imagen, opcional)</span>
              </label>
              <input
                type="text"
                value={form.foto}
                onChange={(e) => setForm({ ...form, foto: e.target.value })}
                placeholder="Ej: https://images.unsplash.com/..."
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              />
              {/* Preview de la foto */}
              {form.foto && (
                <div className="mt-2 rounded-lg overflow-hidden h-32">
                  <img
                    src={form.foto}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 flex-wrap">
              <button
                type="submit"
                disabled={guardando}
                className="bg-cy-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-cy-green-dark transition-colors disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : editando ? 'Actualizar cancha' : 'Crear cancha'}
              </button>
              {editando && (
                <button
                  type="button"
                  onClick={() => { setEditando(null); setForm({ nombre: '', descripcion: '', precio: '', foto: '' }); setError(''); setExito('') }}
                  className="border border-cy-gray3 text-cy-muted px-6 py-2.5 rounded-lg text-sm hover:border-cy-white hover:text-cy-white transition-colors"
                >
                  Cancelar edición
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Lista de canchas */}
        <h2 className="text-cy-white font-medium mb-4">Canchas activas</h2>
        {cargando ? (
          <p className="text-cy-muted text-sm">Cargando...</p>
        ) : canchas.length === 0 ? (
          <p className="text-cy-muted text-sm text-center py-10">No hay canchas todavía</p>
        ) : (
          <div className="space-y-3">
            {canchas.map(cancha => (
              <div key={cancha.id} className="bg-cy-gray border border-cy-gray2 rounded-xl overflow-hidden">
                {cancha.foto && (
                  <img src={cancha.foto} alt={cancha.nombre} className="w-full h-32 object-cover" />
                )}
                <div className="p-4 flex justify-between items-center gap-4">
                  <div className="flex gap-3 items-center">
                    {!cancha.foto && (
                      <div className="w-10 h-10 bg-green-950 rounded-lg flex items-center justify-center text-xl flex-shrink-0">🏟️</div>
                    )}
                    <div>
                      <div className="text-cy-white text-sm font-medium">{cancha.nombre}</div>
                      <div className="text-cy-muted text-xs mt-0.5">{cancha.descripcion}</div>
                      <div className="text-cy-green-light text-xs font-medium mt-1">${cancha.precio.toLocaleString()}/h</div>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEditar(cancha)}
                      className="text-xs border border-cy-gray3 text-cy-muted px-3 py-1.5 rounded-lg hover:border-cy-green hover:text-cy-green-light transition-colors"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDesactivar(cancha.id)}
                      className="text-xs border border-red-800 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-950 transition-colors"
                    >
                      Desactivar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}