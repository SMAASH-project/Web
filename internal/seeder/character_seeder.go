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

type CharacterSeeder struct{ children []Seeder }

func NewCharacterSeeder() Seeder {
	return &CharacterSeeder{}
}

func (cs *CharacterSeeder) GetChildren() []Seeder {
	return cs.children
}

func (cs *CharacterSeeder) AppendChildren(children ...Seeder) {
	cs.children = slices.Concat(cs.children, children)
}

type CharacterDataFormat struct {
	Name        string
	Description string
	RarityID    uint
	Price       uint
	Implemented bool
	ImgURI      string
	Categories  []string
}

func (rs CharacterSeeder) Seed(c context.Context, data_root_path string, db *gorm.DB, errStream chan error, logger logger.Interface) {
	log.Println("Starting character seeder")

	raw, err := os.ReadFile(data_root_path + "/characters.json")
	if err != nil {
		errStream <- err
	}

	var target []CharacterDataFormat
	if err = json.Unmarshal(raw, &target); err != nil {
		errStream <- err
	}

	for _, val := range target {
		if err := db.Transaction(func(tx *gorm.DB) error {
			if err := gorm.G[models.Character](tx).Create(c, &models.Character{
				Name:        val.Name,
				Description: val.Description,
				RarityID:    val.RarityID,
				Price:       val.Price,
				Implemented: true,
				ImgURI:      val.ImgURI,
			}); err != nil {
				return err
			}

			newCharacter, _ := gorm.G[models.Character](tx).Where("name = ?", val.Name).First(c)

			for _, category := range val.Categories {
				cat, err := gorm.G[models.Category](tx).Where("name = ?", category).First(c)
				if err != nil {
					return err
				}
				if err := tx.Model(&newCharacter).Association("Categories").Append(cat); err != nil {
					return err
				}
			}

			return nil
		}); err != nil {
			if !errors.Is(err, gorm.ErrDuplicatedKey) {
				errStream <- err
			} else {
				log.Println("Skipped creating character with name: ", val.Name)
			}
		} else {
			log.Println("Created character with name: ", val.Name)
		}
	}
}
