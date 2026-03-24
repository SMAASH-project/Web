package models

import (
	"time"

	"gorm.io/gorm"
)

type Match struct {
	gorm.Model
	SessionID string    `gorm:"uniqueIndex;not null;type:varchar(64)"` // Photon session ID
	StartedAt time.Time `gorm:"not null"`
	EndedAt   time.Time `gorm:"not null"`
	LevelID   uint      `gorm:"not null"`
	Level     Level
	Players   []*PlayerProfile `gorm:"many2many:match_participations"`
}

func (m Match) GetID() uint {
	return m.ID
}
