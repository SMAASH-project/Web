package dtos

import (
	"smaash-web/internal/models"
	"smaash-web/internal/utils"

	"gorm.io/gorm"
)

type CharacterReadDTO struct {
	ID          uint     `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Price       uint     `json:"price"`
	Rarity      string   `json:"rarity"`
	Categories  []string `json:"categories"`
	ImgURI      string   `json:"img_uri"`
}

type CharacterCreateDTO struct {
	Name        string `json:"name" binding:"required,max=20"`
	Description string `json:"description" binding:"required,max=70"`
	Price       uint   `json:"price" binding:"required"`
	RarityID    uint   `json:"rarity_id" binding:"required"`
	CategoryIDs []uint `json:"category_ids"`
}

type CharacterUpdateDTO struct {
	ID          uint   `json:"id" binding:"required"`
	Name        string `json:"name" binding:"required,max=20"`
	Description string `json:"description" binding:"required,max=70"`
	Price       uint   `json:"price" binding:"required"`
	RarityID    uint   `json:"rarity_id" binding:"required"`
	CategoryIDs []uint `json:"category_ids"`
}

func CharacterToDTO(c models.Character) CharacterReadDTO {
	return CharacterReadDTO{
		ID:          c.ID,
		Name:        c.Name,
		Description: c.Description,
		Price:       c.Price,
		Rarity:      c.Rarity.Name,
		Categories:  utils.Map(c.Categories, func(c *models.Category) string { return c.Name }),
		ImgURI:      c.ImgURI,
	}
}

func CreateDTOToCharacter(dto CharacterCreateDTO) *models.Character {
	newCharacter := models.Character{
		Name:        dto.Name,
		Description: dto.Description,
		Price:       dto.Price,
		RarityID:    dto.RarityID,
		Implemented: false,
	}
	return &newCharacter
}

func UpdateDTOToCharacter(dto CharacterUpdateDTO) models.Character {
	newCharacter := models.Character{
		Model:       gorm.Model{ID: dto.ID},
		Name:        dto.Name,
		Description: dto.Description,
		Price:       dto.Price,
		RarityID:    dto.RarityID,
		Implemented: false,
	}
	return newCharacter
}
