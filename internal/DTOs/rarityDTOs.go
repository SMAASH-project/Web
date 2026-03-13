package dtos

import "smaash-web/internal/models"

type RarityReadDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type RarityCreateDTO struct {
	Name string `json:"name" binding:"required,max=9"`
}

type RarityUpdateDTO struct {
	ID   uint   `json:"id" binding:"required"`
	Name string `json:"name" binding:"required,max=9"`
}

func RarityToDTO(r models.Rarity) RarityReadDTO {
	return RarityReadDTO{
		ID:   r.ID,
		Name: r.Name,
	}
}

func CreateDTOToRarity(dto RarityCreateDTO) *models.Rarity {
	return &models.Rarity{
		Name: dto.Name,
	}
}

func UpdateDTOToRarity(dto RarityUpdateDTO) models.Rarity {
	return models.Rarity{
		Name: dto.Name,
	}
}
