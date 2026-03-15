import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    cerrarSesion()
    navigate('/login')
  }

  return (
    <nav className="bg-cy-black border-b border-cy-gray2 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cy-green rounded-lg flex items-center justify-center text-base">⚽</div>
          <span className="text-lg font-medium text-cy-white">
            Cancha<span className="text-cy-green-light">Ya</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          {usuario ? (
            <>
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
            </>
          ) : (
            <>
              <Link to="/login" className="text-cy-muted text-sm hover:text-cy-white transition-colors">
                Iniciar sesión
              </Link>
              <Link to="/registro" className="bg-cy-green text-white text-sm px-4 py-2 rounded-lg hover:bg-cy-green-dark transition-colors font-medium">
                Registrarse
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  )
}