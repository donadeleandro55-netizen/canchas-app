package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Cancha struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Nombre      string             `bson:"nombre" json:"nombre"`
	Descripcion string             `bson:"descripcion" json:"descripcion"`
	Precio      float64            `bson:"precio" json:"precio"`
	Foto        string             `bson:"foto" json:"foto"`
	Activa      bool               `bson:"activa" json:"activa"`
}
