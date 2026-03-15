package models

import (
	"time"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reserva struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	ClienteID primitive.ObjectID `bson:"cliente_id" json:"cliente_id"`
	CanchaID  primitive.ObjectID `bson:"cancha_id" json:"cancha_id"`
	Fecha     time.Time          `bson:"fecha" json:"fecha"`
	HoraInicio string            `bson:"hora_inicio" json:"hora_inicio"`
	HoraFin    string            `bson:"hora_fin" json:"hora_fin"`
	Estado    string             `bson:"estado" json:"estado"` // "confirmada", "cancelada", "pendiente"
	Pago      string             `bson:"pago" json:"pago"`     // "simulado", "efectivo"
}