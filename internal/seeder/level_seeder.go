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

type LevelSeeder struct{ children []Seeder }

func NewLevelSeeder() Seeder {
	return &LevelSeeder{}
}

func (ls *LevelSeeder) GetChildren() []Seeder {
	return ls.children
}

func (ls *LevelSeeder) AppendChildren(children ...Seeder) {
	ls.children = slices.Concat(ls.children, children)
}

type LevelDataFormat struct {
	Name   string
	ImgURI string
}

func (ls LevelSeeder) Seed(c context.Context, data_root_path string, db *gorm.DB, errStream chan error, logger logger.Interface) {
	log.Println("Starting levels seeder")

	raw, err := os.ReadFile(data_root_path + "/levels.json")
	if err != nil {
		errStream <- err
	}

	var target []LevelDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		errStream <- err
	}

	for _, val := range target {
		if err := gorm.G[models.Level](db).Create(c, &models.Level{Name: val.Name, ImgURI: val.ImgURI}); err != nil {
			if !errors.Is(err, gorm.ErrDuplicatedKey) {
				errStream <- err
			} else {
				log.Println("Skipped creating level with name: ", val.Name)
			}
		} else {
			log.Println("Created level with name: ", val.Name)
		}
	}
}
