package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type CharacterReadDTO struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	ImgURI string `json:"img_uri"`
}

type CharacterCreateDTO struct {
	Name string `json:"name" binding:"required,max=20"`
}

type CharacterUpdateDTO struct {
	ID   uint   `json:"id" binding:"required"`
	Name string `json:"name" binding:"required,max=20"`
}

func CharacterToDTO(c models.Character) CharacterReadDTO {
	return CharacterReadDTO{
		ID:     c.ID,
		Name:   c.Name,
		ImgURI: c.ImgUri,
	}
}

func CreateDTOToCharacter(dto CharacterCreateDTO) *models.Character {
	return &models.Character{
		Name: dto.Name,
	}
}

func UpdateDTOToCharacter(dto CharacterUpdateDTO) models.Character {
	return models.Character{
		Model: gorm.Model{ID: dto.ID},
		Name:  dto.Name,
	}
}
