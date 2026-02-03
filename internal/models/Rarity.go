package models

import "gorm.io/gorm"

type Rarity struct {
	gorm.Model
	Name string `gorm:"unique;not null;type:varchar(9)"`
}
