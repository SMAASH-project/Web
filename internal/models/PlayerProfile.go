package models

import (
	"gorm.io/gorm"
)

type PlayerProfile struct {
	gorm.Model
	DisplayName string `gorm:"unique;not null;type:varchar(20)"`
	UserID      uint   `gorm:"not null"`
	User        User
	Coins       int64 `gorm:"not null"`
	PfpUri      string
	Purchases   []Purchase
	Matches     []*Match `gorm:"many2many:match_participations"`
}

func (pp PlayerProfile) GetID() uint {
	return pp.ID
}

func (pp PlayerProfile) SetURIField(target string) {
	pp.PfpUri = target
}
