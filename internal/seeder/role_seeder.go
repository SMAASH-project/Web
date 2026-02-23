package seeder

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"smaash-web/internal/models"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type RoleSeeder struct{}

func NewRoleSeeder() *RoleSeeder {
	return &RoleSeeder{}
}

type RoleDataFormat struct {
	Name string
}

func (rs RoleSeeder) Seed(c context.Context, data_root_path string, db_url string, errStream chan error, logger logger.Interface) {
	log.Println("Starting roles seeder")
	db, err := gorm.Open(sqlite.Open(db_url), &gorm.Config{TranslateError: true, Logger: logger})
	if err != nil {
		errStream <- err
	}

	raw, err := os.ReadFile(data_root_path + "/roles.json")
	if err != nil {
		errStream <- err
	}

	var target []RoleDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		errStream <- err
	}

	for _, val := range target {
		if err := gorm.G[models.Role](db).Create(c, &models.Role{Name: val.Name}); err != nil {
			if !errors.Is(err, gorm.ErrDuplicatedKey) {
				errStream <- err
			} else {
				log.Println("Skipped creating role with name: ", val.Name)
			}
		} else {
			log.Println("Created role with name: ", val.Name)
		}
	}
}
