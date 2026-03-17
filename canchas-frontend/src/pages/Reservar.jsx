import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { obtenerCancha, obtenerDisponibilidad } from '../services/canchaService'
import { crearReserva } from '../services/reservaService'

export default function Reservar() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [cancha, setCancha] = useState(null)
  const [fecha, setFecha] = useState('')
  const [disponibles, setDisponibles] = useState([])
  const [ocupados, setOcupados] = useState([])
  const [horaSeleccionada, setHoraSeleccionada] = useState('')
  const [cargandoHorarios, setCargandoHorarios] = useState(false)
  const [cargandoReserva, setCargandoReserva] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const todosLosHorarios = [
    '08:00','09:00','10:00','11:00','12:00',
    '13:00','14:00','15:00','16:00','17:00',
    '18:00','19:00','20:00','21:00','22:00'
  ]

  // Fecha mínima = hoy
  const hoy = new Date().toISOString().split('T')[0]

  useEffect(() => {
    obtenerCancha(id)
      .then(res => setCancha(res.data))
      .catch(() => navigate('/'))
  }, [id])

  useEffect(() => {
    if (!fecha) return
    setCargandoHorarios(true)
    setHoraSeleccionada('')
    obtenerDisponibilidad(id, fecha)
      .then(res => {
        setDisponibles(res.data.disponibles || [])
        // Calcular ocupados
        const ocup = todosLosHorarios.filter(h => !(res.data.disponibles || []).includes(h))
        setOcupados(ocup)
      })
      .catch(() => setError('Error al cargar horarios'))
      .finally(() => setCargandoHorarios(false))
  }, [fecha])

  const calcularHoraFin = (horaInicio) => {
    const [h, m] = horaInicio.split(':').map(Number)
    const fin = h + 1
    return `${fin.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const handleReservar = async () => {
    if (!horaSeleccionada) return
    setError('')
    setCargandoReserva(true)
    try {
      await crearReserva({
        cancha_id: id,
        fecha,
        hora_inicio: horaSeleccionada,
        hora_fin: calcularHoraFin(horaSeleccionada)
      })
      setExito(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la reserva')
    } finally {
      setCargandoReserva(false)
    }
  }

  if (!cancha) return (
    <div className="min-h-screen bg-cy-black flex items-center justify-center text-cy-muted text-sm">
      Cargando...
    </div>
  )

  if (exito) return (
    <div className="min-h-screen bg-cy-black">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-6">⚽</div>
        <h2 className="text-cy-white text-2xl font-medium mb-3">¡Reserva confirmada!</h2>
        <p className="text-cy-muted text-sm mb-2">Te enviamos un email con los detalles.</p>
        <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-5 my-6 text-left space-y-2">
          <div className="flex justify-between">
            <span className="text-cy-muted text-sm">Cancha</span>
            <span className="text-cy-white text-sm font-medium">{cancha.nombre}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cy-muted text-sm">Fecha</span>
            <span className="text-cy-white text-sm font-medium">{fecha}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cy-muted text-sm">Horario</span>
            <span className="text-cy-white text-sm font-medium">{horaSeleccionada} - {calcularHoraFin(horaSeleccionada)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cy-muted text-sm">Precio</span>
            <span className="text-cy-green-light text-sm font-medium">${cancha.precio.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cy-muted text-sm">Pago</span>
            <span className="text-green-400 text-sm font-medium">Simulado ✅</span>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate('/mis-reservas')}
            className="bg-cy-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-cy-green-dark transition-colors"
          >
            Ver mis reservas
          </button>
          <button
            onClick={() => navigate('/')}
            className="border border-cy-gray3 text-cy-muted px-6 py-2.5 rounded-lg text-sm hover:border-cy-white hover:text-cy-white transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-cy-black">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">

        {/* Header cancha */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => navigate('/')} className="text-cy-muted hover:text-cy-white text-sm transition-colors">
            ← Volver
          </button>
          <span className="text-cy-gray3">/</span>
          <span className="text-cy-white text-sm font-medium">{cancha.nombre}</span>
        </div>

        <div className="bg-cy-gray border border-cy-gray2 rounded-xl overflow-hidden mb-6">
         {cancha.foto ? (
  <img src={cancha.foto} alt={cancha.nombre} className="h-32 w-full object-cover" />
) : (
  <div className="h-32 bg-gradient-to-br from-green-950 to-green-900 flex items-center justify-center text-5xl">
    🏟️
  </div>
)}
          <div className="p-5 flex justify-between items-center">
            <div>
              <h2 className="text-cy-white font-medium">{cancha.nombre}</h2>
              <p className="text-cy-muted text-sm mt-1">{cancha.descripcion}</p>
            </div>
            <span className="text-cy-green-light font-medium">${cancha.precio.toLocaleString()}/h</span>
          </div>
        </div>

        {/* Selector de fecha */}
        <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-5 mb-4">
          <label className="text-cy-white text-sm font-medium block mb-3">Elegí una fecha</label>
          <input
            type="date"
            min={hoy}
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full bg-cy-gray2 border border-cy-gray3 text-cy-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors"
          />
        </div>

        {/* Horarios */}
        {fecha && (
          <div className="bg-cy-gray border border-cy-gray2 rounded-xl p-5 mb-4">
            <h3 className="text-cy-white text-sm font-medium mb-4">
              Horarios disponibles — {fecha}
            </h3>

            {cargandoHorarios ? (
              <p className="text-cy-muted text-sm">Cargando horarios...</p>
            ) : (
              <>
                <div className="flex flex-wrap gap-2 mb-4">
                  {todosLosHorarios.map(hora => {
                    const libre = disponibles.includes(hora)
                    const seleccionado = horaSeleccionada === hora
                    return (
                      <button
                        key={hora}
                        disabled={!libre}
                        onClick={() => libre && setHoraSeleccionada(hora)}
                        className={`px-4 py-2 rounded-lg text-xs font-medium border transition-colors ${
                          seleccionado
                            ? 'bg-cy-green border-cy-green text-white'
                            : libre
                            ? 'bg-transparent border-cy-green text-cy-green-light hover:bg-cy-green hover:text-white'
                            : 'bg-cy-gray2 border-cy-gray3 text-cy-gray3 cursor-not-allowed'
                        }`}
                      >
                        {hora}
                      </button>
                    )
                  })}
                </div>

                <div className="flex gap-4 text-xs text-cy-muted">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded border border-cy-green inline-block"></span> Disponible
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-cy-green inline-block"></span> Seleccionado
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded bg-cy-gray2 border border-cy-gray3 inline-block"></span> Ocupado
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Resumen y confirmar */}
        {horaSeleccionada && (
          <div className="bg-cy-gray border border-cy-green rounded-xl p-5">
            <h3 className="text-cy-white text-sm font-medium mb-4">Resumen de tu reserva</h3>
            <div className="space-y-2 mb-5">
              <div className="flex justify-between">
                <span className="text-cy-muted text-sm">Cancha</span>
                <span className="text-cy-white text-sm">{cancha.nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cy-muted text-sm">Fecha</span>
                <span className="text-cy-white text-sm">{fecha}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-cy-muted text-sm">Horario</span>
                <span className="text-cy-white text-sm">{horaSeleccionada} - {calcularHoraFin(horaSeleccionada)}</span>
              </div>
              <div className="flex justify-between border-t border-cy-gray2 pt-2 mt-2">
                <span className="text-cy-muted text-sm">Total</span>
                <span className="text-cy-green-light font-medium">${cancha.precio.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 text-xs px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <button
              onClick={handleReservar}
              disabled={cargandoReserva}
              className="w-full bg-cy-green hover:bg-cy-green-dark text-white font-medium py-3 rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {cargandoReserva ? 'Procesando...' : '✅ Confirmar y pagar (simulado)'}
            </button>
          </div>
        )}

      </div>
    </div>
  )
}