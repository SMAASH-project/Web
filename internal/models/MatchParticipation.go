package models

type MatchParticipation struct {
	MatchID       uint   `gorm:"primaryKey;not null"`
	PlayerID      uint   `gorm:"primaryKey;not null"`
	CharacterID   uint   `gorm:"not null"`
	Result        string `gorm:"not null;type:varchar(4)"`
	NetworkStatus string `gorm:"not null;type:varchar(12)"`
}
