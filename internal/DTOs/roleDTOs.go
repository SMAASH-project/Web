package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type RoleReadDTO struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type RoleCreateDTO struct {
	Name string `json:"name" binding:"required,max=7"`
}

type RoleUpdateDTO struct {
	ID   uint   `json:"id" binding:"required"`
	Name string `json:"name" binding:"required,max=7"`
}

func RoleToDTO(role models.Role) RoleReadDTO {
	return RoleReadDTO{
		ID:   role.ID,
		Name: role.Name,
	}
}

func CreateDTOToRole(dto RoleCreateDTO) *models.Role {
	return &models.Role{
		Name: dto.Name,
	}
}

func UpdateDTOToRole(dto RoleUpdateDTO) models.Role {
	return models.Role{
		Model: gorm.Model{ID: dto.ID},
		Name:  dto.Name,
	}
}
