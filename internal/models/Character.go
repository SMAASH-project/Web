package models

import "gorm.io/gorm"

type Character struct {
	gorm.Model
	Name              string               `gorm:"unique;not null;type:varchar(20)"`
	ImgUri            string               `gorm:"not null"`
	MatchParticipants []MatchParticipation `gorm:"foreignKey:CharacterID;constraint:OnDelete:RESTRICT"`
	Name   string `gorm:"unique;not null;type:varchar(20)"`
	ImgURI string `gorm:"not null"`
}

func (c Character) GetID() uint {
	return c.ID
}

func (c Character) SetURIField(target string) {
	c.ImgURI = target
}
