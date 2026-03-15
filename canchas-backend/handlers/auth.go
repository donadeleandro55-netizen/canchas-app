package handlers

import (
	"canchas-backend/config"
	"canchas-backend/models"
	"canchas-backend/utils"
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"golang.org/x/crypto/bcrypt"
)


func ObtenerPerfil(c *gin.Context) {
	id, _ := c.Get("id")
	rol, _ := c.Get("rol")
	c.JSON(http.StatusOK, gin.H{
		"id":  id,
		"rol": rol,
	})
}





func Registrar(c *gin.Context) {
	var body struct {
		Nombre   string `json:"nombre"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// Validaciones
	if body.Nombre == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El nombre es obligatorio"})
		return
	}
	if body.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El email es obligatorio"})
		return
	}
	if len(body.Password) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La contraseña debe tener al menos 6 caracteres"})
		return
	}

	col := config.DB.Collection("usuarios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existente models.Usuario
	err := col.FindOne(ctx, bson.M{"email": body.Email}).Decode(&existente)
	if err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El email ya está registrado"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la contraseña"})
		return
	}

	usuario := models.Usuario{
		ID:       primitive.NewObjectID(),
		Nombre:   body.Nombre,
		Email:    body.Email,
		Password: string(hash),
		Rol:      "cliente",
	}

	_, err = col.InsertOne(ctx, usuario)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear el usuario"})
		return
	}

	token, _ := utils.GenerarToken(usuario.ID.Hex(), usuario.Rol)
	c.JSON(http.StatusCreated, gin.H{
		"token":  token,
		"nombre": usuario.Nombre,
		"rol":    usuario.Rol,
	})
}

func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if body.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El email es obligatorio"})
		return
	}
	if body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La contraseña es obligatoria"})
		return
	}

	col := config.DB.Collection("usuarios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var usuario models.Usuario
	err := col.FindOne(ctx, bson.M{"email": body.Email}).Decode(&usuario)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email o contraseña incorrectos"})
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(usuario.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email o contraseña incorrectos"})
		return
	}

	token, _ := utils.GenerarToken(usuario.ID.Hex(), usuario.Rol)
	c.JSON(http.StatusOK, gin.H{
		"token":  token,
		"nombre": usuario.Nombre,
		"rol":    usuario.Rol,
	})
}

func RecuperarPassword(c *gin.Context) {
	var body struct {
		Email         string `json:"email"`
		NuevoPassword string `json:"nuevo_password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if body.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El email es obligatorio"})
		return
	}
	if len(body.NuevoPassword) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La contraseña debe tener al menos 6 caracteres"})
		return
	}

	col := config.DB.Collection("usuarios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var usuario models.Usuario
	err := col.FindOne(ctx, bson.M{"email": body.Email}).Decode(&usuario)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No existe una cuenta con ese email"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.NuevoPassword), 10)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la contraseña"})
		return
	}

	_, err = col.UpdateOne(ctx,
		bson.M{"email": body.Email},
		bson.M{"$set": bson.M{"password": string(hash)}},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar la contraseña"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Contraseña actualizada correctamente"})
}


func EditarPerfil(c *gin.Context) {
	clienteID, _ := c.Get("id")
	clienteOID, _ := primitive.ObjectIDFromHex(clienteID.(string))

	var body struct {
		Nombre   string `json:"nombre"`
		Password string `json:"nuevo_password"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if body.Nombre == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "El nombre es obligatorio"})
		return
	}

	col := config.DB.Collection("usuarios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	update := bson.M{"nombre": body.Nombre}

	// Solo actualiza password si mandaron uno nuevo
	if body.Password != "" {
		if len(body.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "La contraseña debe tener al menos 6 caracteres"})
			return
		}
		hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al procesar la contraseña"})
			return
		}
		update["password"] = string(hash)
	}

	_, err := col.UpdateOne(ctx,
		bson.M{"_id": clienteOID},
		bson.M{"$set": update},
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al actualizar el perfil"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"mensaje": "Perfil actualizado correctamente"})
}