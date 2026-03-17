import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { listarCanchasConDisponibilidad } from '../services/canchaService'

export default function Home() {
  const [canchas, setCanchas] = useState([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    listarCanchasConDisponibilidad()
      .then(res => setCanchas(res.data))
      .catch(err => console.error(err))
      .finally(() => setCargando(false))
  }, [])

  return (
    <div className="min-h-screen bg-cy-black">
      <Navbar />

      {/* Hero */}
      <div className="border-b border-cy-gray2 py-16 px-6 text-center">
        <div className="inline-block bg-cy-gray2 text-cy-green-light text-xs font-medium px-3 py-1 rounded-full border border-cy-gray3 mb-4">
          ⚽ Reservas online 24/7
        </div>
        <h1 className="text-4xl font-medium text-cy-white mb-3">
          Tu cancha favorita,<br />
          <span className="text-cy-green-light">cuando vos querés</span>
        </h1>
        <p className="text-cy-muted text-sm max-w-md mx-auto">
          Elegí el horario, reservá en segundos y jugá sin preocupaciones.
        </p>
      </div>

      {/* Canchas */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-cy-white font-medium text-lg mb-6">Nuestras canchas</h2>

        {cargando ? (
          <div className="text-cy-muted text-sm text-center py-20">Cargando canchas...</div>
        ) : canchas.length === 0 ? (
          <div className="text-cy-muted text-sm text-center py-20">No hay canchas disponibles por el momento.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {canchas.map(cancha => (
              <div
                key={cancha.id}
                className="bg-cy-gray border border-cy-gray2 rounded-xl overflow-hidden hover:border-cy-green transition-colors group"
              >
                {/* Foto o placeholder */}
                {cancha.foto ? (
                  <img
                    src={cancha.foto}
                    alt={cancha.nombre}
                    className="h-36 w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className="h-36 bg-gradient-to-br from-green-950 to-green-900 items-center justify-center text-5xl"
                  style={{ display: cancha.foto ? 'none' : 'flex' }}
                >
                  🏟️
                </div>

                <div className="p-4">
                  <h3 className="text-cy-white font-medium text-sm mb-1">{cancha.nombre}</h3>
                  <p className="text-cy-muted text-xs mb-3">{cancha.descripcion}</p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-cy-green-light font-medium text-sm">${cancha.precio.toLocaleString()}/h</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      cancha.turnos_libres_hoy > 5
                        ? 'bg-green-950 text-green-400'
                        : cancha.turnos_libres_hoy > 0
                        ? 'bg-yellow-950 text-yellow-400'
                        : 'bg-red-950 text-red-400'
                    }`}>
                      {cancha.turnos_libres_hoy > 0
                        ? `${cancha.turnos_libres_hoy} turnos libres hoy`
                        : 'Sin turnos hoy'}
                    </span>
                  </div>

                  <button
                    onClick={() => navigate(`/reservar/${cancha.id}`)}
                    className="w-full bg-cy-green hover:bg-cy-green-dark text-white text-sm font-medium py-2.5 rounded-lg transition-colors"
                  >
                    Ver horarios y reservar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}