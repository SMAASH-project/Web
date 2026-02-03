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
	IsBanned       bool      `gorm:"not null"`
	LastLogin      time.Time `gorm:"not null"`
	PlayerProfiles []PlayerProfile
}
