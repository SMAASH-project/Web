package models

import (
	"gorm.io/gorm"
)

type Purchase struct {
	gorm.Model
	PlayerProfileID uint `gorm:"not null"`
	PlayerProfile   PlayerProfile
	ItemID          uint `gorm:"not null"`
	Item            Item
	Count           int `gorm:"not null"`
}

func (p Purchase) GetID() uint {
	return p.ID
}
