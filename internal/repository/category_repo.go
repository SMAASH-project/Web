package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type CategoryRepository interface {
	Create(context.Context, *models.Category) error
	ReadAll(context.Context) ([]models.Category, error)
	ReadByID(context.Context, uint) (models.Category, error)
	ReadByName(context.Context, string) (models.Category, error)
	Update(context.Context, models.Category) error
	Delete(context.Context, uint) error
}

type GormCategoryRepo struct {
	DB *gorm.DB
}

func NewGormCategoryRepo(conn *gorm.DB) CategoryRepository {
	return &GormCategoryRepo{DB: conn}
}

func (gcr GormCategoryRepo) Create(c context.Context, category *models.Category) error {
	return gorm.G[models.Category](gcr.DB).Create(c, category)
}

func (gcr GormCategoryRepo) ReadAll(c context.Context) ([]models.Category, error) {
	return gorm.G[models.Category](gcr.DB).Find(c)
}

func (grr GormCategoryRepo) ReadByID(c context.Context, id uint) (models.Category, error) {
	return gorm.G[models.Category](grr.DB).Where("id = ?", id).First(c)
}

func (grr GormCategoryRepo) ReadByName(c context.Context, name string) (models.Category, error) {
	return gorm.G[models.Category](grr.DB).Where("name = ?", name).First(c)
}

func (grr GormCategoryRepo) Update(c context.Context, category models.Category) error {
	_, err := gorm.G[models.Category](grr.DB).Where("id = ?", category.ID).Updates(c, category)
	return err
}

func (grr GormCategoryRepo) Delete(c context.Context, id uint) error {
	_, err := gorm.G[models.Category](grr.DB).Where("id = ?", id).Delete(c)
	return err
}
