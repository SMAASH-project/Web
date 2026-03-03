package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	BaseRepository[models.User]
	ReadByEmail(context.Context, string) (models.User, error)
}

type UserRepositoryActions struct {
	conn *gorm.DB
	BaseRepository[models.User]
}

func NewUserRepositoryActions(conn *gorm.DB) UserRepository {
	return &UserRepositoryActions{
		conn:           conn,
		BaseRepository: NewBaseRepositoryActions[models.User](conn),
	}
}

func (ura UserRepositoryActions) ReadByEmail(c context.Context, email string) (models.User, error) {
	return gorm.G[models.User](ura.conn).Where("email = ?", email).First(c)
}
