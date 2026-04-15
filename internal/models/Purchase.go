package models

import (
	"gorm.io/gorm"
)

type Purchase struct {
	gorm.Model
	PlayerProfileID uint `gorm:"not null"`
	PlayerProfile   PlayerProfile
	CharacterID     uint `gorm:"not null"`
	Character       Character
}

func (p Purchase) GetID() uint {
	return p.ID
}
