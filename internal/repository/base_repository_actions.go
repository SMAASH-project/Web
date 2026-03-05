package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type BaseRepository[T models.Model] interface {
	Create(context.Context, *T) error
	ReadAll(context.Context) ([]T, error)
	ReadByID(context.Context, uint) (T, error)
	Update(context.Context, T) error
	Delete(context.Context, uint) error
}

type BaseRepositoryActions[T models.Model] struct {
	conn *gorm.DB
}

func NewBaseRepositoryActions[T models.Model](conn *gorm.DB) BaseRepository[T] {
	return &BaseRepositoryActions[T]{
		conn: conn,
	}
}

func (bra BaseRepositoryActions[T]) Create(c context.Context, value *T) error {
	return gorm.G[T](bra.conn).Create(c, value)
}

func (bra BaseRepositoryActions[T]) ReadAll(c context.Context) ([]T, error) {
	return gorm.G[T](bra.conn).Find(c)
}

func (bra BaseRepositoryActions[T]) ReadByID(c context.Context, id uint) (T, error) {
	return gorm.G[T](bra.conn).Where("id = ?", id).First(c)
}

func (bra BaseRepositoryActions[T]) Update(c context.Context, value T) error {
	_, err := gorm.G[T](bra.conn).Where("id = ?", value.GetID()).Updates(c, value)
	return err
}

func (bra BaseRepositoryActions[T]) Delete(c context.Context, id uint) error {
	_, err := gorm.G[T](bra.conn).Where("id = ?", id).Delete(c)
	return err
}
