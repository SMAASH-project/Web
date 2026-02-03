package models

import (
	"time"

	"gorm.io/gorm"
)

type Purchase struct {
	gorm.Model
	PlayerProfileID uint      `gorm:"not null"`
	Date            time.Time `gorm:"not null"`
	Items           []*Item   `gorm:"many2many:purchase_items"`
}
