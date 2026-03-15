package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Usuario struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Nombre   string             `bson:"nombre" json:"nombre"`
	Email    string             `bson:"email" json:"email"`
	Password string             `bson:"password" json:"-"`
	Rol      string             `bson:"rol" json:"rol"` // "admin" o "cliente"
}