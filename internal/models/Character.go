package models

import "gorm.io/gorm"

type Character struct {
	gorm.Model
	Name              string `gorm:"unique;not null;type:varchar(20)"`
	Description       string `gorm:"not null"`
	RarityID          uint   `gorm:"not null"`
	Rarity            Rarity
	Price             uint                 `gorm:"not null"`
	Implemented       bool                 `gorm:"not null"`
	ImgURI            string               `gorm:"not null"`
	CroppedImgURI     string               `gorm:"not null"`
	MatchParticipants []MatchParticipation `gorm:"foreignKey:CharacterID;constraint:OnDelete:RESTRICT"`
	Categories        []*Category          `gorm:"many2many:character_category"`
}

func (c Character) GetID() uint {
	return c.ID
}

func (c Character) SetURIField(target string) {
	c.ImgURI = target
}
