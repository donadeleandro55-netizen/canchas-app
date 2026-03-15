import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { listarCanchas } from '../../services/canchaService'
import { reservaManual } from '../../services/reservaService'

export default function ReservaManual() {
  const navigate = useNavigate()
  const [canchas, setCanchas] = useState([])
  const [form, setForm] = useState({
    cliente_email: '',
    cancha_id: '',
    fecha: '',
    hora_inicio: '',
    hora_fin: '',
    pago: 'efectivo'
  })
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)
  const [guardando, setGuardando] = useState(false)

  const hoy = new Date().toISOString().split('T')[0]

  const horarios = [
    '08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00','22:00'
  ]

  const calcularHoraFin = (horaInicio) => {
    if (!horaInicio) return ''
    const [h, m] = horaInicio.split(':').map(Number)
    return `${(h + 1).toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    listarCanchas().then(res => setCanchas(res.data || []))
  }, [])

  useEffect(() => {
    if (form.hora_inicio) {
      setForm(f => ({ ...f, hora_fin: calcularHoraFin(f.hora_inicio) }))
    }
  }, [form.hora_inicio])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.cliente_email || !form.cancha_id || !form.fecha || !form.hora_inicio) {
      setError('Todos los campos son obligatorios')
      return
    }
    setGuardando(true)
    try {
      await reservaManual(form)
      setExito(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la reserva')
    } finally {
      setGuardando(false)
    }
  }

  if (exito) return (
    <div className="min-h-screen bg-cy-black flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-cy-white text-xl font-medium mb-2">Reserva manual creada</h2>
        <p className="text-cy-muted text-sm mb-6">La reserva fue registrada correctamente.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('/admin')} className="bg-cy-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-cy-green-dark transition-colors">
            Ver panel
          </button>
          <button onClick={() => { setExito(false); setForm({ cliente_email: '', cancha_id: '', fecha: '', hora_inicio: '', hora_fin: '', pago: 'efectivo' }) }} className="border border-cy-gray3 text-cy-muted px-6 py-2.5 rounded-lg text-sm hover:border-cy-white hover:text-cy-white transition-colors">
            Nueva reserva
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cy-black">
      <div className="bg-cy-gray border-b border-cy-gray2 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-cy-muted hover:text-cy-white text-sm transition-colors">
            ← Panel admin
          </button>
          <span className="text-cy-gray3">/</span>
          <span className="text-cy-white text-sm font-medium">Reserva manual</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-6">
          <h2 className="text-cy-white font-medium mb-6">Nueva reserva manual</h2>

          {error && <div className="bg-red-950 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-cy-muted text-sm block mb-1">Email del cliente</label>
              <input
                type="email"
                value={form.cliente_email}
                onChange={(e) => setForm({ ...form, cliente_email: e.target.value })}
                placeholder="cliente@email.com"
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              />
            </div>

            <div>
              <label className="text-cy-muted text-sm block mb-1">Cancha</label>
              <select
                value={form.cancha_id}
                onChange={(e) => setForm({ ...form, cancha_id: e.target.value })}
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              >
                <option value="">Seleccioná una cancha</option>
                {canchas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre} — ${c.precio.toLocaleString()}/h</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-cy-muted text-sm block mb-1">Fecha</label>
                <input
                  type="date"
                  min={hoy}
                  value={form.fecha}
                  onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                  className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
                />
              </div>
              <div>
                <label className="text-cy-muted text-sm block mb-1">Hora inicio</label>
                <select
                  value={form.hora_inicio}
                  onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })}
                  className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
                >
                  <option value="">Seleccioná</option>
                  {horarios.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-cy-muted text-sm block mb-1">Forma de pago</label>
              <select
                value={form.pago}
                onChange={(e) => setForm({ ...form, pago: e.target.value })}
                className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
              >
                <option value="efectivo">Efectivo</option>
                <option value="simulado">Pago digital simulado</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={guardando}
              className="w-full bg-cy-green hover:bg-cy-green-dark text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {guardando ? 'Creando reserva...' : 'Crear reserva manual'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}