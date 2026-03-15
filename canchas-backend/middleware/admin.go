package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func SoloAdmin(c *gin.Context) {
	rol, _ := c.Get("rol")
	if rol != "admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Acceso solo para administradores"})
		c.Abort()
		return
	}
	c.Next()
}