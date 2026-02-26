package models

import (
	"time"

	"gorm.io/gorm"
)

type PlayerProfile struct {
	gorm.Model
	DisplayName string `gorm:"unique;not null;type:varchar(20)"`
	UserID      uint   `gorm:"not null"`
	User        User
	Coins       int64     `gorm:"not null"`
	LastLogin   time.Time `gorm:"not null"`
	PfpUri      string
	Purchases   []Purchase
	Matches     []*Match `gorm:"many2many:match_participation"`
}
