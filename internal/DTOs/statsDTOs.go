package dtos

import "smaash-web/internal/models"

type TopItemsDTO struct {
	ItemReadDTO
	CountOfPurchases uint `json:"count_of_purchases"`
}

type TopPlayersDTO struct {
	PlayerProfileReadDTO
	CountOfMatches uint `json:"count_of_matches"`
}

type FavouriteCharactersDTO struct {
	CharacterReadDTO
	CountOfPlays uint `json:"count_of_plays"`
}

type TopLevelsDTO struct {
	LevelReadDTO
	CountOfPlays uint `json:"count_of_plays"`
}

func TopItemsToDTO(topItem *models.TopItemsResult) TopItemsDTO {
	return TopItemsDTO{
		ItemReadDTO:      ItemToDTO(topItem.Item),
		CountOfPurchases: topItem.CountOfPurchases,
	}
}

func TopPlayersToDTO(topPlayer *models.TopPlayersResult) TopPlayersDTO {
	return TopPlayersDTO{
		PlayerProfileReadDTO: PlayerProfileToReadDTO(topPlayer.PlayerProfile),
		CountOfMatches:       topPlayer.CountOfMatches,
	}
}

func FavouriteCharacterToDTO(fav models.FavouriteCharacterResult) FavouriteCharactersDTO {
	return FavouriteCharactersDTO{
		CharacterReadDTO: CharacterToDTO(fav.Character),
		CountOfPlays:     fav.CountOfPlays,
	}
}

func TopLevelsToDTO(topLevel *models.TopLevelsResult) TopLevelsDTO {
	return TopLevelsDTO{
		LevelReadDTO: LevelToDTO(topLevel.Level),
		CountOfPlays: topLevel.CountOfPlays,
	}
}
