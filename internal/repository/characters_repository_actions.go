package repository

import (
	"context"
	"slices"
	"smaash-web/internal/models"
	"smaash-web/internal/utils"

	"gorm.io/gorm"
)

type CharactersRepository interface {
	BaseRepository[models.Character]
	ReadAllWithOwnedPaginated(c context.Context, profileID uint, page int, pageSize int, preloads ...string) ([]models.CharactersWithOwned, error)
	AppendCategories(c context.Context, character *models.Character, category_ids ...uint) error
	ReadFilteredByImplemented(c context.Context, preloads ...string) ([]models.Character, error)
}

type CharactersRepositoryActions struct {
	BaseRepository[models.Character]
	conn *gorm.DB
}

func NewCharactersRepositoryActions(conn *gorm.DB) CharactersRepository {
	return CharactersRepositoryActions{conn: conn, BaseRepository: NewBaseRepositoryActions[models.Character](conn)}
}

func (cra CharactersRepositoryActions) ReadAllWithOwnedPaginated(c context.Context, profileID uint, page int, pageSize int, preloads ...string) ([]models.CharactersWithOwned, error) {
	var owned []models.Character
	var notOwned []models.Character

	qOwned := cra.conn.
		WithContext(c).
		Scopes(Paginate(pageSize/2*(page-1), pageSize/2)).
		Table("characters AS c").
		Joins("JOIN purchases AS p ON p.character_id = c.id").
		Where("p.player_profile_id = ?", profileID)

	for _, pr := range preloads {
		qOwned = qOwned.Preload(pr)
	}
	err := qOwned.Find(&owned).Error

	if err != nil {
		return nil, err
	}

	qNotOwned := cra.conn.
		WithContext(c).
		Scopes(Paginate(pageSize/2*(page-1), pageSize/2)).
		Table("characters AS c").
		Joins("JOIN purchases AS p ON p.character_id = c.id").
		Where("p.player_profile_id <> ?", profileID)

	for _, pr := range preloads {
		qNotOwned = qNotOwned.Preload(pr)
	}

	err = qNotOwned.Find(&notOwned).Error

	if err != nil {
		return nil, err
	}

	return slices.Concat(
		utils.Map(owned, func(c models.Character) models.CharactersWithOwned {
			return models.CharactersWithOwned{Character: c, Owned: true}
		}),
		utils.Map(notOwned, func(c models.Character) models.CharactersWithOwned {
			return models.CharactersWithOwned{Character: c, Owned: false}
		}),
	), nil
}

func (cra CharactersRepositoryActions) AppendCategories(c context.Context, character *models.Character, category_ids ...uint) error {
	categories := utils.Map(category_ids, func(id uint) models.Category { return models.Category{Model: gorm.Model{ID: id}} })
	return cra.conn.Model(character).Association("Categories").Append(categories)
}

func (cra CharactersRepositoryActions) ReadFilteredByImplemented(c context.Context, preloads ...string) ([]models.Character, error) {
	query := gorm.G[models.Character](cra.conn).Where("implemented = true")
	for _, preload := range preloads {
		query = query.Preload(preload, nil)
	}

	return query.Find(c)
}
