import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import RecuperarPassword from './pages/RecuperarPassword'
import Home from './pages/Home'
import Reservar from './pages/Reservar'
import MisReservas from './pages/MisReservas'
import Dashboard from './pages/admin/Dashboard'
import Canchas from './pages/admin/Canchas'
import ReservaManual from './pages/admin/ReservaManual'
import Clientes from './pages/admin/Clientes'
import { RutaProtegida, RutaAdmin } from './components/RutaProtegida'
import Perfil from './pages/Perfil'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar-password" element={<RecuperarPassword />} />
      <Route path="/" element={<RutaProtegida><Home /></RutaProtegida>} />
      <Route path="/reservar/:id" element={<RutaProtegida><Reservar /></RutaProtegida>} />
      <Route path="/mis-reservas" element={<RutaProtegida><MisReservas /></RutaProtegida>} />
      <Route path="/admin" element={<RutaAdmin><Dashboard /></RutaAdmin>} />
      <Route path="/admin/canchas" element={<RutaAdmin><Canchas /></RutaAdmin>} />
      <Route path="/admin/reserva-manual" element={<RutaAdmin><ReservaManual /></RutaAdmin>} />
      <Route path="/admin/clientes" element={<RutaAdmin><Clientes /></RutaAdmin>} />
      <Route path="/perfil" element={<RutaProtegida><Perfil /></RutaProtegida>} />
    </Routes>
  )
}

export default App