package handlers

import (
	"canchas-backend/config"
	"canchas-backend/models"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func ListarUsuarios(c *gin.Context) {
	col := config.DB.Collection("usuarios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := col.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener usuarios"})
		return
	}

	var usuarios []models.Usuario
	cursor.All(ctx, &usuarios)
	c.JSON(http.StatusOK, usuarios)
}