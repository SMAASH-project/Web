package models

import "gorm.io/gorm"

type Role struct {
	gorm.Model
	Name  string `gorm:"unique;not null;type:varchar(7)"`
	Users []User
}

func (r Role) GetID() uint {
	return r.ID
}
