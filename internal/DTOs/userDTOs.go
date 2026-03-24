package dtos

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type UserReadDTO struct {
	ID          uint   `json:"id"`
	Email       string `json:"email"`
	Role        string `json:"role"`
	IsBanned    bool   `json:"is_banned"`
	BannedUntil string `json:"banned_until"`
	LastLogin   string `json:"last_login"`
}

type UserCreateDTO struct {
	Email    string `json:"email" binding:"required,max=30,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
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

type UserBanDTO struct {
	ID     uint `json:"id" binding:"required"`
	Period uint `json:"period" binding:"required"` // in minutes
}

type UserPromoteDTO struct {
	ID         uint   `json:"id" binding:"required"`
	TargetRole string `json:"target_role" binding:"required,oneof=admin support"`
}

func UserToDTO(user models.User) UserReadDTO {
	dto := UserReadDTO{
		ID:        user.ID,
		Email:     user.Email,
		Role:      user.Role.Name,
		IsBanned:  user.IsBanned,
		LastLogin: user.LastLogin.Format(DateFormat),
	}

	if user.BannedUntil != nil {
		dto.BannedUntil = user.BannedUntil.Format(DateFormat)
	}

	return dto
}

func CreateDTOToUser(dto *UserCreateDTO, roleIDExtractor func(context.Context, string) (models.Role, error)) (*models.User, error) {
	role, err := roleIDExtractor(context.Background(), "user")
	if err != nil {
		return nil, err
	}
	return &models.User{
		Email:        dto.Email,
		PasswordHash: dto.Password,
		RoleID:       role.ID,
		IsBanned:     false,
	}, nil
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
