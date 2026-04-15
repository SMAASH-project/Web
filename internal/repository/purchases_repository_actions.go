package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PurchasesRepository interface {
	BaseRepository[models.Purchase]
	MakePurchase(c context.Context, purchase models.Purchase) (*models.Purchase, error)
}

type PurchasesRepositoryActions struct {
	BaseRepository[models.Purchase]
	conn *gorm.DB
}

func NewPurchasesRepositoryActions(conn *gorm.DB) PurchasesRepository {
	return PurchasesRepositoryActions{conn: conn}
}

func (pra PurchasesRepositoryActions) MakePurchase(c context.Context, purchase models.Purchase) (*models.Purchase, error) {
	var result models.Purchase
	err := pra.conn.Transaction(func(tx *gorm.DB) error {
		player, err := gorm.G[models.PlayerProfile](tx).Where("id = ?", purchase.PlayerProfileID).First(c)
		if err != nil {
			return err
		}

		if err := gorm.G[models.Purchase](tx).Create(c, &purchase); err != nil {
			return err
		}

		err = tx.
			WithContext(c).
			Model(&models.Purchase{}).
			Where("id = ?", purchase.ID).
			Preload("PlayerProfile").
			Preload("Character").
			First(&result).Error
		if err != nil {
			return err
		}

		player.Coins -= int64(result.Character.Price)
		if _, err := gorm.G[models.PlayerProfile](tx).Where("id = ?", player.ID).Updates(c, player); err != nil {
			return err
		}

		if err := tx.Model(&player).Association("Characters").Append(&models.Character{Model: gorm.Model{ID: purchase.CharacterID}}); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	return &result, nil
}
