package models

import (
	"time"

	"gorm.io/gorm"
)

type Purchase struct {
	gorm.Model
	PlayerProfileID uint `gorm:"not null"`
	ItemID          uint `gorm:"not null"`
	Item            Item
	Count           int       `gorm:"not null"`
	Date            time.Time `gorm:"not null"`
}

func (p Purchase) GetID() uint {
	return p.ID
}
