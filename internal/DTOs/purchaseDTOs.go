package dtos

import (
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PurchaseReadDTO struct {
	ID      uint   `json:"id"`
	Item    string `json:"item"`
	Count   int    `json:"count"`
	Total   int    `json:"total"`
	Profile string `json:"profile"`
	Date    string `json:"date"`
}

type PurchaseCreateDTO struct {
	PlayerProfileID uint `json:"player_profile_id" binding:"required"`
	ItemID          uint `json:"item_id" binding:"required"`
	Count           int  `json:"count" binding:"required"`
}

type PurchaseUpdateDTO struct {
	ID              uint `json:"id" binding:"required"`
	PlayerProfileID uint `json:"player_profile_id" binding:"required"`
	ItemID          uint `json:"item_id" binding:"required"`
	Count           int  `json:"count" binding:"required"`
}

func PurchaseToDTO(p models.Purchase) PurchaseReadDTO {
	return PurchaseReadDTO{
		ID:      p.ID,
		Item:    p.Item.Name,
		Count:   p.Count,
		Total:   int(p.Item.Price) * p.Count,
		Profile: p.PlayerProfile.DisplayName,
		Date:    p.CreatedAt.Format(DATE_TIME_FORMAT),
	}
}

func CreateDTOToPurchase(dto PurchaseCreateDTO) (*models.Purchase, error) {
	return &models.Purchase{
		PlayerProfileID: dto.PlayerProfileID,
		ItemID:          dto.ItemID,
		Count:           dto.Count,
	}, nil
}

func UpdateDTOToPurchase(dto PurchaseUpdateDTO) (*models.Purchase, error) {
	return &models.Purchase{
		Model:           gorm.Model{ID: dto.ID},
		PlayerProfileID: dto.PlayerProfileID,
		ItemID:          dto.ItemID,
		Count:           dto.Count,
	}, nil
}
