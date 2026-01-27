package dtos

import "smaash-web/internal/models"

type UserReadDTO struct {
	ID       uint   `json:"id"`
	Username string `json:"username"`
	Email    string `json:"email"`
	Role     string `json:"role"`
}

type UserCreateDTO struct {
	Username string `json:"username" binding:"required,max=20"`
	Email    string `json:"email" binding:"required,max=30,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
	Role     string `json:"role" binding:"required,oneof=USER ADMIN"`
}

type UserUpdateDTO struct {
	ID       uint   `json:"id" binding:"required"`
	Username string `json:"username" binding:"required,max=20"`
	Email    string `json:"email" binding:"required,max=30,email"`
	Password string `json:"password" binding:"required,min=8,max=50"`
	Role     string `json:"role" binding:"oneof=USER ADMIN"`
}

type UserLoginDTO struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func UserToDTO(user *models.User) UserReadDTO {
	return UserReadDTO{
		ID:       user.ID,
		Username: user.Username,
		Email:    user.Email,
		Role:     string(user.Role),
	}
}

func CreateDTOToUser(dto *UserCreateDTO) *models.User {
	return &models.User{
		Username: dto.Username,
		Email:    dto.Email,
		Password: dto.Password,
	}
}

func LoginDTOToUser(dto *UserLoginDTO) *models.User {
	return &models.User{
		Email:    dto.Email,
		Password: dto.Password,
	}
}
