package repository

import (
	"context"
	"smaash-web/internal/database"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type PlayerProfileRepository interface {
	Create(c context.Context, profile *models.PlayerProfile) error
	ReadById(c context.Context, id uint) (*models.PlayerProfile, error)
	ReadByUserId(c context.Context, userId uint) (*models.PlayerProfile, error)
	Update(c context.Context, profile *models.PlayerProfile) error
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
	return p.DB.WithContext(c).Create(profile).Error
}

func (p GormPlayerProfileRepo) ReadById(c context.Context, id uint) (*models.PlayerProfile, error) {
	var profile models.PlayerProfile
	err := p.DB.WithContext(c).Preload("User").First(&profile, id).Error
	return &profile, err
}

func (p GormPlayerProfileRepo) ReadByUserId(c context.Context, userID uint) (*models.PlayerProfile, error) {
	var profile models.PlayerProfile
	err := p.DB.WithContext(c).
		Preload("User").
		Where("user_id = ?", userID).
		First(&profile).Error
	return &profile, err
}

func (p GormPlayerProfileRepo) Update(c context.Context, profile *models.PlayerProfile) error {
	return p.DB.WithContext(c).Save(profile).Error
}

func (p GormPlayerProfileRepo) Delete(c context.Context, id uint) error {
	return p.DB.WithContext(c).Delete(&models.PlayerProfile{}, id).Error
}
