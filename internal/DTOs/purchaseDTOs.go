package dtos

import (
	"smaash-web/internal/models"
	"time"

	"gorm.io/gorm"
)

type PurchaseReadDTO struct {
	ID      uint
	Item    string
	Count   int
	Total   int
	Profile string
	Date    string
}

type PurchaseCreateDTO struct {
	PlayerProfileID uint
	ItemID          uint
	Count           int
	Date            string
}

type PurchaseUpdateDTO struct {
	ID              uint
	PlayerProfileID uint
	ItemID          uint
	Count           int
	Date            string
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
