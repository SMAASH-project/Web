package database

import (
	"log"
	"os"
	"smaash-web/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "github.com/joho/godotenv/autoload"
)

type GormDBConn struct {
	db *gorm.DB
}

func NewGormDBConn() *GormDBConn {
	db, err := gorm.Open(sqlite.Open(os.Getenv("DB_URL")), &gorm.Config{TranslateError: true})
	if err != nil {
		log.Panicf("Failed to connect to database: %v", err)
	}

	return &GormDBConn{db: db}
}

func (g *GormDBConn) Init() *gorm.DB {
	err := g.db.SetupJoinTable(&models.Match{}, "Players", &models.MatchParticipation{})
	if err != nil {
		log.Panicf("Failed to create many to many connection in database: %v", err)
	}
	err = g.db.SetupJoinTable(&models.PlayerProfile{}, "Matches", &models.MatchParticipation{})
	if err != nil {
		log.Panicf("Failed to create many to many connection in database: %v", err)
	}

	AutoMigrate(g.db)
	return g.db
}
