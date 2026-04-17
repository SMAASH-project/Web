package models

import (
	"gorm.io/gorm"
)

type PlayerProfile struct {
	gorm.Model
	DisplayName   string `gorm:"unique;not null;type:varchar(20)"`
	UserID        uint   `gorm:"not null"`
	User          User
	Coins         int64 `gorm:"not null"`
	PfpURI        string
	CroppedPfpURI string
	Purchases     []Purchase
	Matches       []*Match    `gorm:"many2many:match_participations"`
	Characters    []Character `gorm:"many2many:profile_character"`
}

func (pp PlayerProfile) GetID() uint {
	return pp.ID
}

func (pp PlayerProfile) SetURIField(target string) {
	pp.PfpURI = target
}
