import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const nombre = localStorage.getItem('nombre')
    const rol = localStorage.getItem('rol')
    if (token) {
      setUsuario({ token, nombre, rol })
    }
    setCargando(false)
  }, [])

  const guardarSesion = (datos) => {
    localStorage.setItem('token', datos.token)
    localStorage.setItem('nombre', datos.nombre)
    localStorage.setItem('rol', datos.rol)
    setUsuario(datos)
  }

  const cerrarSesion = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('nombre')
    localStorage.removeItem('rol')
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, guardarSesion, cerrarSesion, cargando }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)