import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()
  const [menuAbierto, setMenuAbierto] = useState(false)

  const handleLogout = () => {
    cerrarSesion()
    navigate('/login')
    setMenuAbierto(false)
  }

  return (
    <nav className="bg-cy-black border-b border-cy-gray2 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cy-green rounded-lg flex items-center justify-center text-base">⚽</div>
          <span className="text-lg font-medium text-cy-white">
            Cancha<span className="text-cy-green-light">Ya</span>
          </span>
        </Link>

        {/* Desktop links */}
        {usuario && (
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-cy-muted text-sm hover:text-cy-white transition-colors">
              Canchas
            </Link>
            <Link to="/mis-reservas" className="text-cy-muted text-sm hover:text-cy-white transition-colors">
              Mis reservas
            </Link>
            <Link to="/perfil" className="flex items-center gap-2 group">
              <div className="w-7 h-7 bg-cy-green rounded-full flex items-center justify-center text-white text-xs font-medium group-hover:bg-cy-green-dark transition-colors">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="text-cy-muted text-sm group-hover:text-cy-white transition-colors">
                {usuario.nombre}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-cy-muted text-sm border border-cy-gray3 px-3 py-1.5 rounded-lg hover:border-red-800 hover:text-red-400 transition-colors"
            >
              Salir
            </button>
          </div>
        )}

        {/* Sin sesión desktop */}
        {!usuario && (
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-cy-muted text-sm hover:text-cy-white transition-colors">
              Iniciar sesión
            </Link>
            <Link to="/registro" className="bg-cy-green text-white text-sm px-4 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium">
              Registrarse
            </Link>
          </div>
        )}

        {/* Botón hamburguesa mobile */}
        <button
          onClick={() => setMenuAbierto(!menuAbierto)}
          className="md:hidden text-cy-muted hover:text-cy-white transition-colors p-1"
        >
          {menuAbierto ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

      </div>

      {/* Menú mobile */}
      {menuAbierto && (
        <div className="md:hidden mt-4 border-t border-cy-gray2 pt-4 space-y-3">
          {usuario ? (
            <>
              <div className="flex items-center gap-3 px-1 pb-2 border-b border-cy-gray2">
                <div className="w-8 h-8 bg-cy-green rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {usuario.nombre.charAt(0).toUpperCase()}
                </div>
                <span className="text-cy-white text-sm font-medium">{usuario.nombre}</span>
              </div>
              <Link to="/" onClick={() => setMenuAbierto(false)} className="block text-cy-muted text-sm hover:text-cy-white transition-colors py-1">
                ⚽ Canchas
              </Link>
              <Link to="/mis-reservas" onClick={() => setMenuAbierto(false)} className="block text-cy-muted text-sm hover:text-cy-white transition-colors py-1">
                📅 Mis reservas
              </Link>
              <Link to="/perfil" onClick={() => setMenuAbierto(false)} className="block text-cy-muted text-sm hover:text-cy-white transition-colors py-1">
                👤 Mi perfil
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left text-red-400 text-sm py-1 hover:text-red-300 transition-colors"
              >
                🚪 Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuAbierto(false)} className="block text-cy-muted text-sm hover:text-cy-white transition-colors py-1">
                Iniciar sesión
              </Link>
              <Link to="/registro" onClick={() => setMenuAbierto(false)} className="block bg-cy-green text-white text-sm px-4 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium text-center">
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  )
}