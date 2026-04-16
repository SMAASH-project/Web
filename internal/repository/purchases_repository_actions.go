package repository

import (
	"context"
	"errors"
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
	return PurchasesRepositoryActions{BaseRepository: NewBaseRepositoryActions[models.Purchase](conn), conn: conn}
}

var ErrNotEnoughCoins = errors.New("Player doesn't have enough coins to purchase this character")

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

		if result.Character.Price > uint(player.Coins) {
			return ErrNotEnoughCoins
		}

		player.Coins -= int64(result.Character.Price)
		if err := tx.Model(&models.PlayerProfile{}).
			Where("id = ?", player.ID).
			Updates(map[string]any{"coins": player.Coins}).Error; err != nil {
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
