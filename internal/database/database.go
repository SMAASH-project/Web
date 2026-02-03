package database

import (
	"fmt"
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
		panic(fmt.Sprintf("Failed to connect to database: %v", err))
	}

	return &GormDBConn{db: db}
}

func (g *GormDBConn) Init() *gorm.DB {
	err := g.db.SetupJoinTable(&models.Match{}, "Players", &models.MatchParticipation{})
	if err != nil {
		panic(fmt.Sprintf("Failed to create many to many connection in database: %v", err))
	}
	err = g.db.SetupJoinTable(&models.PlayerProfile{}, "Matches", &models.MatchParticipation{})
	if err != nil {
		panic(fmt.Sprintf("Failed to create many to many connection in database: %v", err))
	}

	g.db.AutoMigrate(
		&models.User{},
		&models.PlayerProfile{},
		&models.Role{},
		&models.Character{},
		&models.Level{},
		&models.Match{},
		&models.MatchParticipation{},
		&models.Purchase{},
		&models.Item{},
		&models.Category{},
		&models.Rarity{},
	)
	return g.db
}
