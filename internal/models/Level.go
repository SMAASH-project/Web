package models

import "gorm.io/gorm"

type Level struct {
	gorm.Model
	Name          string `gorm:"unique;not null;type:varchar(20)"`
	ImgURI        string `gorm:"not null"`
	CroppedImgURI string `gorm:"not null"`
}

func (l Level) GetID() uint {
	return l.ID
}

func (l Level) SetURIField(target string) {
	l.ImgURI = target
}
