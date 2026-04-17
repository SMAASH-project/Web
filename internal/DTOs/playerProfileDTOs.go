package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PlayerProfileReadDTO struct {
	ID          uint       `json:"id"`
	DisplayName string     `json:"display_name"`
	Coins       int64      `json:"coins"`
	Images      ImagesResp `json:"images"`
}

type PlayerProfileCreateDTO struct {
	DisplayName string `json:"display_name" binding:"required,max=20"`
	UserID      uint   `json:"user_id" binding:"required"`
}

type PlayerProfileUpdateDTO struct {
	ID          uint   `json:"id" binding:"required"`
	DisplayName string `json:"display_name" binding:"required,max=20"`
	Coins       uint   `json:"coins"`
}

type PlayerProfileAppendDTO struct {
	DisplayName string `json:"display_name" binding:"required,max=20"`
}

func PlayerProfileToReadDTO(profile models.PlayerProfile) PlayerProfileReadDTO {
	return PlayerProfileReadDTO{
		ID:          profile.ID,
		DisplayName: profile.DisplayName,
		Coins:       profile.Coins,
		Images:      ImagesResp{FullImgURI: profile.PfpURI, CroppedImgURI: profile.CroppedPfpURI},
	}
}

func CreateDTOToPlayerProfile(p PlayerProfileCreateDTO) models.PlayerProfile {
	return models.PlayerProfile{
		DisplayName: p.DisplayName,
		UserID:      p.UserID,
		Coins:       50,
	}
}

func UpdateDTOToPlayerProfile(p PlayerProfileUpdateDTO) models.PlayerProfile {
	return models.PlayerProfile{
		Model:       gorm.Model{ID: p.ID},
		DisplayName: p.DisplayName,
		Coins:       int64(p.Coins),
	}
}

func AppendDTOToPlayerProfile(p PlayerProfileAppendDTO) models.PlayerProfile {
	return models.PlayerProfile{
		DisplayName: p.DisplayName,
		Coins:       50,
	}
}
