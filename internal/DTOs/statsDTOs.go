package dtos

import "smaash-web/internal/models"

type TopCharactersDTO struct {
	CharacterReadDTO
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

type BestPlayersDTO struct {
	PlayerProfileReadDTO
	CountOfWins uint `json:"count_of_wins"`
}

func TopCharactersToDTO(topCharacters *models.TopCharactersResult) TopCharactersDTO {
	return TopCharactersDTO{
		CharacterReadDTO: CharacterToDTO(topCharacters.Character),
		CountOfPurchases: topCharacters.CountOfPurchases,
	}
}

func TopPlayersToDTO(topPlayer *models.TopPlayersResult) TopPlayersDTO {
	return TopPlayersDTO{
		PlayerProfileReadDTO: PlayerProfileToReadDTO(topPlayer.PlayerProfile),
		CountOfMatches:       topPlayer.CountOfMatches,
	}
}

func FavouriteCharacterToDTO(fav *models.FavouriteCharacterResult) FavouriteCharactersDTO {
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

func BestPlayersToDTO(topPlayer *models.BestPlayersResult) BestPlayersDTO {
	return BestPlayersDTO{
		PlayerProfileReadDTO: PlayerProfileToReadDTO(topPlayer.PlayerProfile),
		CountOfWins:          topPlayer.CountOfWins,
	}
}
