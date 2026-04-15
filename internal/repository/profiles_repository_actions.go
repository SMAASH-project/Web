package repository

import (
	"context"
	"log"
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
<<<<<<< HEAD
		Select("characters.*").
		Table("characters").
=======
		Model(&models.Character{}).
>>>>>>> f17dc65 (some bugs fixed)
		Joins("LEFT JOIN profile_character ON characters.id = profile_character.character_id AND profile_character.player_profile_id = ?", playerID).
		Where("profile_character.character_id IS NULL").
		Find(&result).Error

	return result, err
}

func (pra ProfilesRepositoryActions) CreateWithBaseCharacters(c context.Context, profile *models.PlayerProfile) error {
	return pra.conn.Transaction(func(tx *gorm.DB) error {
		log.Printf("profiles.create tx start: user_id=%d display_name=%q", profile.UserID, profile.DisplayName)

		if err := gorm.G[models.PlayerProfile](tx).Create(c, profile); err != nil {
			log.Printf("profiles.create tx profile insert failed: err=%v", err)
			return err
		}

		// These characters are seeded into the database, so they're guaranteed to have ids of 1 and 2
		characters, _ := gorm.G[models.Character](tx).Where("id IN (1, 2)").Find(c)

		if err := tx.
			Model(profile).
			Association("Characters").
			Append(characters); err != nil {
			return err
		}

		return nil
	})
}
