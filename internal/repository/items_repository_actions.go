package repository

import (
	"context"
	"slices"
	"smaash-web/internal/models"
	"smaash-web/internal/utils"

	"gorm.io/gorm"
)

type Itemsepository interface {
	BaseRepository[models.Item]
	ReadAllWithOwnedPaginated(c context.Context, userID uint, page int, pageSize int, preloads ...string) ([]models.ItemsWithOwned, error)
}

type ItemsRepositoryActions struct {
	BaseRepository[models.Item]
	conn *gorm.DB
}

func NewItemsRepositoryActions(conn *gorm.DB) Itemsepository {
	return ItemsRepositoryActions{conn: conn}
}

func (pra ItemsRepositoryActions) ReadAllWithOwnedPaginated(c context.Context, profileID uint, page int, pageSize int, preloads ...string) ([]models.ItemsWithOwned, error) {
	var owned []models.Item
	var notOwned []models.Item

	qOwned := pra.conn.
		WithContext(c).
		Scopes(Paginate(pageSize/2*(page-1), pageSize/2)).
		Table("items AS i").
		Joins("JOIN purchases AS p ON p.item_id = i.id").
		Where("p.player_profile_id = ?", profileID)

	for _, pr := range preloads {
		qOwned = qOwned.Preload(pr)
	}
	err := qOwned.Find(&owned).Error

	if err != nil {
		return nil, err
	}

	qNotOwned := pra.conn.
		WithContext(c).
		Scopes(Paginate(pageSize/2*(page-1), pageSize/2)).
		Table("items AS i").
		Joins("JOIN purchases AS p ON p.item_id = i.id").
		Where("p.player_profile_id <> ?", profileID)

	for _, pr := range preloads {
		qNotOwned = qNotOwned.Preload(pr)
	}

	err = qNotOwned.Find(&notOwned).Error

	if err != nil {
		return nil, err
	}

	return slices.Concat(
		utils.Map(owned, func(i models.Item) models.ItemsWithOwned { return models.ItemsWithOwned{Item: i, Owned: true} }),
		utils.Map(notOwned, func(i models.Item) models.ItemsWithOwned { return models.ItemsWithOwned{Item: i, Owned: false} }),
	), nil
}
