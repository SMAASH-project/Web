package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type RoleRepository interface {
	Create(context.Context, *models.Role) error
	ReadAll(context.Context) ([]models.Role, error)
	ReadByID(context.Context, uint) (models.Role, error)
	ReadByName(context.Context, string) (models.Role, error)
	Update(context.Context, models.Role) error
	Delete(context.Context, uint) error
}

type GormRoleRepo struct {
	DB *gorm.DB
}

func NewGormRoleRepo(conn *gorm.DB) RoleRepository {
	return &GormRoleRepo{DB: conn}
}

func (grr GormRoleRepo) Create(c context.Context, role *models.Role) error {
	return gorm.G[models.Role](grr.DB).Create(c, role)
}

func (grr GormRoleRepo) ReadAll(c context.Context) ([]models.Role, error) {
	return gorm.G[models.Role](grr.DB).Find(c)
}

func (grr GormRoleRepo) ReadByID(c context.Context, id uint) (models.Role, error) {
	return gorm.G[models.Role](grr.DB).Where("id = ?", id).First(c)
}

func (grr GormRoleRepo) ReadByName(c context.Context, name string) (models.Role, error) {
	return gorm.G[models.Role](grr.DB).Where("name = ?", name).First(c)
}

func (grr GormRoleRepo) Update(c context.Context, role models.Role) error {
	_, err := gorm.G[models.Role](grr.DB).Where("id = ?", role.ID).Updates(c, role)
	return err
}

func (grr GormRoleRepo) Delete(c context.Context, id uint) error {
	_, err := gorm.G[models.Role](grr.DB).Where("id = ?", id).Delete(c)
	return err
}
