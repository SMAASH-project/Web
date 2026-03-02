package database

import (
	"log"
	"os"
	"smaash-web/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "github.com/joho/godotenv/autoload"
)

func NewGormDBConn() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(os.Getenv("DB_URL")), &gorm.Config{TranslateError: true})
	if err != nil {
		log.Panicf("Failed to connect to database: %v", err)
	}

	err = db.SetupJoinTable(&models.Match{}, "Players", &models.MatchParticipation{})
	if err != nil {
		log.Panicf("Failed to create many to many connection in database: %v", err)
	}
	err = db.SetupJoinTable(&models.PlayerProfile{}, "Matches", &models.MatchParticipation{})
	if err != nil {
		log.Panicf("Failed to create many to many connection in database: %v", err)
	}

	AutoMigrate(db)

	return db
}
