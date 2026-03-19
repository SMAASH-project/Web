package dtos

import (
	"smaash-web/internal/models"
	"time"

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
	PlayerProfileID uint   `json:"player_profile_id" binding:"required"`
	ItemID          uint   `json:"item_id" binding:"required"`
	Count           int    `json:"count" binding:"required"`
	Date            string `json:"date" binding:"required"`
}

type PurchaseUpdateDTO struct {
	ID              uint   `json:"id" binding:"required"`
	PlayerProfileID uint   `json:"player_profile_id" binding:"required"`
	ItemID          uint   `json:"item_id" binding:"required"`
	Count           int    `json:"count" binding:"required"`
	Date            string `json:"date" binding:"required"`
}

func PurchaseToDTO(p models.Purchase) PurchaseReadDTO {
	return PurchaseReadDTO{
		ID:      p.ID,
		Item:    p.Item.Name,
		Count:   p.Count,
		Total:   int(p.Item.Price) * p.Count,
		Profile: p.PlayerProfile.DisplayName,
		Date:    p.Date.Format(DateFormat),
	}
}

func CreateDTOToPurchase(dto PurchaseCreateDTO) (*models.Purchase, error) {
	date, err := time.Parse(DateFormat, dto.Date)
	if err != nil {
		return nil, ErrDateFormatIncorrect
	}

	return &models.Purchase{
		PlayerProfileID: dto.PlayerProfileID,
		ItemID:          dto.ItemID,
		Count:           dto.Count,
		Date:            date,
	}, nil
}

func UpdateDTOToPurchase(dto PurchaseUpdateDTO) (*models.Purchase, error) {
	date, err := time.Parse(DateFormat, dto.Date)
	if err != nil {
		return nil, ErrDateFormatIncorrect
	}

	return &models.Purchase{
		Model:           gorm.Model{ID: dto.ID},
		PlayerProfileID: dto.PlayerProfileID,
		ItemID:          dto.ItemID,
		Count:           dto.Count,
		Date:            date,
	}, nil
}
