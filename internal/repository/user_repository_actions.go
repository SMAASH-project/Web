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
	Unban(c context.Context, userID uint) error
	Promote(c context.Context, userID uint, targetRole string) error
	Demote(c context.Context, userID uint) error
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

func (ura UserRepositoryActions) Unban(c context.Context, userID uint) error {
	return ura.conn.Model(&models.User{}).Where("id = ?", userID).Updates(map[string]any{
		"is_banned":    false,
		"banned_until": nil,
	}).Error
}

func (ura UserRepositoryActions) Promote(c context.Context, userID uint, targetRole string) error {
	role, err := gorm.G[models.Role](ura.conn).Where("name = ?", targetRole).First(c)
	if err != nil {
		return err
	}

	if _, err = gorm.G[models.User](ura.conn).Updates(c, models.User{Model: gorm.Model{ID: userID}, RoleID: role.ID}); err != nil {
		return err
	}

	return nil
}

func (ura UserRepositoryActions) Demote(c context.Context, userID uint) error {
	role, err := gorm.G[models.Role](ura.conn).Where("name = ?", "user").First(c)
	if err != nil {
		return err
	}

	if _, err := gorm.G[models.User](ura.conn).Updates(c, models.User{Model: gorm.Model{ID: userID}, RoleID: role.ID}); err != nil {
		return err
	}

	return nil
}
