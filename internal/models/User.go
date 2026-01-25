package models

import "gorm.io/gorm"

type Role string

const (
	USER  Role = "User"
	ADMIN Role = "Admin"
)

type User struct {
	gorm.Model
	Username string `gorm:"unique;not null;type:varchar(20)"`
	Email    string `gorm:"unique;not null;type:varchar(30)"`
	Password string `gorm:"not null;type type:varchar(50)"`
	Role     Role   `gorm:"not null;default:USER;type:varchar(5)"`
}
