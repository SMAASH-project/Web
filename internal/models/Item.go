package models

import "gorm.io/gorm"

type Item struct {
	gorm.Model
	Name        string `gorm:"unique;not null;type:varchar(20)"`
	Description string `gorm:"not null;type:varchar(50)"`
	RarityID    uint   `gorm:"not null"`
	Price       uint   `gorm:"not null"`
	ImgUri      string `gorm:"not null"`
	Purchases   []Purchase
	Categories  []*Category `gorm:"many2many:item_category"`
}

func (i Item) GetID() uint {
	return i.ID
}

func (i Item) SetURIField(target string) {
	i.ImgUri = target
}
