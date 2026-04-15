package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type ProfilesRepository interface {
	BaseRepository[models.PlayerProfile]
	ReadByUserID(context.Context, uint) ([]models.PlayerProfile, error)
	HardDelete(context.Context, uint) error
	ReadNotOwnedCharacters(context.Context, uint) ([]models.Character, error)
	CreateWithBaseCharacters(context.Context, *models.PlayerProfile) error
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

func (pra ProfilesRepositoryActions) HardDelete(c context.Context, id uint) error {
	return pra.conn.Unscoped().Model(&models.PlayerProfile{}).Where("id = ?", id).Delete(&models.PlayerProfile{}).Error
}

func (pra ProfilesRepositoryActions) ReadNotOwnedCharacters(c context.Context, playerID uint) ([]models.Character, error) {
	var result []models.Character
	err := pra.conn.
		Select("characters.*").
		Table("characters").
		Joins("LEFT JOIN player_characters ON characters.id = player_characters.character_id AND player_characters.player_profile_id = ?", playerID).
		Where("player_characters.character_id IS NULL").
		Find(&result).Error

	return result, err
}

func (pra ProfilesRepositoryActions) CreateWithBaseCharacters(c context.Context, profile *models.PlayerProfile) error {
	return pra.conn.Transaction(func(tx *gorm.DB) error {
		if err := gorm.G[models.PlayerProfile](pra.conn).Create(c, profile); err != nil {
			return err
		}

		// These characters are seeded into the database, so they're guaranteed to have ids of 1 and 2
		if err := pra.conn.
			Model(profile).
			Association("Characters").
			Append([]models.Character{
				{Model: gorm.Model{ID: 1}},
				{Model: gorm.Model{ID: 2}},
			}); err != nil {
			return err
		}

		return nil
	})
}
