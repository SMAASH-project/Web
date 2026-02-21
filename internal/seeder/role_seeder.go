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
)

type RoleSeeder struct{}

func NewRoleSeeder() *RoleSeeder {
	return &RoleSeeder{}
}

type RoleDataFormat struct {
	Name string
}

func (rs RoleSeeder) Seed(c context.Context, data_root_path string, db_url string) error {
	log.Println("Starting roles seeder")
	db, err := gorm.Open(sqlite.Open(db_url))
	if err != nil {
		return err
	}

	raw, err := os.ReadFile(data_root_path + "/roles.json")
	if err != nil {
		return err
	}

	var target []RoleDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		return err
	}

	errs := make([]error, len(target))
	for _, val := range target {
		if err := gorm.G[models.Role](db).Create(c, &models.Role{Name: val.Name}); err != nil {
			errs = append(errs, err)
		}
	}
	if len(errs) > 1 {
		return errors.Join(errs...)
	}
	if len(errs) == 1 {
		return errs[0]
	}

	return nil
}
