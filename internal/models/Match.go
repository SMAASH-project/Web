package models

import (
	"time"

	"gorm.io/gorm"
)

type Match struct {
	gorm.Model
	StartedAt time.Time `gorm:"not null"`
	EndedAt   time.Time `gorm:"not null"`
	LevelID   uint      `gorm:"not null"`
	Level     Level
	Players   []*PlayerProfile `gorm:"many2many:match_participation"`
}
