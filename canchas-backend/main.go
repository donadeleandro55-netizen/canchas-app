package main

import (
	"canchas-backend/config"
	"canchas-backend/routes"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()
	config.ConectarDB()

	r := gin.Default()

	// CORS — permite que el frontend hable con el backend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	routes.Registrar(r)

	port := os.Getenv("PORT")
	fmt.Println("Servidor corriendo en http://localhost:" + port)
	r.Run(":" + port)
}