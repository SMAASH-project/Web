package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PurchaseReadDTO struct {
	ID        uint   `json:"id"`
	Character string `json:"character"`
	Total     int    `json:"total"`
	Profile   string `json:"profile"`
	Date      string `json:"date"`
}

type PurchaseCreateDTO struct {
	PlayerProfileID uint `json:"player_profile_id" binding:"required"`
	CharacterID     uint `json:"character_id" binding:"required"`
}

type PurchaseUpdateDTO struct {
	ID              uint `json:"id" binding:"required"`
	PlayerProfileID uint `json:"player_profile_id" binding:"required"`
	CharacterID     uint `json:"character_id" binding:"required"`
}

func PurchaseToDTO(p models.Purchase) PurchaseReadDTO {
	return PurchaseReadDTO{
		ID:        p.ID,
		Character: p.Character.Name,
		Total:     int(p.Character.Price),
		Profile:   p.PlayerProfile.DisplayName,
		Date:      p.CreatedAt.Format(DATE_TIME_FORMAT),
	}
}

func CreateDTOToPurchase(dto PurchaseCreateDTO) *models.Purchase {
	return &models.Purchase{
		PlayerProfileID: dto.PlayerProfileID,
		CharacterID:     dto.CharacterID,
	}
}

func UpdateDTOToPurchase(dto PurchaseUpdateDTO) models.Purchase {
	return models.Purchase{
		Model:           gorm.Model{ID: dto.ID},
		PlayerProfileID: dto.PlayerProfileID,
		CharacterID:     dto.CharacterID,
	}
}
