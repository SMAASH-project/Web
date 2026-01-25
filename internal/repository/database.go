package repository

import (
	"os"
	"smaash-web/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "github.com/joho/godotenv/autoload"
)

func NewGormDBConn() *gorm.DB {
	db, err := gorm.Open(sqlite.Open(os.Getenv("DB_URL")), &gorm.Config{TranslateError: true})
	if err != nil {
		panic("Failed to connect to database")
	}
	db.AutoMigrate(&models.User{})
	return db
}
