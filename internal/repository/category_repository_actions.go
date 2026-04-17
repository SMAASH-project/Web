package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	BaseRepository[models.Category]
	ReadByName(context.Context, string) (*models.Category, error)
}

type CategoryRepositoryActions struct {
	BaseRepository[models.Category]
	conn *gorm.DB
}

func NewCategoryRepositoryActions(conn *gorm.DB) CategoryRepository {
	return &CategoryRepositoryActions{
		BaseRepository: NewBaseRepositoryActions[models.Category](conn),
		conn:           conn,
	}
}

func (cra CategoryRepositoryActions) ReadByName(c context.Context, name string) (*models.Category, error) {
	result, err := gorm.G[models.Category](cra.conn).Where("name = ?", name).First(c)
	return &result, err
}
