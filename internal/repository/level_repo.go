package repository

import (
	"context"
	"smaash-web/internal/database"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type LevelRepository interface {
	Create(c context.Context, level *models.Level) error
	ReadAll(context.Context) ([]models.Level, error)
	ReadByID(c context.Context, id uint) (*models.Level, error)
	Update(c context.Context, level *models.Level) error
	Delete(c context.Context, id uint) error
}

type GormLevelRepo struct {
	DB *gorm.DB
}

func NewGormLevelRepo() LevelRepository {
	db := database.NewGormDBConn().Init()
	return &GormLevelRepo{DB: db}
}

func (l GormLevelRepo) Create(c context.Context, level *models.Level) error {
	return gorm.G[models.Level](l.DB).Create(c, level)
}

func (l GormLevelRepo) ReadAll(c context.Context) ([]models.Level, error) {
	levels, err := gorm.G[models.Level](l.DB).Find(c)
	if err != nil {
		return nil, err
	}
	return levels, nil
}

func (l GormLevelRepo) ReadByID(c context.Context, id uint) (*models.Level, error) {
	level, err := gorm.G[models.Level](l.DB).Where("id = ?", id).First(c)
	if err != nil {
		return nil, err
	}
	return &level, nil
}

func (l GormLevelRepo) Update(c context.Context, level *models.Level) error {
	_, err := gorm.G[models.Level](l.DB).Where("id = ?", level.ID).Updates(c, *level)
	return err
}

func (l GormLevelRepo) Delete(c context.Context, id uint) error {
	_, err := gorm.G[models.Level](l.DB).Where("id = ?", id).Delete(c)
	return err
}
