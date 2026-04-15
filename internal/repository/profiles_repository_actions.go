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
		Select("characters.*").
		Table("characters").
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

		log.Printf("profiles.create tx profile inserted: profile_id=%d", profile.ID)

		// Starter characters are seeded with ids 1 and 2.
		joinRows := []map[string]any{
			{"player_profile_id": profile.ID, "character_id": 1},
			{"player_profile_id": profile.ID, "character_id": 2},
		}

		res := tx.Table("profile_character").Create(&joinRows)
		if res.Error != nil {
			log.Printf("profiles.create tx join insert failed: profile_id=%d err=%v", profile.ID, res.Error)
			return res.Error
		}

		if res.RowsAffected != int64(len(joinRows)) {
			log.Printf("profiles.create tx join insert unexpected rows: profile_id=%d expected=%d affected=%d", profile.ID, len(joinRows), res.RowsAffected)
			return gorm.ErrInvalidData
		}

		log.Printf("profiles.create tx join insert ok: profile_id=%d affected=%d", profile.ID, res.RowsAffected)

		if err := tx.First(&models.PlayerProfile{}, profile.ID).Error; err != nil {
			log.Printf("profiles.create tx profile re-read failed: profile_id=%d err=%v", profile.ID, err)
			return err
		}

		return nil
	})
}
