package repository

import (
	"context"
	"slices"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type BaseRepository[T models.Model] interface {
	Create(context.Context, *T) error
	ReadAll(context.Context, ...string) ([]T, error)
	ReadAllWithParams(c context.Context, params QueryParams) ([]T, error)
	ReadByID(context.Context, uint, ...string) (T, error)
	Update(context.Context, T) error
	UpdateOne(context.Context, uint, string, any) error
	Delete(context.Context, uint) error
}

type BaseRepositoryActions[T models.Model] struct {
	Conn *gorm.DB
}

func NewBaseRepositoryActions[T models.Model](conn *gorm.DB) BaseRepository[T] {
	return &BaseRepositoryActions[T]{
		Conn: conn,
	}
}

func (bra BaseRepositoryActions[T]) Create(c context.Context, value *T) error {
	return gorm.G[T](bra.Conn).Create(c, value)
}

func (bra BaseRepositoryActions[T]) ReadAll(c context.Context, preloads ...string) ([]T, error) {
	query := gorm.G[T](bra.Conn).Where("1 = 1")
	for _, preload := range preloads {
		query = query.Preload(preload, nil)
	}
	return query.Find(c)
}

func (bra BaseRepositoryActions[T]) ReadByID(c context.Context, id uint, preloads ...string) (T, error) {
	query := gorm.G[T](bra.Conn).Where("id = ?", id)
	for _, preload := range preloads {
		query = query.Preload(preload, nil)
	}
	return query.First(c)
}

func (bra BaseRepositoryActions[T]) Update(c context.Context, value T) error {
	_, err := gorm.G[T](bra.Conn).Where("id = ?", value.GetID()).Updates(c, value)
	return err
}

func (bra BaseRepositoryActions[T]) UpdateOne(c context.Context, id uint, field string, value any) error {
	_, err := gorm.G[T](bra.Conn).Where("id = ?", id).Update(c, field, value)
	return err
}

func (bra BaseRepositoryActions[T]) Delete(c context.Context, id uint) error {
	_, err := gorm.G[T](bra.Conn).Where("id = ?", id).Delete(c)
	return err
}

type QueryParams struct {
	Page              int
	PageSize          int
	SortBy            string
	AllowedSortFileds []string
	Desc              *bool
	Preloads          []string
}

func (bra BaseRepositoryActions[T]) ReadAllWithParams(c context.Context, params QueryParams) ([]T, error) {
	var result []T
	query := bra.Conn.Model(new(T)).Scopes(Paginate(params.PageSize*(params.Page-1), params.PageSize))
	for _, preload := range params.Preloads {
		query = query.Preload(preload)
	}

	if params.SortBy != "" && slices.Contains(params.AllowedSortFileds, params.SortBy) {
		if params.Desc != nil && *params.Desc {
			query = query.Order(params.SortBy + " DESC")
		} else {
			query = query.Order(params.SortBy)
		}
	}

	err := query.Find(&result).Error
	return result, err
}

func Paginate(offset, limit int) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		return db.Offset(offset).Limit(limit)
	}
}
