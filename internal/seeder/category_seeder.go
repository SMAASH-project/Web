package seeder

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"smaash-web/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type CategorySeeder struct{}

func NewCategorySeeder() *CategorySeeder {
	return &CategorySeeder{}
}

type CategoryDataFormat struct {
	Name string
}

func (rs CategorySeeder) Seed(c context.Context, data_root_path string, db_url string, errStream chan error, logger logger.Interface) {
	log.Println("Starting categories seeder")
	db, err := gorm.Open(sqlite.Open(db_url), &gorm.Config{TranslateError: true, Logger: logger})
	if err != nil {
		errStream <- err
	}

	raw, err := os.ReadFile(data_root_path + "/categories.json")
	if err != nil {
		errStream <- err
	}

	var target []CategoryDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		errStream <- err
	}

	for _, val := range target {
		if err := gorm.G[models.Category](db).Create(c, &models.Category{Name: val.Name}); err != nil {
			if !errors.Is(err, gorm.ErrDuplicatedKey) {
				errStream <- err
			} else {
				log.Println("Skipped creating category with name: ", val.Name)
			}
		} else {
			log.Println("Created category with name: ", val.Name)
		}
	}
}
