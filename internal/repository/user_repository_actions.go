package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type UserRepository interface {
	BaseRepository[models.User]
	ReadByEmail(context.Context, string, ...string) (models.User, error)
	ReadUsersProfiles(c context.Context, userID uint) ([]models.PlayerProfile, error)
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

func (ura UserRepositoryActions) ReadByEmail(c context.Context, email string, preloads ...string) (models.User, error) {
	query := gorm.G[models.User](ura.conn).Where("email = ?", email)
	for _, preload := range preloads {
		query = query.Preload(preload, nil)
	}
	return query.First(c)
}

func (ura UserRepositoryActions) ReadUsersProfiles(c context.Context, userID uint) ([]models.PlayerProfile, error) {
	return gorm.G[models.PlayerProfile](ura.conn).Where("user_id = ?", userID).Find(c)
}
