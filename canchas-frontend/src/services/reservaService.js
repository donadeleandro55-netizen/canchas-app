import api from './api'

export const crearReserva = (datos) => api.post('/reservas', datos)
export const misReservas = () => api.get('/reservas/mis-reservas')
export const cancelarReserva = (id) => api.put(`/reservas/${id}/cancelar`)
export const obtenerReserva = (id) => api.get(`/reservas/${id}`)

// Admin
export const todasReservas = () => api.get('/admin/reservas')
export const cancelarReservaAdmin = (id) => api.put(`/admin/reservas/${id}/cancelar`)
export const reservaManual = (datos) => api.post('/admin/reservas/manual', datos)
export const reportes = () => api.get('/admin/reportes')