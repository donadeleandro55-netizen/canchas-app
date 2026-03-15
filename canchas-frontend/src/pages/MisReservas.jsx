import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { misReservas, cancelarReserva } from '../services/reservaService'

export default function MisReservas() {
  const [reservas, setReservas] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cancelando, setCancelando] = useState(null)
  const navigate = useNavigate()

  const cargarReservas = () => {
    misReservas()
      .then(res => setReservas(res.data || []))
      .catch(() => setReservas([]))
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargarReservas() }, [])

  const handleCancelar = async (id) => {
    if (!confirm('¿Estás seguro que querés cancelar esta reserva?')) return
    setCancelando(id)
    try {
      await cancelarReserva(id)
      cargarReservas()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar')
    } finally {
      setCancelando(null)
    }
  }

  const proximas = reservas.filter(r => r.estado === 'confirmada')
  const pasadas = reservas.filter(r => r.estado === 'cancelada')

  const formatFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-AR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  }

  const ReservaCard = ({ reserva, mostrarCancelar }) => (
    <div className={`bg-cy-gray border rounded-xl p-5 ${
      reserva.estado === 'cancelada' ? 'border-cy-gray2 opacity-60' : 'border-cy-gray2 hover:border-cy-green transition-colors'
    }`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 bg-green-950 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
            🏟️
          </div>
          <div>
            <h3 className="text-cy-white font-medium text-sm">{reserva.nombre_cancha}</h3>
            <p className="text-cy-muted text-xs mt-1 capitalize">{formatFecha(reserva.fecha)}</p>
            <p className="text-cy-muted text-xs">{reserva.hora_inicio} - {reserva.hora_fin}hs</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            reserva.estado === 'confirmada'
              ? 'bg-green-950 text-green-400'
              : 'bg-red-950 text-red-400'
          }`}>
            {reserva.estado === 'confirmada' ? '✓ Confirmada' : '✗ Cancelada'}
          </span>
          {mostrarCancelar && reserva.estado === 'confirmada' && (
            <button
              onClick={() => handleCancelar(reserva.id)}
              disabled={cancelando === reserva.id}
              className="text-xs border border-red-800 text-red-400 px-3 py-1 rounded-lg hover:bg-red-950 transition-colors disabled:opacity-50"
            >
              {cancelando === reserva.id ? 'Cancelando...' : 'Cancelar'}
            </button>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cy-black">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-cy-white text-xl font-medium">Mis reservas</h1>
          <button
            onClick={() => navigate('/')}
            className="bg-cy-green text-white text-sm px-4 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium"
          >
            + Nueva reserva
          </button>
        </div>

        {cargando ? (
          <div className="text-cy-muted text-sm text-center py-20">Cargando reservas...</div>
        ) : reservas.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📅</div>
            <p className="text-cy-white font-medium mb-2">No tenés reservas todavía</p>
            <p className="text-cy-muted text-sm mb-6">Reservá tu primera cancha ahora</p>
            <button
              onClick={() => navigate('/')}
              className="bg-cy-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-cy-green-dark transition-colors"
            >
              Ver canchas disponibles
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {proximas.length > 0 && (
              <div>
                <h2 className="text-cy-muted text-xs font-medium uppercase tracking-wider mb-4">
                  Próximas ({proximas.length})
                </h2>
                <div className="space-y-3">
                  {proximas.map(r => <ReservaCard key={r.id} reserva={r} mostrarCancelar={true} />)}
                </div>
              </div>
            )}
            {pasadas.length > 0 && (
              <div>
                <h2 className="text-cy-muted text-xs font-medium uppercase tracking-wider mb-4">
                  Canceladas ({pasadas.length})
                </h2>
                <div className="space-y-3">
                  {pasadas.map(r => <ReservaCard key={r.id} reserva={r} mostrarCancelar={false} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}