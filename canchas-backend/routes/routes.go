package routes

import (
	"canchas-backend/handlers"
	"canchas-backend/middleware"

	"github.com/gin-gonic/gin"
)

func Registrar(r *gin.Engine) {
	api := r.Group("/api")

	// Rutas públicas

	api.POST("/registro", handlers.Registrar)
	api.POST("/login", handlers.Login)
	api.GET("/canchas", handlers.ListarCanchas)
	api.GET("/canchas/:id/disponibilidad", handlers.ListarTurnosDisponibles)
	api.POST("/recuperar-password", handlers.RecuperarPassword)
	api.GET("/canchas/:id", handlers.ObtenerCancha)
	api.GET("/canchas/disponibilidad-hoy", handlers.ListarCanchasConDisponibilidad)

	// Rutas protegidas — cliente logueado
	protegidas := api.Group("/")
	protegidas.Use(middleware.VerificarToken)
	{
		protegidas.GET("/perfil", handlers.ObtenerPerfil)
		protegidas.POST("/reservas", handlers.CrearReserva)
		protegidas.GET("/reservas/mis-reservas", handlers.ListarReservasCliente)
		protegidas.PUT("/reservas/:id/cancelar", handlers.CancelarReserva)
		protegidas.GET("/reservas/:id", handlers.ObtenerReserva)
		protegidas.PUT("/perfil", handlers.EditarPerfil)
	}

	// Rutas solo admin
	soloAdmin := api.Group("/admin")
	soloAdmin.Use(middleware.VerificarToken, middleware.SoloAdmin)
	{
		soloAdmin.GET("/usuarios", handlers.ListarUsuarios)
soloAdmin.POST("/canchas", handlers.CrearCancha)
soloAdmin.PUT("/canchas/:id", handlers.EditarCancha)
soloAdmin.DELETE("/canchas/:id", handlers.EliminarCancha)
soloAdmin.GET("/reservas", handlers.ListarTodasReservas)
soloAdmin.PUT("/reservas/:id/cancelar", handlers.CancelarReservaAdmin)
soloAdmin.POST("/reservas/manual", handlers.ReservaManualAdmin)
soloAdmin.GET("/reportes", handlers.ReportesIngresos)
	}
}