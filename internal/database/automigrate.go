package database

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(
		&models.User{},
		&models.PlayerProfile{},
		&models.Role{},
		&models.Character{},
		&models.Level{},
		&models.Match{},
		&models.MatchParticipation{},
		&models.Purchase{},
		&models.Category{},
		&models.Rarity{},
		&models.Post{},
	)
}
