package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type BaseRepository[T models.Model] interface {
	Create(context.Context, *T) error
	ReadAll(context.Context, ...string) ([]T, error)
	ReadByID(context.Context, uint, ...string) (T, error)
	Update(context.Context, T) error
	UpdateOne(context.Context, uint, string, any) error
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

func (bra BaseRepositoryActions[T]) ReadAll(c context.Context, preloads ...string) ([]T, error) {
	query := gorm.G[T](bra.conn).Where("1 = 1")
	for _, preload := range preloads {
		query = query.Preload(preload, nil)
	}
	return query.Find(c)
}

func (bra BaseRepositoryActions[T]) ReadByID(c context.Context, id uint, preloads ...string) (T, error) {
	query := gorm.G[T](bra.conn).Where("id = ?", id)
	for _, preload := range preloads {
		query = query.Preload(preload, nil)
	}
	return query.First(c)
}

func (bra BaseRepositoryActions[T]) Update(c context.Context, value T) error {
	_, err := gorm.G[T](bra.conn).Where("id = ?", value.GetID()).Updates(c, value)
	return err
}

func (bra BaseRepositoryActions[T]) UpdateOne(c context.Context, id uint, field string, value any) error {
	_, err := gorm.G[T](bra.conn).Where("id = ?", id).Update(c, field, value)
	return err
}

func (bra BaseRepositoryActions[T]) Delete(c context.Context, id uint) error {
	_, err := gorm.G[T](bra.conn).Where("id = ?", id).Delete(c)
	return err
}
