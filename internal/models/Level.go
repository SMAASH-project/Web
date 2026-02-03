package models

import "gorm.io/gorm"

type Level struct {
	gorm.Model
	Name   string `gorm:"unique;not null;type:varchar(20)"`
	ImgUri string `gorm:"not null"`
}
