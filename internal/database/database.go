package database

import (
	"log"
	"os"
	"smaash-web/internal/models"

	"github.com/glebarez/sqlite"
	"gopkg.in/natefinch/lumberjack.v2"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	_ "github.com/joho/godotenv/autoload"
)

func NewGormDBConn() *gorm.DB {
	db_url := os.Getenv("DB_URL")
	log.Println("db_url: ", db_url)
	if db_url == "" {
		db_url = "test.db"
	}

	logger := logger.New(
		log.New(&lumberjack.Logger{
			Filename:   "./logs/gorm.log",
			MaxSize:    100,
			MaxAge:     30,
			MaxBackups: 10,
		}, "/r/n", log.LstdFlags),
		logger.Config{
			LogLevel: logger.Info,
		},
	)

	db, err := gorm.Open(sqlite.Open(db_url), &gorm.Config{
		TranslateError: true,
		Logger:         logger,
	})
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
