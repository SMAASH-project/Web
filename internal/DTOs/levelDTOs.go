package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type LevelReadDTO struct {
	ID     uint   `json:"id"`
	Name   string `json:"name"`
	ImgURI string `json:"img_uri"`
}

type LevelCreateDTO struct {
	Name   string `json:"name" binding:"required,max=20"`
	ImgURI string `json:"img_uri" binding:"required"`
}

type LevelUpdateDTO struct {
	ID     uint   `json:"id" binding:"required"`
	Name   string `json:"name" binding:"required,max=20"`
	ImgURI string `json:"img_uri" binding:"required"`
}

func LevelToDTO(level models.Level) LevelReadDTO {
	return LevelReadDTO{
		ID:     level.ID,
		Name:   level.Name,
		ImgURI: level.ImgURI,
	}
}

func CreateDTOToLevel(dto LevelCreateDTO) *models.Level {
	return &models.Level{
		Name:   dto.Name,
		ImgURI: dto.ImgURI,
	}
}

func UpdateDTOToLevel(dto LevelUpdateDTO) models.Level {
	return models.Level{
		Model:  gorm.Model{ID: dto.ID},
		Name:   dto.Name,
		ImgURI: dto.ImgURI,
	}
}
