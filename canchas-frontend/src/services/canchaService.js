import api from './api'

export const listarCanchas = () => api.get('/canchas')
export const listarCanchasConDisponibilidad = () => api.get('/canchas/disponibilidad-hoy')
export const obtenerCancha = (id) => api.get(`/canchas/${id}`)
export const obtenerDisponibilidad = (id, fecha) => api.get(`/canchas/${id}/disponibilidad?fecha=${fecha}`)