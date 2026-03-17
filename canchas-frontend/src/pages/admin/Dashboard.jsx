import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { todasReservas, cancelarReservaAdmin, reportes } from '../../services/reservaService'

export default function Dashboard() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('reservas')
  const [reservas, setReservas] = useState([])
  const [stats, setStats] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [cancelando, setCancelando] = useState(null)

  const cargarDatos = () => {
    setCargando(true)
    Promise.all([todasReservas(), reportes()])
      .then(([resReservas, resStats]) => {
        setReservas(resReservas.data || [])
        setStats(resStats.data)
      })
      .catch(console.error)
      .finally(() => setCargando(false))
  }

  useEffect(() => { cargarDatos() }, [])

  const handleCancelar = async (id) => {
    if (!confirm('¿Cancelar esta reserva? Se notificará al cliente.')) return
    setCancelando(id)
    try {
      await cancelarReservaAdmin(id)
      cargarDatos()
    } catch (err) {
      alert(err.response?.data?.error || 'Error al cancelar')
    } finally {
      setCancelando(null)
    }
  }

  const handleLogout = () => {
    cerrarSesion()
    navigate('/login')
  }

  const formatFecha = (fecha) => new Date(fecha).toLocaleDateString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  })

  const confirmadas = reservas.filter(r => r.estado === 'confirmada')
  const canceladas = reservas.filter(r => r.estado === 'cancelada')

  return (
    <div className="min-h-screen bg-cy-black">

      {/* Header admin */}
      <div className="bg-cy-gray border-b border-cy-gray2 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-cy-green rounded-lg flex items-center justify-center text-base">⚽</div>
            <span className="text-lg font-medium text-cy-white">
              Cancha<span className="text-cy-green-light">Ya</span>
            </span>
            <span className="bg-cy-green text-white text-xs font-medium px-2 py-0.5 rounded-full">ADMIN</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-cy-muted text-sm hidden sm:inline">Hola, <span className="text-cy-white">{usuario?.nombre}</span></span>
            <button
              onClick={handleLogout}
              className="text-cy-muted text-sm border border-cy-gray3 px-3 py-1.5 rounded-lg hover:border-red-800 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-4">
              <div className="text-2xl font-medium text-cy-white">{stats.total_reservas}</div>
              <div className="text-cy-muted text-xs mt-1">Reservas totales</div>
            </div>
            <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-4">
              <div className="text-xl font-medium text-cy-green-light">${stats.ingresos_totales?.toLocaleString()}</div>
              <div className="text-cy-muted text-xs mt-1">Ingresos totales</div>
            </div>
            <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-4">
              <div className="text-2xl font-medium text-cy-white">{confirmadas.length}</div>
              <div className="text-cy-muted text-xs mt-1">Confirmadas</div>
            </div>
            <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-4">
              <div className="text-2xl font-medium text-cy-white">{canceladas.length}</div>
              <div className="text-cy-muted text-xs mt-1">Canceladas</div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-cy-gray2 mb-6 overflow-x-auto">
          {['reservas', 'canchas', 'clientes'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-3 text-sm border-b-2 transition-colors whitespace-nowrap ${
                tab === t
                  ? 'border-cy-green text-cy-green-light font-medium'
                  : 'border-transparent text-cy-muted hover:text-cy-white'
              }`}
            >
              {t === 'reservas' ? '📅 Reservas' : t === 'canchas' ? '🏟️ Canchas' : '👥 Clientes'}
            </button>
          ))}
        </div>

        {/* Tab Reservas */}
        {tab === 'reservas' && (
          <div>
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-cy-white font-medium">Todas las reservas</h2>
              <button
                onClick={() => navigate('/admin/reserva-manual')}
                className="bg-cy-green text-white text-xs px-3 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium whitespace-nowrap"
              >
                + Reserva manual
              </button>
            </div>
            {cargando ? (
              <p className="text-cy-muted text-sm">Cargando...</p>
            ) : reservas.length === 0 ? (
              <p className="text-cy-muted text-sm text-center py-10">No hay reservas todavía</p>
            ) : (
              <div className="space-y-3">
                {reservas.map(r => (
                  <div key={r.id} className="bg-cy-gray border border-cy-gray2 rounded-xl p-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-9 h-9 bg-green-950 rounded-lg flex items-center justify-center text-lg flex-shrink-0">
                        🏟️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-cy-white text-sm font-medium truncate">{r.nombre_cliente}</div>
                        <div className="text-cy-muted text-xs mt-0.5 truncate">{r.email_cliente}</div>
                        <div className="text-cy-muted text-xs mt-0.5">{r.nombre_cancha}</div>
                        <div className="text-cy-muted text-xs">{formatFecha(r.fecha)} · {r.hora_inicio} - {r.hora_fin}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-cy-gray2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        r.estado === 'confirmada'
                          ? 'bg-green-950 text-green-400'
                          : 'bg-red-950 text-red-400'
                      }`}>
                        {r.estado === 'confirmada' ? '✓ Confirmada' : '✗ Cancelada'}
                      </span>
                      {r.estado === 'confirmada' && (
                        <button
                          onClick={() => handleCancelar(r.id)}
                          disabled={cancelando === r.id}
                          className="text-xs border border-red-800 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-950 transition-colors disabled:opacity-50"
                        >
                          {cancelando === r.id ? 'Cancelando...' : 'Cancelar'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Canchas */}
        {tab === 'canchas' && (
          <div>
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-cy-white font-medium">Gestión de canchas</h2>
              <button
                onClick={() => navigate('/admin/canchas')}
                className="bg-cy-green text-white text-xs px-3 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium whitespace-nowrap"
              >
                + Nueva cancha
              </button>
            </div>
            <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-8 text-center">
              <p className="text-cy-muted text-sm">Hacé clic en "Nueva cancha" para gestionar las canchas</p>
            </div>
          </div>
        )}

        {/* Tab Clientes */}
        {tab === 'clientes' && (
          <div>
            <div className="flex justify-between items-center mb-4 gap-3">
              <h2 className="text-cy-white font-medium">Clientes registrados</h2>
              <button
                onClick={() => navigate('/admin/clientes')}
                className="bg-cy-green text-white text-xs px-3 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium whitespace-nowrap"
              >
                Ver todos
              </button>
            </div>
            <div className="space-y-3">
              {reservas
                .filter((r, i, self) => self.findIndex(x => x.email_cliente === r.email_cliente) === i)
                .slice(0, 5)
                .map(r => (
                  <div key={r.cliente_id} className="bg-cy-gray border border-cy-gray2 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-9 h-9 bg-cy-gray2 rounded-full flex items-center justify-center text-cy-green-light font-medium text-sm flex-shrink-0">
                      {r.nombre_cliente.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-cy-white text-sm font-medium truncate">{r.nombre_cliente}</div>
                      <div className="text-cy-muted text-xs truncate">{r.email_cliente}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}