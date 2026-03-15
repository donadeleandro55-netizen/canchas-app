import api from './api'

export const registrar = (datos) => api.post('/registro', datos)
export const login = (datos) => api.post('/login', datos)
export const recuperarPassword = (datos) => api.post('/recuperar-password', datos)
export const editarPerfil = (datos) => api.put('/perfil', datos)