package repository

import (
	"context"
	"smaash-web/internal/database"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PlayerProfileRepository interface {
	Create(c context.Context, profile *models.PlayerProfile) error
	ReadAll(c context.Context) ([]models.PlayerProfile, error)
	ReadByID(c context.Context, id uint) (models.PlayerProfile, error)
	ReadByUserID(c context.Context, userId uint) (models.PlayerProfile, error)
	Update(c context.Context, profile models.PlayerProfile) error
	Delete(c context.Context, id uint) error
}

type GormPlayerProfileRepo struct {
	DB *gorm.DB
}

func NewGormPlayerProfileRepo() PlayerProfileRepository {
	db := database.NewGormDBConn().Init()
	return &GormPlayerProfileRepo{DB: db}
}

func (p GormPlayerProfileRepo) Create(c context.Context, profile *models.PlayerProfile) error {
	return gorm.G[models.PlayerProfile](p.DB).Create(c, profile)
}

func (p GormPlayerProfileRepo) ReadAll(c context.Context) ([]models.PlayerProfile, error) {
	return gorm.G[models.PlayerProfile](p.DB).Find(c)
}

func (p GormPlayerProfileRepo) ReadByID(c context.Context, id uint) (models.PlayerProfile, error) {
	return gorm.G[models.PlayerProfile](p.DB).Where("id = ?", id).First(c)
}

func (p GormPlayerProfileRepo) ReadByUserID(c context.Context, userID uint) (models.PlayerProfile, error) {
	return gorm.G[models.PlayerProfile](p.DB).Where("user_id = ?", userID).First(c)
}

func (p GormPlayerProfileRepo) Update(c context.Context, profile models.PlayerProfile) error {
	_, err := gorm.G[models.PlayerProfile](p.DB).Updates(c, profile)
	return err
}

func (p GormPlayerProfileRepo) Delete(c context.Context, id uint) error {
	_, err := gorm.G[models.PlayerProfile](p.DB).Where("id = ?", id).Delete(c)
	return err
}
