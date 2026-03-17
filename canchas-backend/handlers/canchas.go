package handlers

import (
	"canchas-backend/config"
	"canchas-backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func ListarCanchas(c *gin.Context) {
	col := config.DB.Collection("canchas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := col.Find(ctx, bson.M{"activa": true})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener canchas"})
		return
	}

	var canchas []models.Cancha
	cursor.All(ctx, &canchas)
	c.JSON(http.StatusOK, canchas)
}

func EliminarCancha(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	col := config.DB.Collection("canchas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	col.UpdateOne(ctx, bson.M{"_id": id}, bson.M{"$set": bson.M{"activa": false}})
	c.JSON(http.StatusOK, gin.H{"mensaje": "Cancha desactivada"})
}

func ObtenerCancha(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	col := config.DB.Collection("canchas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cancha models.Cancha
	err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&cancha)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cancha no encontrada"})
		return
	}

	c.JSON(http.StatusOK, cancha)
}

func CrearCancha(c *gin.Context) {
	var cancha models.Cancha
	if err := c.ShouldBindJSON(&cancha); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if cancha.Nombre == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El nombre es obligatorio"})
		return
	}
	if cancha.Precio <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El precio debe ser mayor a 0"})
		return
	}

	cancha.ID = primitive.NewObjectID()
	cancha.Activa = true

	col := config.DB.Collection("canchas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err := col.InsertOne(ctx, cancha)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la cancha"})
		return
	}

	c.JSON(http.StatusCreated, cancha)
}

func EditarCancha(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	var body struct {
		Nombre      string  `json:"nombre"`
		Descripcion string  `json:"descripcion"`
		Precio      float64 `json:"precio"`
		Foto        string  `json:"foto"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if body.Nombre == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El nombre es obligatorio"})
		return
	}
	if body.Precio <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El precio debe ser mayor a 0"})
		return
	}

	col := config.DB.Collection("canchas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	_, err = col.UpdateOne(ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{
			"nombre":      body.Nombre,
			"descripcion": body.Descripcion,
			"precio":      body.Precio,
			"foto":        body.Foto,
		}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al editar la cancha"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Cancha actualizada correctamente"})
}

func ListarCanchasConDisponibilidad(c *gin.Context) {
	col := config.DB.Collection("canchas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := col.Find(ctx, bson.M{"activa": true})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener canchas"})
		return
	}

	var canchas []models.Cancha
	cursor.All(ctx, &canchas)

	hoy := time.Now().Truncate(24 * time.Hour)
	todosLosHorarios := []string{
		"08:00", "09:00", "10:00", "11:00", "12:00",
		"13:00", "14:00", "15:00", "16:00", "17:00",
		"18:00", "19:00", "20:00", "21:00", "22:00",
	}

	colReservas := config.DB.Collection("reservas")

	type CanchaConDisponibilidad struct {
		models.Cancha
		TurnosLibresHoy int `json:"turnos_libres_hoy"`
	}

	var resultado []CanchaConDisponibilidad
	for _, cancha := range canchas {
		cursor, _ := colReservas.Find(ctx, bson.M{
			"cancha_id": cancha.ID,
			"fecha":     hoy,
			"estado":    bson.M{"$ne": "cancelada"},
		})
		var reservasHoy []models.Reserva
		cursor.All(ctx, &reservasHoy)

		turnosLibres := len(todosLosHorarios) - len(reservasHoy)
		resultado = append(resultado, CanchaConDisponibilidad{
			Cancha:          cancha,
			TurnosLibresHoy: turnosLibres,
		})
	}

	c.JSON(http.StatusOK, resultado)
}
