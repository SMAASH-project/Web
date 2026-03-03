package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	Name string `gorm:"unique;not null;type:varchar(20)"`
}

func (c Category) GetID() uint {
	return c.ID
}
