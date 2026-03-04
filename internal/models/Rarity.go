package models

import "gorm.io/gorm"

type Rarity struct {
	gorm.Model
	Name string `gorm:"unique;not null;type:varchar(9)"`
}

func (r Rarity) GetID() uint {
	return r.ID
}
