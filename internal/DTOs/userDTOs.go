package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type UserReadDTO struct {
	ID        uint   `json:"id"`
	Email     string `json:"email"`
	IsBanned  bool   `json:"is_banned"`
	LastLogin string `json:"last_login"`
}

type UserCreateDTO struct {
	Email    string `json:"email" binding:"required,max=30,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
	Username string `json:"username" binding:"required,min=3,max=20"`
	RoleID   uint   `json:"role_id" binding:"required"`
}

type UserUpdateDTO struct {
	ID     uint   `json:"id" binding:"required"`
	Email  string `json:"email" binding:"required,max=30,email"`
	RoleID uint   `json:"role_id"`
}

type UserLoginDTO struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func UserToDTO(user *models.User) UserReadDTO {
	return UserReadDTO{
		ID:        user.ID,
		Email:     user.Email,
		IsBanned:  user.IsBanned,
		LastLogin: user.LastLogin.Format("2006-01-02"),
	}
}

func CreateDTOToUser(dto *UserCreateDTO) *models.User {
	return &models.User{
		Email:        dto.Email,
		PasswordHash: dto.Password,
		RoleID:       dto.RoleID,
		IsBanned:     false,
	}
}

func LoginDTOToUser(dto *UserLoginDTO) *models.User {
	return &models.User{
		Email:        dto.Email,
		PasswordHash: dto.Password,
	}
}

func UpdateDTOToUser(dto UserUpdateDTO) models.User {
	return models.User{
		Model:  gorm.Model{ID: dto.ID},
		Email:  dto.Email,
		RoleID: dto.RoleID,
	}
}
