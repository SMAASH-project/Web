package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type RolesRepository interface {
	BaseRepository[models.Role]
	ReadByName(context.Context, string) (models.Role, error)
}

type RolesRepositoryActions struct {
	BaseRepository[models.Role]
	conn *gorm.DB
}

func NewRolesRepositoryActions(conn *gorm.DB) RolesRepository {
	return RolesRepositoryActions{conn: conn}
}

func (rra RolesRepositoryActions) ReadByName(c context.Context, name string) (models.Role, error) {
	return gorm.G[models.Role](rra.conn).Where("name = ?", name).First(c)
}
