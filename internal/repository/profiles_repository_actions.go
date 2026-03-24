package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type ProfilesRepository interface {
	BaseRepository[models.PlayerProfile]
	ReadByUserID(context.Context, uint) ([]models.PlayerProfile, error)
}

type ProfilesRepositoryActions struct {
	BaseRepository[models.PlayerProfile]
	conn *gorm.DB
}

func NewProfilesRepositoryActions(conn *gorm.DB) ProfilesRepository {
	return ProfilesRepositoryActions{
		conn:           conn,
		BaseRepository: NewBaseRepositoryActions[models.PlayerProfile](conn),
	}
}

func (pra ProfilesRepositoryActions) ReadByUserID(c context.Context, userID uint) ([]models.PlayerProfile, error) {
	return gorm.G[models.PlayerProfile](pra.conn).Where("user_id = ?", userID).Find(c)
}
