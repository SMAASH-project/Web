package repository

import (
	"context"
	"smaash-web/internal/database"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	Create(c context.Context, user *models.User) error
	ReadAll(context.Context) ([]models.User, error)
	ReadByID(c context.Context, id uint) (*models.User, error)
	ReadByEmail(c context.Context, email string) (*models.User, error)
	Update(c context.Context, user models.User) error
	Delete(c context.Context, id uint) error
}

type GormUserRepo struct {
	DB *gorm.DB
}

func NewGormUserRepo() UserRepository {
	db := database.NewGormDBConn().Init()
	return &GormUserRepo{DB: db}
}

func (u GormUserRepo) Create(c context.Context, user *models.User) error {
	return gorm.G[models.User](u.DB).Create(c, user)
}

func (u GormUserRepo) ReadAll(c context.Context) ([]models.User, error) {
	users, err := gorm.G[models.User](u.DB).Find(c)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func (u GormUserRepo) ReadByID(c context.Context, id uint) (*models.User, error) {
	user, err := gorm.G[models.User](u.DB).Where("id = ?", id).First(c)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (u GormUserRepo) ReadByEmail(c context.Context, email string) (*models.User, error) {
	user, err := gorm.G[models.User](u.DB).Where("email = ?", email).First(c)
	if err != nil {
		return nil, err
	}
	return &user, nil
}

func (u GormUserRepo) Update(c context.Context, user models.User) error {
	_, err := gorm.G[models.User](u.DB).Where("id = ?", user.ID).Updates(c, user)
	return err
}

func (u GormUserRepo) Delete(c context.Context, id uint) error {
	_, err := gorm.G[models.User](u.DB).Where("id = ?", id).Delete(c)
	return err
}
