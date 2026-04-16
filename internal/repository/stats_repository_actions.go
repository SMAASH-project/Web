package repository

import (
	"context"
	"smaash-web/internal/models"

	"gorm.io/gorm"
)

type StatsRepository interface {
	ReadMostActivePlayers(context.Context) ([]*models.TopPlayersResult, error)
	ReadMostPopularCharacters(context.Context) ([]*models.TopCharactersResult, error)
	ReadFavouriteCharactersOfPlayer(context.Context, uint) ([]*models.FavouriteCharacterResult, error)
	ReadMostPlayedLevels(context.Context) ([]*models.TopLevelsResult, error)
	ReadPlayersWithMostWins(context.Context) ([]*models.BestPlayersResult, error)
}

type StatsRepositoryActions struct {
	conn *gorm.DB
}

func NewStatsRepositoryActions(conn *gorm.DB) StatsRepository {
	return StatsRepositoryActions{conn: conn}
}

func (sra StatsRepositoryActions) ReadMostActivePlayers(c context.Context) ([]*models.TopPlayersResult, error) {
	var result []*models.TopPlayersResult
	err := sra.conn.
		WithContext(c).
		Model(&models.PlayerProfile{}).
		Select("player_profiles.*, COUNT(match_participations.player_profile_id) AS count_of_matches").
		Joins("JOIN match_participations ON match_participations.player_profile_id = player_profiles.id").
		Group("player_profiles.id").
		Order("count_of_matches DESC").
		Scan(&result).Error
	return result, err
}

func (sra StatsRepositoryActions) ReadMostPopularCharacters(c context.Context) ([]*models.TopCharactersResult, error) {
	var result []*models.TopCharactersResult
	err := sra.conn.
		WithContext(c).
		Model(&models.Character{}).
		Select("characters.*, COUNT(characters.id) AS count_of_purchases").
		Joins("JOIN purchases ON purchases.character_id = characters.id").
		Group("characters.id").
		Order("count_of_purchases DESC").
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	// I hate manual preloading
	for _, topResult := range result {
		var categories []*models.Category
		err := sra.conn.
			Table("categories").
			Joins("JOIN character_category ON character_category.category_id = categories.id").
			Where("character_category.character_id = ?", topResult.ID).
			Find(&categories).Error
		if err != nil {
			return nil, err
		}
		topResult.Categories = categories

		var rarity models.Rarity
		err = sra.conn.
			Table("rarities").
			Joins("JOIN characters ON characters.rarity_id = rarities.id").
			Where("rarities.id = ?", topResult.RarityID).
			Find(&rarity).Error
		if err != nil {
			return nil, err
		}
		topResult.Rarity = rarity
	}

	return result, nil
}

func (sra StatsRepositoryActions) ReadFavouriteCharactersOfPlayer(c context.Context, id uint) ([]*models.FavouriteCharacterResult, error) {
	var result []*models.FavouriteCharacterResult
	err := sra.conn.
		WithContext(c).
		Model(&models.Character{}).
		Select("characters.*, COUNT(match_participations.character_id) AS count_of_plays").
		Joins("JOIN match_participations ON match_participations.character_id = characters.id").
		Joins("JOIN player_profiles ON match_participations.player_profile_id = player_profiles.id").
		Where("match_participations.player_profile_id = ?", id).
		Group("characters.id").
		Order("count_of_plays").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (sra StatsRepositoryActions) ReadMostPlayedLevels(c context.Context) ([]*models.TopLevelsResult, error) {
	var result []*models.TopLevelsResult
	err := sra.conn.
		WithContext(c).
		Model(&models.Level{}).
		Select("levels.*, COUNT(matches.level_id) AS count_of_plays").
		Joins("JOIN matches ON matches.level_id = levels.id").
		Group("levels.id").
		Order("count_of_plays DESC").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (sra StatsRepositoryActions) ReadPlayersWithMostWins(c context.Context) ([]*models.BestPlayersResult, error) {
	var result []*models.BestPlayersResult
	err := sra.conn.
		WithContext(c).
		Model(&models.PlayerProfile{}).
		Select("player_profiles.*, COUNT(player_profiles.id) AS count_of_wins").
		Joins("JOIN match_participations ON match_participations.player_profile_id = player_profiles.id").
		Where("match_participations.result = ?", "win").
		Group("player_profiles.id").
		Order("count_of_wins DESC").
		Scan(&result).Error
	if err != nil {
		return nil, err
	}

	return result, nil
}
