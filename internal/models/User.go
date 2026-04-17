package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Email          string `gorm:"unique;not null;type:varchar(30)"`
	PasswordHash   string `gorm:"not null;type type:varchar(50)"`
	RoleID         uint   `gorm:"not null"`
	Role           Role
	IsBanned       bool `gorm:"not null"`
	BannedUntil    *time.Time
	LastLogin      time.Time `gorm:"not null"`
	SecurityKey    string    `gorm:"not null"`
	PlayerProfiles []PlayerProfile
}

func (u User) GetID() uint {
	return u.ID
}
