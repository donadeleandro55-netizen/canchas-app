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
	"canchas-backend/utils"
)

func CrearReserva(c *gin.Context) {
	var body struct {
		CanchaID   string `json:"cancha_id"`
		Fecha      string `json:"fecha"`
		HoraInicio string `json:"hora_inicio"`
		HoraFin    string `json:"hora_fin"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	if body.CanchaID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La cancha es obligatoria"})
		return
	}
	if body.Fecha == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La fecha es obligatoria"})
		return
	}
	if body.HoraInicio == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La hora de inicio es obligatoria"})
		return
	}
	if body.HoraFin == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "La hora de fin es obligatoria"})
		return
	}

	clienteID, _ := c.Get("id")
	canchaID, err := primitive.ObjectIDFromHex(body.CanchaID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de cancha inválido"})
		return
	}

	clienteOID, _ := primitive.ObjectIDFromHex(clienteID.(string))
	fecha, err := time.Parse("2006-01-02", body.Fecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de fecha inválido, usá YYYY-MM-DD"})
		return
	}

	if fecha.Before(time.Now().Truncate(24 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No podés reservar en una fecha pasada"})
		return
	}

	colReservas := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var existente models.Reserva
	err = colReservas.FindOne(ctx, bson.M{
		"cancha_id":   canchaID,
		"fecha":       fecha,
		"hora_inicio": body.HoraInicio,
		"estado":      bson.M{"$ne": "cancelada"},
	}).Decode(&existente)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Ese turno ya está reservado"})
		return
	}

	reserva := models.Reserva{
		ID:         primitive.NewObjectID(),
		ClienteID:  clienteOID,
		CanchaID:   canchaID,
		Fecha:      fecha,
		HoraInicio: body.HoraInicio,
		HoraFin:    body.HoraFin,
		Estado:     "confirmada",
		Pago:       "simulado",
	}

	_, err = colReservas.InsertOne(ctx, reserva)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la reserva"})
		return
	}

	// Traer datos del cliente y cancha para el email
	colUsuarios := config.DB.Collection("usuarios")
	colCanchas := config.DB.Collection("canchas")

	var cliente models.Usuario
	var cancha models.Cancha
	colUsuarios.FindOne(ctx, bson.M{"_id": clienteOID}).Decode(&cliente)
	colCanchas.FindOne(ctx, bson.M{"_id": canchaID}).Decode(&cancha)

	// Enviar email en segundo plano para no demorar la respuesta
	go utils.EnviarEmailConfirmacionReserva(
		cliente.Email,
		cliente.Nombre,
		cancha.Nombre,
		body.Fecha,
		body.HoraInicio,
		body.HoraFin,
	)

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Reserva confirmada ⚽",
		"reserva": reserva,
	})
}

func ListarReservasCliente(c *gin.Context) {
	clienteID, _ := c.Get("id")
	clienteOID, _ := primitive.ObjectIDFromHex(clienteID.(string))

	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := col.Find(ctx, bson.M{"cliente_id": clienteOID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener reservas"})
		return
	}

	var reservas []models.Reserva
	cursor.All(ctx, &reservas)

	// Agregar nombre de cancha a cada reserva
	colCanchas := config.DB.Collection("canchas")
	type ReservaDetalle struct {
		models.Reserva
		NombreCancha string `json:"nombre_cancha"`
	}

	var resultado []ReservaDetalle
	for _, r := range reservas {
		var cancha models.Cancha
		colCanchas.FindOne(ctx, bson.M{"_id": r.CanchaID}).Decode(&cancha)
		resultado = append(resultado, ReservaDetalle{
			Reserva:      r,
			NombreCancha: cancha.Nombre,
		})
	}

	c.JSON(http.StatusOK, resultado)
}
func CancelarReserva(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	clienteID, _ := c.Get("id")
	clienteOID, _ := primitive.ObjectIDFromHex(clienteID.(string))

	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var reserva models.Reserva
	err = col.FindOne(ctx, bson.M{"_id": id, "cliente_id": clienteOID}).Decode(&reserva)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reserva no encontrada"})
		return
	}

	result, err := col.UpdateOne(ctx,
		bson.M{"_id": id, "cliente_id": clienteOID},
		bson.M{"$set": bson.M{"estado": "cancelada"}},
	)

	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reserva no encontrada"})
		return
	}

	// Traer datos para el email
	colUsuarios := config.DB.Collection("usuarios")
	colCanchas := config.DB.Collection("canchas")

	var cliente models.Usuario
	var cancha models.Cancha
	colUsuarios.FindOne(ctx, bson.M{"_id": clienteOID}).Decode(&cliente)
	colCanchas.FindOne(ctx, bson.M{"_id": reserva.CanchaID}).Decode(&cancha)

	go utils.EnviarEmailCancelacionReserva(
		cliente.Email,
		cliente.Nombre,
		cancha.Nombre,
		reserva.Fecha.Format("2006-01-02"),
		reserva.HoraInicio,
	)

	c.JSON(http.StatusOK, gin.H{"mensaje": "Reserva cancelada"})
}
func ListarTurnosDisponibles(c *gin.Context) {
	canchaID, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	fecha := c.Query("fecha")
	fechaParseada, err := time.Parse("2006-01-02", fecha)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Formato de fecha inválido, usá YYYY-MM-DD"})
		return
	}

	// Horarios disponibles del día
	todosLosHorarios := []string{
		"08:00", "09:00", "10:00", "11:00", "12:00",
		"13:00", "14:00", "15:00", "16:00", "17:00",
		"18:00", "19:00", "20:00", "21:00", "22:00",
	}

	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, _ := col.Find(ctx, bson.M{
		"cancha_id": canchaID,
		"fecha":     fechaParseada,
		"estado":    bson.M{"$ne": "cancelada"},
	})

	var reservas []models.Reserva
	cursor.All(ctx, &reservas)

	// Filtrar los ocupados
	ocupados := map[string]bool{}
	for _, r := range reservas {
		ocupados[r.HoraInicio] = true
	}

	var disponibles []string
	for _, h := range todosLosHorarios {
		if !ocupados[h] {
			disponibles = append(disponibles, h)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"fecha":       fecha,
		"disponibles": disponibles,
		"ocupados":    len(reservas),
	})
}


func ListarTodasReservas(c *gin.Context) {
	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := col.Find(ctx, bson.M{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener reservas"})
		return
	}

	var reservas []models.Reserva
	cursor.All(ctx, &reservas)

	colUsuarios := config.DB.Collection("usuarios")
	colCanchas := config.DB.Collection("canchas")

	type ReservaAdmin struct {
		models.Reserva
		NombreCliente string `json:"nombre_cliente"`
		EmailCliente  string `json:"email_cliente"`
		NombreCancha  string `json:"nombre_cancha"`
	}

	var resultado []ReservaAdmin
	for _, r := range reservas {
		var cliente models.Usuario
		var cancha models.Cancha
		colUsuarios.FindOne(ctx, bson.M{"_id": r.ClienteID}).Decode(&cliente)
		colCanchas.FindOne(ctx, bson.M{"_id": r.CanchaID}).Decode(&cancha)
		resultado = append(resultado, ReservaAdmin{
			Reserva:       r,
			NombreCliente: cliente.Nombre,
			EmailCliente:  cliente.Email,
			NombreCancha:  cancha.Nombre,
		})
	}

	c.JSON(http.StatusOK, resultado)
}
func CancelarReservaAdmin(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var reserva models.Reserva
	err = col.FindOne(ctx, bson.M{"_id": id}).Decode(&reserva)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reserva no encontrada"})
		return
	}

	result, err := col.UpdateOne(ctx,
		bson.M{"_id": id},
		bson.M{"$set": bson.M{"estado": "cancelada"}},
	)

	if err != nil || result.MatchedCount == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reserva no encontrada"})
		return
	}

	// Traer datos del cliente y cancha
	colUsuarios := config.DB.Collection("usuarios")
	colCanchas := config.DB.Collection("canchas")

	var cliente models.Usuario
	var cancha models.Cancha
	colUsuarios.FindOne(ctx, bson.M{"_id": reserva.ClienteID}).Decode(&cliente)
	colCanchas.FindOne(ctx, bson.M{"_id": reserva.CanchaID}).Decode(&cancha)

	// Email con devolución simulada
	go utils.EnviarEmailCancelacionAdmin(
		cliente.Email,
		cliente.Nombre,
		cancha.Nombre,
		reserva.Fecha.Format("2006-01-02"),
		reserva.HoraInicio,
		cancha.Precio,
	)

	c.JSON(http.StatusOK, gin.H{"mensaje": "Reserva cancelada por admin"})
}

func ReservaManualAdmin(c *gin.Context) {
	var body struct {
		ClienteEmail string `json:"cliente_email"`
		CanchaID     string `json:"cancha_id"`
		Fecha        string `json:"fecha"`
		HoraInicio   string `json:"hora_inicio"`
		HoraFin      string `json:"hora_fin"`
		Pago         string `json:"pago"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos"})
		return
	}

	// Buscar cliente por email
	colUsuarios := config.DB.Collection("usuarios")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var cliente models.Usuario
	err := colUsuarios.FindOne(ctx, bson.M{"email": body.ClienteEmail}).Decode(&cliente)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No existe un cliente con ese email"})
		return
	}

	canchaID, err := primitive.ObjectIDFromHex(body.CanchaID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de cancha inválido"})
		return
	}

	fecha, _ := time.Parse("2006-01-02", body.Fecha)

	// Verificar que el turno no esté ocupado
	colReservas := config.DB.Collection("reservas")
	var existente models.Reserva
	err = colReservas.FindOne(ctx, bson.M{
		"cancha_id":   canchaID,
		"fecha":       fecha,
		"hora_inicio": body.HoraInicio,
		"estado":      bson.M{"$ne": "cancelada"},
	}).Decode(&existente)

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Ese turno ya está reservado"})
		return
	}

	pago := body.Pago
	if pago == "" {
		pago = "efectivo"
	}

	reserva := models.Reserva{
		ID:         primitive.NewObjectID(),
		ClienteID:  cliente.ID,
		CanchaID:   canchaID,
		Fecha:      fecha,
		HoraInicio: body.HoraInicio,
		HoraFin:    body.HoraFin,
		Estado:     "confirmada",
		Pago:       pago,
	}

	_, err = colReservas.InsertOne(ctx, reserva)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al crear la reserva"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"mensaje": "Reserva manual creada ⚽",
		"reserva": reserva,
	})
}

func ReportesIngresos(c *gin.Context) {
	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	cursor, err := col.Find(ctx, bson.M{"estado": "confirmada"})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al obtener reservas"})
		return
	}

	var reservas []models.Reserva
	cursor.All(ctx, &reservas)

	// Buscar precios de canchas
	colCanchas := config.DB.Collection("canchas")
	total := 0.0
	resumenPorCancha := map[string]int{}

	for _, r := range reservas {
		var cancha models.Cancha
		colCanchas.FindOne(ctx, bson.M{"_id": r.CanchaID}).Decode(&cancha)
		total += cancha.Precio
		resumenPorCancha[cancha.Nombre]++
	}

	c.JSON(http.StatusOK, gin.H{
		"total_reservas":     len(reservas),
		"ingresos_totales":   total,
		"reservas_por_cancha": resumenPorCancha,
	})
}



func ObtenerReserva(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	clienteID, _ := c.Get("id")
	clienteOID, _ := primitive.ObjectIDFromHex(clienteID.(string))
	rol, _ := c.Get("rol")

	col := config.DB.Collection("reservas")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var reserva models.Reserva

	// Admin puede ver cualquier reserva, cliente solo las suyas
	filtro := bson.M{"_id": id}
	if rol != "admin" {
		filtro["cliente_id"] = clienteOID
	}

	err = col.FindOne(ctx, filtro).Decode(&reserva)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Reserva no encontrada"})
		return
	}

	// Traer nombre de cancha
	colCanchas := config.DB.Collection("canchas")
	var cancha models.Cancha
	colCanchas.FindOne(ctx, bson.M{"_id": reserva.CanchaID}).Decode(&cancha)

	c.JSON(http.StatusOK, gin.H{
		"id":           reserva.ID,
		"cliente_id":   reserva.ClienteID,
		"cancha_id":    reserva.CanchaID,
		"nombre_cancha": cancha.Nombre,
		"precio":       cancha.Precio,
		"fecha":        reserva.Fecha,
		"hora_inicio":  reserva.HoraInicio,
		"hora_fin":     reserva.HoraFin,
		"estado":       reserva.Estado,
		"pago":         reserva.Pago,
	})
}