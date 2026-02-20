package dtos

import (
	"smaash-web/internal/models"
)

type PlayerProfileReadDTO struct {
	ID          uint   `json:"id"`
	DisplayName string `json:"display_name"`
	Coins       int64  `json:"coins"`
	LastLogin   string `json:"last_login"`
}

type PlayerProfileCreateDto struct {
	DisplayName string `json:"display_name" binding:"required,max=20"`
	UserID      uint   `json:"user_id" binding:"required"`
}

// TODO: handle profile pictures
type PlayerProfileUpdateDto struct {
	ID          uint   `json:"id" binding:"required"`
	DisplayName string `json:"display_name" binding:"required,max=20"`
	Coins       uint   `json:"coins"`
}

func PlayerProfileToReadDTO(profile models.PlayerProfile) PlayerProfileReadDTO {
	return PlayerProfileReadDTO{
		ID:          profile.ID,
		DisplayName: profile.DisplayName,
		Coins:       profile.Coins,
		LastLogin:   profile.LastLogin.Format("2006-01-02 15:04:05"),
	}
}
