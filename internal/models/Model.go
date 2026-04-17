package models

type Model interface {
	GetID() uint
}

type ModelWithImg interface {
	Model
	SetURIField(string)
}
