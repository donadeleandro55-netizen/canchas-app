import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'

export default function Clientes() {
  const navigate = useNavigate()
  const [clientes, setClientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    api.get('/admin/usuarios')
      .then(res => setClientes(res.data || []))
      .finally(() => setCargando(false))
  }, [])

  const filtrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.email.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-cy-black">
      <div className="bg-cy-gray border-b border-cy-gray2 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/admin')} className="text-cy-muted hover:text-cy-white text-sm transition-colors">
            ← Panel admin
          </button>
          <span className="text-cy-gray3">/</span>
          <span className="text-cy-white text-sm font-medium">Clientes</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-cy-white font-medium text-lg">Clientes registrados</h1>
          <span className="text-cy-muted text-sm">{clientes.length} en total</span>
        </div>

        {/* Buscador */}
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por nombre o email..."
          className="w-full bg-cy-gray border border-cy-gray2 text-cy-white placeholder-cy-muted rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-cy-green transition-colors mb-6"
        />

        {cargando ? (
          <p className="text-cy-muted text-sm text-center py-10">Cargando clientes...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-cy-muted text-sm text-center py-10">No se encontraron clientes</p>
        ) : (
          <div className="space-y-3">
            {filtrados.map(cliente => (
              <div key={cliente.id} className="bg-cy-gray border border-cy-gray2 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cy-gray2 rounded-full flex items-center justify-center text-cy-green-light font-medium text-sm flex-shrink-0">
                    {cliente.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-cy-white text-sm font-medium">{cliente.nombre}</div>
                    <div className="text-cy-muted text-xs mt-0.5">{cliente.email}</div>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${
                  cliente.rol === 'admin'
                    ? 'bg-cy-green text-white'
                    : 'bg-cy-gray2 text-cy-muted'
                }`}>
                  {cliente.rol}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}