package seeder

import (
	"context"
	"encoding/json"
	"errors"
	"log"
	"os"
	"slices"
	"smaash-web/internal/models"

	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type CategorySeeder struct{ children []Seeder }

func NewCategorySeeder() Seeder {
	return &CategorySeeder{}
}

func (cs CategorySeeder) GetChildren() []Seeder {
	return cs.children
}

func (cs CategorySeeder) AppendChildren(children ...Seeder) {
	cs.children = slices.Concat(cs.children, children)
}

type CategoryDataFormat struct {
	Name string
}

func (rs CategorySeeder) Seed(c context.Context, data_root_path string, db *gorm.DB, errStream chan error, logger logger.Interface) {
	log.Println("Starting categories seeder")

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
