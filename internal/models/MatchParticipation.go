package models

type MatchParticipation struct {
	MatchID         uint      `gorm:"primaryKey"`
	PlayerProfileID uint      `gorm:"primaryKey"`
	CharacterID     uint      `gorm:"not null"`
	Character       Character `gorm:"foreignKey:CharacterID;constraint:OnDelete:RESTRICT"`
	Result          string    `gorm:"not null;type:varchar(4)"`
	NetworkStatus   string    `gorm:"not null;type:varchar(12)"`
}

func (mp MatchParticipation) GetID() uint {
	return mp.MatchID
}
