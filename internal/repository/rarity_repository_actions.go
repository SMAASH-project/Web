package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type RarityRepository interface {
	BaseRepository[models.Rarity]
	ReadByName(context.Context, string) (models.Rarity, error)
}

type RarityRepositoryActions struct {
	BaseRepository[models.Rarity]
	conn *gorm.DB
}

func NewRarityRepositoryActions(conn *gorm.DB) RarityRepository {
	return RarityRepositoryActions{
		conn:           conn,
		BaseRepository: NewBaseRepositoryActions[models.Rarity](conn),
	}
}

func (rra RarityRepositoryActions) ReadByName(c context.Context, name string) (models.Rarity, error) {
	return gorm.G[models.Rarity](rra.conn).Where("name = ?", name).First(c)
}
