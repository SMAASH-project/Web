package dtos

import (
	"context"
	"smaash-web/internal/models"
	"smaash-web/internal/utils"

	"gorm.io/gorm"
)

type ItemReadDTO struct {
	ID          uint     `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Price       uint     `json:"price"`
	Rarity      string   `json:"rarity"`
	Categories  []string `json:"categories"`
}

type ItemCreateDTO struct {
	Name        string   `json:"name" binding:"required,max=20"`
	Description string   `json:"description" binding:"required,max=50"`
	Price       uint     `json:"price" binding:"required,gte=0"`
	Rarity      string   `json:"rarity" binding:"required,max=9"`
	Categories  []string `json:"categories" binding:"required"`
}

type ItemUpdateDTO struct {
	ID          uint     `json:"id" binding:"required"`
	Name        string   `json:"name" binding:"required,max=20"`
	Description string   `json:"description" binding:"required,max=50"`
	Price       uint     `json:"price" binding:"required,gte=0"`
	Rarity      string   `json:"rarity" binding:"required,max=9"`
	Categories  []string `json:"categories" binding:"required"`
}

func ItemToDTO(item models.Item) ItemReadDTO {
	return ItemReadDTO{
		ID:          item.ID,
		Name:        item.Name,
		Description: item.Description,
		Price:       item.Price,
		Rarity:      item.Rarity.Name,
		Categories:  utils.Map(item.Categories, func(c *models.Category) string { return c.Name }),
	}
}

func CreateDTOToItem(
	dto ItemCreateDTO,
	rarityExtracor func(c context.Context, rarityName string) (models.Rarity, error),
	categoryExtractor func(c context.Context, categoryName string) (*models.Category, error),
) (*models.Item, error) {
	rarity, err := rarityExtracor(context.Background(), dto.Rarity)
	if err != nil {
		return nil, err
	}
	return &models.Item{
		Name:        dto.Name,
		Description: dto.Description,
		Price:       dto.Price,
		RarityID:    rarity.ID,
		Categories: utils.Map(dto.Categories, func(name string) *models.Category {
			category, err := categoryExtractor(context.Background(), name)
			if err != nil {
				panic("failed convert categories from request dto to model")
			}
			return category
		}),
	}, nil
}

func UpdateDTOToItem(
	dto ItemUpdateDTO,
	rarityExtractor func(c context.Context, rarityName string) (models.Rarity, error),
	categoryExtractor func(c context.Context, categoryName string) (*models.Category, error),
) (*models.Item, error) {
	rarity, err := rarityExtractor(context.Background(), dto.Rarity)
	if err != nil {
		return nil, err
	}
	return &models.Item{
		Model:       gorm.Model{ID: dto.ID},
		Name:        dto.Name,
		Description: dto.Description,
		Price:       dto.Price,
		RarityID:    rarity.ID,
		Categories: utils.Map(dto.Categories, func(name string) *models.Category {
			category, err := categoryExtractor(context.Background(), name)
			if err != nil {
				panic("failed convert categories from request dto to model")
			}
			return category
		}),
	}, nil
}
