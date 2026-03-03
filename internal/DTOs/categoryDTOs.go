package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type CategoryReadDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type CategoryCreateDTO struct {
	Name string `json:"name" binding:"required,max=20"`
}

type CategoryUpdateDTO struct {
	ID   uint   `json:"id" binding:"required"`
	Name string `json:"name" binding:"required,max=20"`
}

func CategoryToDTO(category models.Category) CategoryReadDTO {
	return CategoryReadDTO{
		ID:   category.ID,
		Name: category.Name,
	}
}

func CreateDTOToCategory(dto CategoryCreateDTO) *models.Category {
	return &models.Category{
		Name: dto.Name,
	}
}

func UpdateDTOToCategory(dto CategoryUpdateDTO) models.Category {
	return models.Category{
		Model: gorm.Model{ID: dto.ID},
		Name:  dto.Name,
	}
}
