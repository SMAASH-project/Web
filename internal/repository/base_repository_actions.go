package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type BaseRepositoryActions[T models.Model] struct {
	Create   func(context.Context, *T) error
	ReadAll  func(context.Context) ([]T, error)
	ReadByID func(context.Context, uint) (T, error)
	Update   func(context.Context, T) error
	Delete   func(context.Context, uint) error
}

func NewBaseRepositoryActions[T models.Model](conn *gorm.DB) *BaseRepositoryActions[T] {
	return &BaseRepositoryActions[T]{
		Create: func(c context.Context, value *T) error {
			return gorm.G[T](conn).Create(c, value)
		},
		ReadAll: func(c context.Context) ([]T, error) {
			return gorm.G[T](conn).Find(c)
		},
		ReadByID: func(c context.Context, id uint) (T, error) {
			return gorm.G[T](conn).Where("id = ?", id).First(c)
		},
		Update: func(c context.Context, value T) error {
			_, err := gorm.G[T](conn).Where("id = ?", value.GetID()).Updates(c, value)
			return err
		},
		Delete: func(c context.Context, id uint) error {
			_, err := gorm.G[T](conn).Where("id = ?", id).Delete(c)
			return err
		},
	}
}
