package models

import "gorm.io/gorm"

type Post struct {
	gorm.Model
	Title    string `gorm:"not null"`
	Category string `gorm:"not null;type:varchar(14)"`
	ImgURL   string
	ImgAlt   string  `gorm:"type:varchar(20)"`
	ImgPos   float64 `gorm:"check:img_pos < 10"`
	Content  string  `gorm:"not null"`
}

func (p Post) GetID() uint {
	return p.ID
}
